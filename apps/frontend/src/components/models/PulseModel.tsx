import { useRef, useMemo, createContext, useEffect } from "react";
import {
  useFrame,
  type EventHandlers,
  type InstanceProps,
  type MathProps,
  type ReactProps,
} from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
  useGLTF,
  Merged,
  useAnimations,
} from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import * as THREE from "three";
import type {
  Mutable,
  Overwrite,
} from "@react-three/fiber/dist/declarations/src/core/utils";
import type { JSX } from "react/jsx-runtime";

// GLTF Type definitions
type GLTFResult = GLTF & {
  nodes: {
    TheCorners7__0: THREE.Mesh;
    TheCorners8__0: THREE.Mesh;
    TheCorners5__0: THREE.Mesh;
    TheCorners9__0: THREE.Mesh;
    TheCorners10__0: THREE.Mesh;
    TheCorners4__0: THREE.Mesh;
    TheCorners1__0: THREE.Mesh;
    TheCorners2__0: THREE.Mesh;
    TheCorners16__0: THREE.Mesh;
    TheCorners15__0: THREE.Mesh;
    TheCorners17__0: THREE.Mesh;
    TheCorners13__0: THREE.Mesh;
    TheCorners18__0: THREE.Mesh;
    TheCorners14__0: THREE.Mesh;
    TheCorners19__0: THREE.Mesh;
    TheCorners20__0: THREE.Mesh;
    TheCorners12__0: THREE.Mesh;
    TheCorners11__0: THREE.Mesh;
    TheCorners3__0: THREE.Mesh;
    TheCorners6__0: THREE.Mesh;
    Draht__0: THREE.Mesh;
    Draht1__0: THREE.Mesh;
    Draht2__0: THREE.Mesh;
    Draht3__0: THREE.Mesh;
    Draht4__0: THREE.Mesh;
    Middpoint__0: THREE.Mesh;
    _rootJoint: THREE.Bone;
  };
  materials: {
    ["Scene_-_Root"]: THREE.MeshStandardMaterial;
  };
};

// type ActionName = 'Main';
// type GLTFActions = Record<ActionName, THREE.AnimationAction>;

// Crystal glass materials
const crystalCornerMaterial = new THREE.MeshPhysicalMaterial({
  transmission: 0.9,
  opacity: 0.15,
  metalness: 0,
  roughness: 0.05,
  ior: 1.5,
  thickness: 0.01,
  specularIntensity: 1,
  specularColor: new THREE.Color("#ffffff"),
  envMapIntensity: 1.5,
  clearcoat: 1,
  clearcoatRoughness: 0,
  color: new THREE.Color("#e0f2fe"),
});

const crystalWireMaterial = new THREE.MeshPhysicalMaterial({
  transmission: 0.7,
  opacity: 0.3,
  metalness: 0.1,
  roughness: 0.1,
  ior: 1.5,
  thickness: 0.005,
  specularIntensity: 1.2,
  specularColor: new THREE.Color("#ffffff"),
  envMapIntensity: 2,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
  color: new THREE.Color("#a5f3fc"),
});

const crystalCenterMaterial = new THREE.MeshPhysicalMaterial({
  transmission: 0.95,
  opacity: 0.1,
  metalness: 0,
  roughness: 0.02,
  ior: 1.8,
  thickness: 0.02,
  specularIntensity: 1.5,
  specularColor: new THREE.Color("#ffffff"),
  envMapIntensity: 2,
  clearcoat: 1,
  clearcoatRoughness: 0,
  color: new THREE.Color("#f0f9ff"),
});

const context = createContext<any>(null);

