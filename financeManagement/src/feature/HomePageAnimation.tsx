import { Canvas, useFrame } from "@react-three/fiber";
import { useState } from "react";
import * as THREE from "three";
import { Suspense } from "react";
import { Preload, useCursor } from "@react-three/drei";
import { Model, Fragments } from "./Text";

function Scene() {
  const vec = new THREE.Vector3();
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  useFrame((state) => {
    state.camera.position.lerp(
      vec.set(clicked ? -10 : 0, clicked ? 10 : 0, 20),
      0.1
    );
    state.camera.lookAt(0, 0, 0);
  });
  return (
    <group>
      <Fragments visible={clicked} />
      <Model
        visible={!clicked}
        onClick={() => setClicked(true)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      />
    </group>
  );
}

export function HomePageAnimation() {
  return (
    <>
      <Canvas dpr={[1, 2]} orthographic camera={{ zoom: 230 }}>
        <ambientLight />
        <Suspense fallback={null}>
          <Scene />
          <Preload all />
        </Suspense>
      </Canvas>
    </>
  );
}
