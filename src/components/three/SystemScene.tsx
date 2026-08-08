import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import Desk from "./Desk";
import type { Spot } from "./spots";
import { useDarkMode } from "./useDarkMode";
import { useBrandHue } from "@/lib/themes";

function Rig({
  hue,
  dark,
  reduced,
  onHover,
}: {
  hue: number;
  dark: boolean;
  reduced: boolean;
  onHover: (s: Spot) => void;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }, delta) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    // Turntable biased to a 3/4 view — head-on would hide the figure behind the chair.
    const spin = reduced ? 0.55 : 0.55 + Math.sin(t * 0.13) * 0.2;
    const targetY = spin + pointer.x * 0.18;
    const targetX = -pointer.y * 0.08;
    const k = 1 - Math.pow(0.002, delta);
    group.current.rotation.y += (targetY - group.current.rotation.y) * k;
    group.current.rotation.x += (targetX - group.current.rotation.x) * k;
    // Sunk so the diorama's visual centre, not its floor, sits mid-frame.
    group.current.position.y = -0.85 + (reduced ? 0 : Math.sin(t * 0.6) * 0.05);
  });

  return (
    <group ref={group}>
      <Desk hue={hue} dark={dark} reduced={reduced} onHover={onHover} />
    </group>
  );
}

const SystemScene = ({ onHover }: { onHover: (s: Spot) => void }) => {
  const [reduced, setReduced] = useState(false);
  const hue = useBrandHue();
  const dark = useDarkMode();

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // A stray pointerout can leave the caption stuck on after the cursor leaves.
  useEffect(() => () => { document.body.style.cursor = ""; }, []);

  return (
    <Canvas
      shadows
      camera={{ position: [6.4, 4.0, 7.0], fov: 30 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => onHover(null)}
    >
      {/* Day: warm daylight key. Night: almost nothing, so the desk lamp does the work. */}
      <ambientLight intensity={dark ? 0.3 : 0.7} />
      <hemisphereLight
        intensity={dark ? 0.22 : 0.6}
        color={dark ? "#6d80a6" : "#fff6e6"}
        groundColor={dark ? "#141010" : "#c9b697"}
      />
      <directionalLight
        position={[5, 7, 4]}
        intensity={dark ? 0.22 : 1.6}
        color={dark ? "#8ea4c8" : "#fff3de"}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <directionalLight position={[-5, 3, -4]} intensity={dark ? 0.12 : 0.35} color="#93aacb" />

      <Rig hue={hue} dark={dark} reduced={reduced} onHover={onHover} />

      <ContactShadows
        position={[0, -1.32, 0]}
        opacity={dark ? 0.55 : 0.4}
        scale={11}
        blur={2.6}
        far={4}
      />

      {/* Only at night, and gently — it's there to bloom the lamp and screen, not the whole scene. */}
      {dark && (
        <EffectComposer>
          <Bloom intensity={0.34} luminanceThreshold={0.82} luminanceSmoothing={0.3} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  );
};

export default SystemScene;
