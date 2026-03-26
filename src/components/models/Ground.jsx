import { usePlane } from "@react-three/cannon";
import React from "react";

const Ground = (props) => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: props.position ?? [0, 0, 0],
    // args: [100, 100],
    ...props,
  }));
  return (
    <mesh ref={ref}>
      <planeGeometry args={[5, 5]} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
};

export default Ground;
