import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Sky } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.cjs";
import { useRef, useState } from "react";
import { useTheme } from "@/components/theme-provider";

function Stars(props: any) {
  const ref = useRef();
  const { theme } = useTheme();
  const [sphere] = useState(() =>
    random.inSphere(new Float32Array(5000), { radius: 1.5 })
  );

  useFrame((_state, delta) => {
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points
        ref={ref}
        positions={sphere}
        stride={3}
        frustumCulled={false}
        {...props}
      >
        <PointMaterial
          transparent
          color={theme === "dark" ? "#B3E5FC" : "#1e12a1"}
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

export function BackgroupAnimation() {
  const { theme } = useTheme();

  return (
    <>
      {theme === "dark" ? (
        <Canvas camera={{ position: [0, 0, 1] }} className="bg-[#1D1F20]">
          <Stars />
        </Canvas>
      ) : (
        <Canvas camera={{ position: [0, 0, 1] }}>
          <Sky />
        </Canvas>
      )}
    </>
  );
}
