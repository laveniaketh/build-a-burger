import { useRef, useEffect, useMemo } from "react";
import { useBox } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Cheese with bendy, jelly-like physics deformation.
 *
 * Bendy feel is achieved through:
 *  - Per-vertex sinusoidal wave deformation on the geometry each frame
 *    (the cheese literally bends and ripples through its thickness)
 *  - Independent X and Z bend springs so corners lag behind the center
 *  - Squash-and-stretch spring on Y as before
 *  - Torsional wobble: the mesh twists around Y based on angular velocity
 *  - Very low physics damping so motion lingers and oscillates
 */

// Number of segments — more = smoother bending
const SEG = 12;

const Cheese = (props) => {
  const {
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    color = "#F5C842",
    ...rest
  } = props;

  // ─── Physics body ─────────────────────────────────────────────────────────
  const [ref, api] = useBox(() => ({
    mass: 0.018,
    args: [1.6, 0.065, 1.56],
    position,
    rotation,
    material: { friction: 0.35, restitution: 0.1 },
    linearDamping: 0.7,
    angularDamping: 0.5,
    sleepSpeedLimit: 0.04,
    sleepTimeLimit: 2.0,
    ...rest,
  }));

  // ─── Live physics state ────────────────────────────────────────────────────
  const velocityRef = useRef(new THREE.Vector3());
  const angVelocityRef = useRef(new THREE.Vector3());

  useEffect(() => {
    const u1 = api.velocity.subscribe((v) =>
      velocityRef.current.set(v[0], v[1], v[2]),
    );
    const u2 = api.angularVelocity.subscribe((v) =>
      angVelocityRef.current.set(v[0], v[1], v[2]),
    );
    return () => {
      u1();
      u2();
    };
  }, [api.velocity, api.angularVelocity]);

  // ─── Geometry (high-segment box so vertices can actually bend) ─────────────
  const geometry = useMemo(
    () => new THREE.BoxGeometry(1.6, 0.065, 1.56, SEG, 1, SEG),
    [],
  );

  // Store original vertex positions so we can deform relative to rest pose
  const basePositions = useMemo(() => {
    const pos = geometry.attributes.position;
    return Float32Array.from(pos.array);
  }, [geometry]);

  const meshRef = useRef();

  // ─── Spring banks ──────────────────────────────────────────────────────────
  const springY = useRef({ v: 1, dv: 0 }); // squash-stretch Y
  const bendX = useRef({ v: 0, dv: 0 }); // bend along X axis
  const bendZ = useRef({ v: 0, dv: 0 }); // bend along Z axis
  const torsion = useRef({ v: 0, dv: 0 }); // twist around Y
  const ripple = useRef(0); // travelling wave phase

  const STIFF = 43;
  const DAMP = 8;
  const BEND_S = 0.05;
  const TORS_S = 0.06;

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const vel = velocityRef.current;
    const ang = angVelocityRef.current;
    const speed = vel.length();

    // ── Advance ripple phase (continuous travelling wave) ──────────────────
    ripple.current += delta * (3.5 + speed * 2.5);

    // ── Spring: Y squash ───────────────────────────────────────────────────
    const targetY = 1 - Math.min(speed * 0.12, 0.15);
    stepSpring(springY.current, targetY, STIFF, DAMP, delta);

    // ── Spring: X bend (driven by X & Y velocity) ─────────────────────────
    const targetBX = -vel.x * BEND_S - vel.y * BEND_S * 0.5;
    stepSpring(bendX.current, targetBX, STIFF * 0.7, DAMP * 0.6, delta);

    // ── Spring: Z bend ─────────────────────────────────────────────────────
    const targetBZ = -vel.z * BEND_S - vel.y * BEND_S * 0.5;
    stepSpring(bendZ.current, targetBZ, STIFF * 0.7, DAMP * 0.6, delta);

    // ── Spring: torsion (twist around Y) ──────────────────────────────────
    const targetTors = ang.y * TORS_S;
    stepSpring(torsion.current, targetTors, STIFF * 0.5, DAMP * 0.5, delta);

    // ── Deform vertices ────────────────────────────────────────────────────
    const pos = meshRef.current.geometry.attributes.position;
    const base = basePositions;
    const scaleY = Math.max(0.35, springY.current.v);
    const bx = bendX.current.v;
    const bz = bendZ.current.v;
    const tors = torsion.current.v;
    const rph = ripple.current;

    for (let i = 0; i < pos.count; i++) {
      const i3 = i * 3;
      const bx0 = base[i3];
      const by0 = base[i3 + 1];
      const bz0 = base[i3 + 2];

      // Normalised U/V position on the slab (-1 … +1)
      const u = bx0 / 0.8; // along X
      const w = bz0 / 0.78; // along Z

      // ── Bend: corners droop in direction of motion ──────────────────────
      //    quadratic so center stays put, edges swing
      const bendOffsetY = bx * u * u + bz * w * w;

      // ── Twist: vertices rotate around Y proportional to their distance ──
      const r = Math.sqrt(bx0 * bx0 + bz0 * bz0);
      const twistAngle = tors * r;
      const cosT = Math.cos(twistAngle);
      const sinT = Math.sin(twistAngle);
      const tx = bx0 * cosT - bz0 * sinT;
      const tz = bx0 * sinT + bz0 * cosT;

      // ── Ripple: travelling sine wave across surface ──────────────────────
      const rippleAmp = Math.min(speed * 0.008, 0.006);
      const rippleY =
        Math.sin(u * Math.PI * 2 + rph) *
        Math.sin(w * Math.PI * 1.5 + rph * 0.7) *
        rippleAmp;

      const finalY = by0 * scaleY + bendOffsetY + rippleY;
      const xzScale = 1 + (1 - scaleY) * 0.2;

      pos.setXYZ(i, tx * xzScale, finalY, tz * xzScale);
    }

    pos.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  return (
    <group ref={ref}>
      <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.04}
          transparent
          opacity={0.97}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Gloss highlight layer */}
      <mesh position={[0, 0.038, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.4, 1.36]} />
        <meshStandardMaterial
          color="#FFFFFF"
          transparent
          opacity={0.07}
          roughness={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

// ─── Shared spring stepper ─────────────────────────────────────────────────
function stepSpring(spring, target, stiffness, damping, dt) {
  const disp = spring.v - target;
  const acc = -stiffness * disp - damping * spring.dv;
  spring.dv += acc * dt;
  spring.v += spring.dv * dt;
}

export default Cheese;
