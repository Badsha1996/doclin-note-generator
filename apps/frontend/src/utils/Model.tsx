import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export function Model() {
  const { scene } = useGLTF("/models/scene.gltf");
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshPhysicalMaterial({
          transmission: 1,
          thickness: 1.0,
          roughness: 0.0,
          metalness: 0,
          clearcoat: 1,
          clearcoatRoughness: 0,
          reflectivity: 0.9,
          ior: 1.52,
          iridescence: 0.8,
          iridescenceIOR: 1.3,
          attenuationColor: new THREE.Color("84BAE8"),
          attenuationDistance: 1.5,
          transparent: true,
          opacity: 0.9,
        });
      }
    });
  }, [scene]);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      const t = clock.getElapsedTime();
      materialRef.current.iridescence = 0.3 + Math.sin(t * 0.5) * 0.05;
    }
  });

  return (
    <group scale={0.8} position={[0, -0.2, 0]}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/models/scene.gltf");
