import {
  Physics,
  useBox,
  useSphere,
  useConeTwistConstraint,
} from "@react-three/cannon";
import { useRef } from "react";

const SEGMENTS = 6; // more = bendier
const SEG_HEIGHT = 0.3;
const SEG_GAP = SEG_HEIGHT + 0.02;

function Segment({ position, prevRef, isFirst }) {
  const [ref, api] = useBox(() => ({
    mass: isFirst ? 0 : 1, // first segment is static (anchor)
    position,
    args: [0.4, SEG_HEIGHT, 0.4],
  }));

  // connect this segment to the one above it
  useConeTwistConstraint(prevRef, ref, {
    pivotA: [0, -SEG_GAP / 2, 0], // bottom of parent
    pivotB: [0, SEG_GAP / 2, 0], // top of child
    axisA: [0, 1, 0],
    axisB: [0, 1, 0],
    twistAngle: 0, // no twist
    angle: Math.PI / 8, // ~22° bend limit — raise for floppier
  });

  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[0.4, SEG_HEIGHT, 0.4]} />
      <meshStandardMaterial color={isFirst ? "orange" : "royalblue"} />
    </mesh>
  );
}

const BendyBox = () => {
  // create refs array for chaining
  const refs = Array.from({ length: SEGMENTS }, () => useRef());

  // anchor ref for the first (static) segment
  const [anchorRef] = useBox(() => ({
    mass: 0,
    position: [0, SEGMENTS * SEG_GAP, 0],
    args: [0.4, SEG_HEIGHT, 0.4],
  }));

  return (
    <>
      <mesh ref={anchorRef}>
        <boxGeometry args={[0.4, SEG_HEIGHT, 0.4]} />
        <meshStandardMaterial color="orange" />
      </mesh>

      {refs.map((ref, i) => (
        <Segment
          key={i}
          ref={ref}
          position={[0, (SEGMENTS - i - 1) * SEG_GAP, 0]}
          prevRef={i === 0 ? anchorRef : refs[i - 1]}
          isFirst={false}
        />
      ))}
    </>
  );
};

export default BendyBox;
