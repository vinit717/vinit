import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const SKIN = "#c98a63";
const SKIN_DARK = "#b1734f";
const HAIR = "#2a201a";

/* Rotation about +x sends the limb's local -y toward -z, i.e. toward the desk.
   These are the resting angles that land the hands on the keyboard. */
const SHOULDER_REST = 1.35;
const ELBOW_REST = 0.2;

function Hand({ inner }: { inner: string }) {
  return (
    <group>
      <RoundedBox args={[0.105, 0.045, 0.1]} radius={0.02} smoothness={3} castShadow>
        <meshStandardMaterial color={inner} roughness={0.7} />
      </RoundedBox>
      {/* fingers, splayed slightly — reads as a hand rather than a paddle */}
      {[-0.034, 0, 0.034].map((x) => (
        <mesh key={x} position={[x, -0.004, -0.072]} rotation={[0, x * 3, 0]} castShadow>
          <capsuleGeometry args={[0.014, 0.05, 3, 8]} />
          <meshStandardMaterial color={inner} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Seen from behind-right, so no face is needed — the read comes from
 * proportion, shoulder slope and hair silhouette, plus hands that work.
 */
const Person = ({ shirt, reduced }: { shirt: THREE.Color; reduced: boolean }) => {
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const shoulders = useRef<(THREE.Group | null)[]>([null, null]);
  const elbows = useRef<(THREE.Group | null)[]>([null, null]);
  const hands = useRef<(THREE.Group | null)[]>([null, null]);

  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.elapsedTime;

    // A 19s loop: mostly typing, with one slow stretch near the end.
    const cycle = t % 19;
    const stretch = cycle > 15.5 ? Math.sin(((cycle - 15.5) / 3.5) * Math.PI) : 0;
    const typing = 1 - stretch;

    if (torso.current) {
      torso.current.rotation.x = -0.2 + stretch * 0.34;
      torso.current.scale.y = 1 + Math.sin(t * 1.6) * 0.008; // breathing
    }

    if (head.current) {
      head.current.rotation.y = Math.sin(t * 0.35) * 0.16 + Math.sin(t * 0.11) * 0.1;
      head.current.rotation.x = 0.08 - stretch * 0.5 + Math.sin(t * 0.5) * 0.03;
    }

    // Hands alternate rather than move in lockstep, which is what sells typing.
    [0, 1].forEach((i) => {
      const tap = Math.sin(t * 11 + i * 2.1) * 0.5 + 0.5;
      const s = shoulders.current[i];
      const e = elbows.current[i];
      const h = hands.current[i];
      if (s) s.rotation.x = SHOULDER_REST - stretch * 1.5;
      if (e) e.rotation.x = ELBOW_REST + stretch * 0.5;
      if (h) h.position.y = -0.3 + tap * 0.024 * typing;
    });
  });

  const arm = (side: -1 | 1) => {
    const i = side === -1 ? 0 : 1;
    return (
      <group
        ref={(el) => (shoulders.current[i] = el)}
        position={[0.25 * side, 0.44, -0.05]}
        rotation={[SHOULDER_REST, 0, 0.14 * side]}
      >
        <mesh position={[0, -0.16, 0]} castShadow>
          <capsuleGeometry args={[0.062, 0.22, 4, 12]} />
          <meshStandardMaterial color={shirt} roughness={0.85} />
        </mesh>
        {/* short sleeve cuff */}
        <mesh position={[0, -0.27, 0]} castShadow>
          <cylinderGeometry args={[0.066, 0.06, 0.035, 14]} />
          <meshStandardMaterial color={shirt} roughness={0.8} />
        </mesh>
        <group ref={(el) => (elbows.current[i] = el)} position={[0, -0.32, 0]} rotation={[ELBOW_REST, 0, 0]}>
          <mesh position={[0, -0.15, 0]} castShadow>
            <capsuleGeometry args={[0.05, 0.2, 4, 12]} />
            <meshStandardMaterial color={SKIN} roughness={0.7} />
          </mesh>
          <group ref={(el) => (hands.current[i] = el)} position={[0, -0.3, 0]}>
            <Hand inner={SKIN_DARK} />
          </group>
        </group>
      </group>
    );
  };

  return (
    <group position={[0.16, 0, 1.06]}>
      {/* thighs and shins, mostly tucked under the desk */}
      {[-0.15, 0.15].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.6, -0.24]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <capsuleGeometry args={[0.078, 0.34, 4, 12]} />
            <meshStandardMaterial color="#3d3833" roughness={0.85} />
          </mesh>
          <mesh position={[x, 0.32, -0.44]} castShadow>
            <capsuleGeometry args={[0.064, 0.38, 4, 12]} />
            <meshStandardMaterial color="#3d3833" roughness={0.85} />
          </mesh>
        </group>
      ))}

      <group ref={torso} position={[0, 0.62, 0]} rotation={[-0.2, 0, 0]}>
        <RoundedBox args={[0.46, 0.52, 0.29]} radius={0.13} smoothness={4} position={[0, 0.24, 0]} castShadow>
          <meshStandardMaterial color={shirt} roughness={0.85} />
        </RoundedBox>
        {/* shoulder bar gives the slope a box can't */}
        <mesh position={[0, 0.44, -0.02]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.105, 0.3, 4, 14]} />
          <meshStandardMaterial color={shirt} roughness={0.85} />
        </mesh>

        {arm(-1)}
        {arm(1)}

        <mesh position={[0, 0.53, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.065, 0.11, 16]} />
          <meshStandardMaterial color={SKIN_DARK} roughness={0.75} />
        </mesh>
        {/* collar */}
        <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.078, 0.022, 10, 20]} />
          <meshStandardMaterial color={shirt} roughness={0.8} />
        </mesh>

        <group ref={head} position={[0, 0.66, -0.02]}>
          <mesh scale={[1, 1.08, 1.02]} castShadow>
            <sphereGeometry args={[0.132, 22, 22]} />
            <meshStandardMaterial color={SKIN} roughness={0.72} />
          </mesh>
          {/* hair: cap over the crown, fuller at the back, small sweep at the side */}
          <mesh position={[0, 0.026, 0.012]} scale={[1.06, 1.02, 1.06]} castShadow>
            <sphereGeometry args={[0.134, 22, 22, 0, Math.PI * 2, 0, Math.PI * 0.56]} />
            <meshStandardMaterial color={HAIR} roughness={0.92} />
          </mesh>
          <mesh position={[0, -0.012, 0.058]} scale={[0.96, 0.9, 0.6]} castShadow>
            <sphereGeometry args={[0.132, 18, 18]} />
            <meshStandardMaterial color={HAIR} roughness={0.92} />
          </mesh>
          <mesh position={[-0.088, 0.052, -0.05]} rotation={[0, 0, 0.5]} scale={[0.5, 0.3, 0.55]} castShadow>
            <sphereGeometry args={[0.132, 14, 14]} />
            <meshStandardMaterial color={HAIR} roughness={0.92} />
          </mesh>
          {[-0.125, 0.125].map((x) => (
            <mesh key={x} position={[x, -0.012, 0.014]} scale={[0.45, 1, 0.68]}>
              <sphereGeometry args={[0.038, 10, 10]} />
              <meshStandardMaterial color={SKIN_DARK} roughness={0.75} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

export default Person;