export function Instances({
  children,
  ...props
}: {
  children?: React.ReactNode;
  [key: string]: any;
}) {
  const { nodes } = useGLTF(
    "/models/dodekaden_orb.glb"
  ) as unknown as GLTFResult;

  const instances = useMemo(() => {
    // Apply crystal materials to all meshes
    const applyMaterials = (
      mesh: THREE.Mesh<
        THREE.BufferGeometry<
          THREE.NormalBufferAttributes,
          THREE.BufferGeometryEventMap
        >,
        THREE.Material | THREE.Material[],
        THREE.Object3DEventMap
      >,
      material: THREE.MeshPhysicalMaterial
    ) => {
      if (mesh && mesh.material) {
        mesh.material = material;
      }
      return mesh;
    };

    return {
      TheCorners: applyMaterials(nodes.TheCorners7__0, crystalCornerMaterial),
      TheCorners1: applyMaterials(nodes.TheCorners8__0, crystalCornerMaterial),
      TheCorners2: applyMaterials(nodes.TheCorners5__0, crystalCornerMaterial),
      TheCorners3: applyMaterials(nodes.TheCorners9__0, crystalCornerMaterial),
      TheCorners4: applyMaterials(nodes.TheCorners10__0, crystalCornerMaterial),
      TheCorners5: applyMaterials(nodes.TheCorners4__0, crystalCornerMaterial),
      TheCorners6: applyMaterials(nodes.TheCorners1__0, crystalCornerMaterial),
      TheCorners7: applyMaterials(nodes.TheCorners2__0, crystalCornerMaterial),
      TheCorners8: applyMaterials(nodes.TheCorners16__0, crystalCornerMaterial),
      TheCorners9: applyMaterials(nodes.TheCorners15__0, crystalCornerMaterial),
      TheCorners10: applyMaterials(
        nodes.TheCorners17__0,
        crystalCornerMaterial
      ),
      TheCorners11: applyMaterials(
        nodes.TheCorners13__0,
        crystalCornerMaterial
      ),
      TheCorners12: applyMaterials(
        nodes.TheCorners18__0,
        crystalCornerMaterial
      ),
      TheCorners13: applyMaterials(
        nodes.TheCorners14__0,
        crystalCornerMaterial
      ),
      TheCorners14: applyMaterials(
        nodes.TheCorners19__0,
        crystalCornerMaterial
      ),
      TheCorners15: applyMaterials(
        nodes.TheCorners20__0,
        crystalCornerMaterial
      ),
      TheCorners16: applyMaterials(
        nodes.TheCorners12__0,
        crystalCornerMaterial
      ),
      TheCorners17: applyMaterials(
        nodes.TheCorners11__0,
        crystalCornerMaterial
      ),
      TheCorners18: applyMaterials(nodes.TheCorners3__0, crystalCornerMaterial),
      TheCorners19: applyMaterials(nodes.TheCorners6__0, crystalCornerMaterial),
      Draht: applyMaterials(nodes.Draht__0, crystalWireMaterial),
      Draht1: applyMaterials(nodes.Draht1__0, crystalWireMaterial),
      Draht2: applyMaterials(nodes.Draht2__0, crystalWireMaterial),
      Draht3: applyMaterials(nodes.Draht3__0, crystalWireMaterial),
      Draht4: applyMaterials(nodes.Draht4__0, crystalWireMaterial),
      Middpoint: applyMaterials(nodes.Middpoint__0, crystalCenterMaterial),
    };
  }, [nodes]);

  return (
    <Merged meshes={instances} {...props}>
      {(instances) => (
        <context.Provider value={instances} children={children} />
      )}
    </Merged>
  );
}

export function Model(
  props: JSX.IntrinsicAttributes &
    Mutable<
      Overwrite<
        Partial<
          Overwrite<
            THREE.Group<THREE.Object3DEventMap>,
            MathProps<THREE.Group<THREE.Object3DEventMap>> &
              ReactProps<THREE.Group<THREE.Object3DEventMap>> &
              Partial<EventHandlers>
          >
        >,
        Omit<
          InstanceProps<
            THREE.Group<THREE.Object3DEventMap>,
            typeof THREE.Group
          >,
          "object"
        >
      >
    >
) {
  // const instances = useContext(context);
  const group = useRef<THREE.Group>(null);
  const { nodes, animations } = useGLTF(
    "/models/dodekaden_orb.glb"
  ) as unknown as GLTFResult;
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    // Play the main animation if it exists
    if (actions.Main) {
      actions.Main.play();
    }
  }, [actions]);

  useFrame((state) => {
    if (group.current) {
      // Gentle floating animation
      group.current.rotation.y += 0.008;
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.1;
      group.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.6) * 0.05;
    }
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Sketchfab_Scene">
        <group
          name="Sketchfab_model"
          rotation={[-Math.PI / 2, 0, 0]}
          userData={{ name: "Sketchfab_model" }}
        >
          <group
            name="a954207e9457422c9e2bd243a84c3bcefbx"
            rotation={[Math.PI / 2, 0, 0]}
            userData={{ name: "a954207e9457422c9e2bd243a84c3bce.fbx" }}
          >
            <group name="Object_2" userData={{ name: "Object_2" }}>
              <group name="RootNode" userData={{ name: "RootNode" }}>
                <group name="Object_4" userData={{ name: "Object_4" }}>
                  <primitive object={nodes._rootJoint} />
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

// Preload the GLTF
useGLTF.preload("/models/dodekaden_orb.glb");

export function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} />
      <OrbitControls enableZoom={false} enablePan={false} />
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />
      <pointLight position={[10, -10, 10]} intensity={0.5} color="#ec4899" />

      {/* Environment for reflections */}
      <Environment preset="city" />

      <Instances>
        <Model />
      </Instances>
    </>
  );
}
