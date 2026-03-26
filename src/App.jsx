import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import BottomBun from "./components/models/BottomBun";
import Lettuce from "./components/models/Lettuce";
import Patty from "./components/models/Patty";
import Cheese from "./components/models/Cheese";
import Onion from "./components/models/Onion";
import Pickle from "./components/models/Pickle";
import TopBun from "./components/models/TopBun";
import Tomato from "./components/models/Tomato";
import { Debug, Physics } from "@react-three/cannon";
import Ground from "./components/models/Ground";

const App = () => {
  const aspect = window.innerWidth / window.innerHeight;
  return (
    <Canvas
      camera={{
        fov: 45,
        aspect: aspect,
        near: 0.1,
        far: 100,
        position: [4, 7, 6],
      }}
    >
      <color attach="background" args={["skyblue"]} />
      <ambientLight intensity={1} color="#fffbe8" />
      <directionalLight intensity={1} position={[10, 20, 0]} color="#ffffff" />
      <OrbitControls />
      <Physics iterations={20} tolerance={0.001} allowSleep={true}>
        {/* <Debug color="black" scale={1}> */}
        <TopBun scale={0.1} position={[0, 8, 0]} />
        <Pickle scale={0.1} position={[-0.5, 6, 0.25]} />
        <Pickle scale={0.1} position={[-0.5, 6, -0.25]} />
        <Pickle scale={0.1} position={[0.7, 6, 0]} />
        <Onion scale={0.1} position={[0.1, 6, 0.4]} />
        <Onion scale={0.1} position={[0.1, 6, -0.5]} />
        <Tomato scale={0.1} position={[0, 5, 0]} />
        <Cheese scale={0.1} position={[0, 4, 0]} />
        <Patty scale={0.1} position={[0, 3, 0]} />
        <Lettuce scale={0.1} position={[0, 2, 0]} />
        <BottomBun scale={0.1} position={[0, 1, 0]} />

        <Ground position={[0, -1, 0]} />
        {/* </Debug> */}
      </Physics>
    </Canvas>
  );
};

export default App;
