import { usePlane } from "@react-three/cannon";
import React from "react";

const Ground = (props) => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: props.position ?? [0, 0, 0],
    ...props,
  }));
  return (
    <mesh ref={ref}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="green" />
    </mesh>
  );
};

export default Ground;
