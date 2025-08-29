import { createFileRoute } from "@tanstack/react-router";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Float } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { Model } from "@/utils/Model";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="">
      <Canvas
        camera={{ position: [0, 1, 3], fov: 50 }}
        shadows
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
          gl.outputColorSpace = THREE.LinearSRGBColorSpace;
        }}
      >
        <ambientLight intensity={0.4} />
       <Environment preset="sunset" background={false} blur={0.6} />
        <Float speed={2} rotationIntensity={1} floatIntensity={1.2}>
          <Model />
        </Float>
        <OrbitControls enableZoom={true} />
        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
