import { useBox } from "@react-three/cannon";

const Cheese = (props) => {
  const [ref] = useBox(() => ({
    mass: 0.025,
    args: [1.6, 0.05, 1.56],
    position: props.position ?? [0, 0, 0],
    rotation: props.rotation ?? [0, 0, 0],
    material: { friction: 0.3, restitution: 0.1 },
    linearDamping: 0.5,
    angularDamping: 0.2,
    sleepSpeedLimit: 0.1,
    sleepTimeLimit: 0.5,
    ...props,
  }));
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1.6, 0.065, 1.56]} />
      <meshStandardMaterial color="#F5C842" />
    </mesh>
  );
};

export default Cheese;
