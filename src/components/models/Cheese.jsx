import React from "react";
import { useGLTF } from "@react-three/drei";
import { useBox } from "@react-three/cannon";

function Cheese(props) {
  const { nodes, materials } = useGLTF("/models/cheese.glb");

  // Cheese is a thin, floppy square slice – box collider, very light
  const [ref] = useBox(() => ({
    mass: 0.025, // ~25g – thin cheese slice
    args: [1.5, 0.065, 1.5],
    position: props.position ?? [0, 0, 0],
    rotation: props.rotation ?? [0, 0, 0], // slight random angle like a real slice
    material: { friction: 0.3, restitution: 0.1 },
    linearDamping: 0.8,
    angularDamping: 0.9,
    sleepSpeedLimit: 0.1,
    sleepTimeLimit: 0.5,
    ...props.physicsProps,
  }));

  return (
    <group {...props} dispose={null} ref={ref}>
      <mesh
        geometry={nodes.Plane001_burger_0.geometry}
        material={materials.burger}
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={0.1}
      />
    </group>
  );
}

useGLTF.preload("/cheese.glb");

export default Cheese;
