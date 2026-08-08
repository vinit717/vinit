import { ReactNode, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { makeScreenTexture } from "./screenTexture";
import Person from "./Person";
import type { Spot } from "./spots";

type Palette = ReturnType<typeof palette>;

function palette(dark: boolean) {
  return {
    island: dark ? "#2a221c" : "#e6dac2",
    wood: dark ? "#7d5636" : "#b07f52",
    woodDark: dark ? "#5b3d26" : "#8a6039",
    metal: dark ? "#332c26" : "#4a4038",
    metalLight: dark ? "#4a413a" : "#6b5f53",
    chair: dark ? "#3d342d" : "#514539",
    leaf: dark ? "#5c7350" : "#748c66",
    leafAlt: dark ? "#6d8560" : "#87a077",
    pot: dark ? "#a2603f" : "#c07a53",
    paper: dark ? "#d8cdb8" : "#faf4e6",
    key: dark ? "#4a423a" : "#efe6d4",
    rug: dark ? "#3a2f27" : "#cdb897",
  };
}

/** Wraps a prop of the diorama so hovering it reports a label to the overlay. */
function Hotspot({
  id,
  onHover,
  children,
}: {
  id: Exclude<Spot, null>;
  onHover: (s: Spot) => void;
  children: ReactNode;
}) {
  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
        document.body.style.cursor = "";
      }}
    >
      {children}
    </group>
  );
}

function Monitor({ hue, dark, p }: { hue: number; dark: boolean; p: Palette }) {
  const frames = useMemo(
    () => [makeScreenTexture(hue, true), makeScreenTexture(hue, false)],
    [hue],
  );
  useEffect(() => () => frames.forEach((f) => f.dispose()), [frames]);

  const screen = useRef<THREE.MeshStandardMaterial>(null);
  const shown = useRef(-1);

  useFrame(({ clock }) => {
    if (!screen.current) return;
    const next = Math.floor(clock.elapsedTime * 1.6) % 2;
    if (next === shown.current) return;
    shown.current = next;
    screen.current.map = frames[next];
    screen.current.emissiveMap = frames[next];
    screen.current.needsUpdate = true;
  });

  return (
    <group position={[0, 0, -0.44]}>
      <mesh position={[0, 0.9, 0.06]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.34, 0.035, 28]} />
        <meshStandardMaterial color={p.metal} roughness={0.45} metalness={0.4} />
      </mesh>
      <mesh position={[0, 1.12, 0.02]} rotation={[0.08, 0, 0]} castShadow>
        <boxGeometry args={[0.11, 0.44, 0.07]} />
        <meshStandardMaterial color={p.metal} roughness={0.45} metalness={0.4} />
      </mesh>

      <group position={[0, 1.82, 0]} rotation={[-0.06, 0, 0]}>
        {/* thin bezel: back shell slightly larger than the lit panel */}
        <RoundedBox args={[2.08, 1.24, 0.06]} radius={0.04} smoothness={4} castShadow>
          <meshStandardMaterial color={p.metal} roughness={0.42} metalness={0.4} />
        </RoundedBox>
        <mesh position={[0, 0, 0.033]} userData={{ keepMaterial: true }}>
          <planeGeometry args={[1.98, 1.145]} />
          <meshStandardMaterial
            ref={screen}
            map={frames[0]}
            emissiveMap={frames[0]}
            emissive="#ffffff"
            emissiveIntensity={dark ? 1.1 : 0.5}
            roughness={0.24}
          />
        </mesh>
      </group>

      {/* at night the monitor is a real light source — cool spill that keeps the
          scene from going entirely lamp-orange, and separates the figure from the desk */}
      {dark && (
        <pointLight
          position={[0, 1.75, 0.75]}
          color="#a8c4ff"
          intensity={6}
          distance={4}
          decay={2}
        />
      )}
    </group>
  );
}

/** Individual keycaps — the single biggest readability win on the desk. */
function Keyboard({ p, brand }: { p: Palette; brand: THREE.Color }) {
  const COLS = 15;
  const ROWS = 4;
  const KEY = 0.072;
  const GAP_X = 0.09;
  const GAP_Z = 0.093;

  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const m = new THREE.Matrix4();
    let i = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        m.setPosition(
          (c - (COLS - 1) / 2) * GAP_X,
          0,
          (r - (ROWS - 1) / 2) * GAP_Z,
        );
        ref.current.setMatrixAt(i++, m);
      }
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group position={[0, 0.958, 0.36]}>
      <instancedMesh ref={ref} args={[undefined, undefined, COLS * ROWS]} castShadow>
        <boxGeometry args={[KEY, 0.022, KEY]} />
        <meshStandardMaterial color={p.key} roughness={0.72} />
      </instancedMesh>
      {/* spacebar sits proud of the bottom row */}
      <mesh position={[0, 0, 0.232]} castShadow>
        <boxGeometry args={[0.5, 0.022, KEY]} />
        <meshStandardMaterial color={p.key} roughness={0.72} />
      </mesh>
      {/* one accent keycap — the brand colour showing up where you'd actually put it */}
      <mesh position={[-0.63, 0.002, -0.14]} castShadow>
        <boxGeometry args={[KEY, 0.026, KEY]} />
        <meshStandardMaterial color={brand} roughness={0.55} />
      </mesh>
    </group>
  );
}

function Mug({ color, reduced }: { color: THREE.Color; reduced: boolean }) {
  const steam = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!steam.current || reduced) return;
    steam.current.children.forEach((puff, i) => {
      const t = (clock.elapsedTime * 0.42 + i * 0.33) % 1;
      puff.position.y = t * 0.5;
      puff.position.x = Math.sin(t * 5 + i) * 0.045;
      puff.scale.setScalar((0.4 + t * 0.9) * 0.09);
      const m = (puff as THREE.Mesh).material as THREE.MeshStandardMaterial;
      m.opacity = Math.sin(t * Math.PI) * 0.28;
    });
  });

  return (
    <group position={[1.06, 0.9, 0.34]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.125, 0.105, 0.22, 28]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      <mesh position={[0.15, 0.015, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.058, 0.017, 12, 24]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      {/* coffee surface, inset so the rim reads as a wall */}
      <mesh position={[0, 0.098, 0]}>
        <cylinderGeometry args={[0.108, 0.108, 0.008, 28]} />
        <meshStandardMaterial color="#3a2116" roughness={0.15} />
      </mesh>

      <group ref={steam} position={[0, 0.14, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Plant({ p }: { p: Palette }) {
  // stem angle, height, leaf tilt — splayed so it reads as a plant, not a blob
  const stems: [number, number, number][] = [
    [0, 0.42, 0],
    [0.9, 0.34, 0.5],
    [2.1, 0.38, 0.42],
    [3.4, 0.3, 0.55],
    [4.5, 0.36, 0.45],
    [5.5, 0.28, 0.6],
  ];

  return (
    <group position={[-1.78, 0, 0.82]}>
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.15, 0.32, 24]} />
        <meshStandardMaterial color={p.pot} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.325, 0]} castShadow>
        <cylinderGeometry args={[0.215, 0.215, 0.045, 24]} />
        <meshStandardMaterial color={p.pot} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.185, 0.185, 0.02, 20]} />
        <meshStandardMaterial color="#3d2c20" roughness={1} />
      </mesh>

      {stems.map(([angle, len, tilt], i) => {
        const x = Math.cos(angle) * 0.06;
        const z = Math.sin(angle) * 0.06;
        return (
          <group key={i} position={[x, 0.34, z]} rotation={[tilt * Math.sin(angle), angle, tilt * Math.cos(angle)]}>
            <mesh position={[0, len / 2, 0]} castShadow>
              <cylinderGeometry args={[0.012, 0.016, len, 8]} />
              <meshStandardMaterial color={p.leaf} roughness={0.85} />
            </mesh>
            <mesh position={[0, len + 0.05, 0]} scale={[0.075, 0.14, 0.035]} castShadow>
              <sphereGeometry args={[1, 12, 12]} />
              <meshStandardMaterial color={i % 2 ? p.leafAlt : p.leaf} roughness={0.8} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Articulated arm with a real joint, so it reads as a lamp from any angle. */
function Lamp({ p, dark }: { p: Palette; dark: boolean }) {
  return (
    <group position={[-1.3, 0.9, -0.42]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.155, 0.175, 0.035, 24]} />
        <meshStandardMaterial color={p.metal} roughness={0.45} metalness={0.45} />
      </mesh>

      {/* Arm reaches up and out over the desk. A cylinder's axis is local +y, which
          rotation about z by t sends to (-sin t, cos t) — hence the negative angles. */}
      <mesh position={[0.082, 0.246, 0]} rotation={[0, 0, -0.32]} castShadow>
        <cylinderGeometry args={[0.024, 0.024, 0.52, 12]} />
        <meshStandardMaterial color={p.metalLight} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0.163, 0.492, 0]} castShadow>
        <sphereGeometry args={[0.042, 14, 14]} />
        <meshStandardMaterial color={p.metal} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0.342, 0.62, 0]} rotation={[0, 0, -0.95]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.44, 12]} />
        <meshStandardMaterial color={p.metalLight} roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Shade opening is local -y, which rotation by +0.43 aims down and to the
          right — at the keyboard. The old -2.25 aimed it up and left, off the desk. */}
      <group position={[0.521, 0.748, 0]} rotation={[0, 0, 0.43]}>
        <mesh castShadow>
          <coneGeometry args={[0.21, 0.3, 24, 1, true]} />
          <meshStandardMaterial
            color={p.metal}
            roughness={0.4}
            metalness={0.45}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, -0.12, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial
            color="#fff0cf"
            emissive="#ffc46b"
            emissiveIntensity={dark ? 3.2 : 0.5}
          />
        </mesh>

        {/* Sits at the shade's mouth and casts shadows, so the shade actually
            shapes the light into a pool instead of glowing through everything. */}
        {dark && (
          <pointLight
            position={[0, -0.2, 0]}
            color="#ffc27a"
            intensity={14}
            distance={6}
            decay={2}
            castShadow
            shadow-mapSize={[512, 512]}
            shadow-bias={-0.004}
          />
        )}
      </group>
    </group>
  );
}

/** Covers plus a visible page block, so they read as books rather than slabs. */
function Books({ p, brand }: { p: Palette; brand: THREE.Color }) {
  const covers = [brand.getStyle(), "#6b7f9e", "#c99a5b"];
  return (
    <group position={[1.12, 0.9, -0.38]} rotation={[0, 0.24, 0]}>
      {covers.map((c, i) => (
        <group key={i} position={[0, 0.04 + i * 0.082, 0]} rotation={[0, i * 0.07 - 0.07, 0]}>
          <RoundedBox args={[0.54, 0.072, 0.38]} radius={0.012} smoothness={3} castShadow receiveShadow>
            <meshStandardMaterial color={c} roughness={0.62} />
          </RoundedBox>
          <mesh position={[0.012, 0, 0]}>
            <boxGeometry args={[0.505, 0.05, 0.355]} />
            <meshStandardMaterial color={p.paper} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Clutter({ p, brand }: { p: Palette; brand: THREE.Color }) {
  return (
    <group>
      <mesh position={[0.82, 0.906, 0.36]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.5, 0.38]} />
        <meshStandardMaterial color={p.metal} roughness={0.95} />
      </mesh>
      <group position={[0.82, 0.94, 0.34]}>
        <mesh scale={[0.055, 0.028, 0.085]} castShadow>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={p.paper} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.026, -0.02]} scale={[0.001, 1, 1]}>
          <planeGeometry args={[0.001, 0.05]} />
          <meshStandardMaterial color={p.metal} />
        </mesh>
      </group>

      {/* pen cup */}
      <group position={[-1.44, 0.9, 0.16]}>
        <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.072, 0.066, 0.2, 18]} />
          <meshStandardMaterial color={p.metalLight} roughness={0.55} />
        </mesh>
        {[
          [0.02, 0.02, brand.getStyle()],
          [-0.025, -0.04, "#6b7f9e"],
          [0.03, -0.03, "#d4a373"],
        ].map(([x, z, c], i) => (
          <mesh
            key={i}
            position={[x as number, 0.26, z as number]}
            rotation={[(z as number) * 2, 0, (x as number) * 3]}
            castShadow
          >
            <cylinderGeometry args={[0.011, 0.011, 0.24, 8]} />
            <meshStandardMaterial color={c as string} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* notebook, open flat next to the keyboard */}
      <group position={[-0.86, 0.91, 0.3]} rotation={[0, 0.28, 0]}>
        <RoundedBox args={[0.42, 0.02, 0.3]} radius={0.008} smoothness={3} castShadow receiveShadow>
          <meshStandardMaterial color={p.paper} roughness={0.92} />
        </RoundedBox>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 0.012, -0.07 + i * 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.3, 0.006]} />
            <meshStandardMaterial color="#b9ae9a" roughness={1} />
          </mesh>
        ))}
      </group>

      {/* headphones hooked over the desk edge */}
      <group position={[-0.62, 0.9, -0.5]} rotation={[0.3, 0.5, 0]}>
        <mesh castShadow>
          <torusGeometry args={[0.145, 0.02, 10, 26, Math.PI * 1.05]} />
          <meshStandardMaterial color={p.metal} roughness={0.55} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0.145 * s, 0.01, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.058, 0.058, 0.05, 18]} />
            <meshStandardMaterial color={p.metalLight} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* sticky notes on the monitor bezel */}
      {[
        [-1.1, 2.06, -0.4, -0.14],
        [-1.12, 1.85, -0.4, 0.1],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, 0.02, r]} castShadow>
          <planeGeometry args={[0.18, 0.18]} />
          <meshStandardMaterial
            color={i === 0 ? "#f2d16b" : "#f0a3a3"}
            roughness={0.95}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function Chair({ p }: { p: Palette }) {
  return (
    <group position={[0.16, 0, 1.12]} rotation={[0, 0.04, 0]}>
      <RoundedBox args={[0.7, 0.1, 0.68]} radius={0.05} smoothness={4} position={[0, 0.56, 0]} castShadow>
        <meshStandardMaterial color={p.chair} roughness={0.8} />
      </RoundedBox>
      <RoundedBox
        args={[0.64, 0.42, 0.09]}
        radius={0.05}
        smoothness={4}
        position={[0, 0.8, 0.32]}
        rotation={[0.16, 0, 0]}
        castShadow
      >
        <meshStandardMaterial color={p.chair} roughness={0.8} />
      </RoundedBox>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.048, 0.048, 0.5, 14]} />
        <meshStandardMaterial color={p.metal} roughness={0.4} metalness={0.45} />
      </mesh>
      {/* five-star base */}
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.16, 0.05, Math.sin(a) * 0.16]}
            rotation={[0, -a, 0]}
            castShadow
          >
            <boxGeometry args={[0.34, 0.035, 0.055]} />
            <meshStandardMaterial color={p.metal} roughness={0.4} metalness={0.45} />
          </mesh>
        );
      })}
    </group>
  );
}

const Desk = ({
  hue,
  dark,
  reduced,
  onHover,
}: {
  hue: number;
  dark: boolean;
  reduced: boolean;
  onHover: (s: Spot) => void;
}) => {
  const p = palette(dark);
  const brand = useMemo(() => new THREE.Color().setHSL(hue / 360, 0.66, 0.52), [hue]);
  const legs: [number, number][] = [
    [-1.45, -0.55],
    [1.45, -0.55],
    [-1.45, 0.55],
    [1.45, 0.55],
  ];

  return (
    <group>
      <RoundedBox
        args={[4.55, 0.42, 3.45]}
        radius={0.17}
        smoothness={4}
        position={[0, -0.21, 0]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial color={p.island} roughness={0.92} />
      </RoundedBox>

      <mesh position={[0.1, 0.005, 0.7]} rotation={[-Math.PI / 2, 0, 0.12]} receiveShadow>
        <planeGeometry args={[2.9, 2.0]} />
        <meshStandardMaterial color={p.rug} roughness={1} />
      </mesh>

      <group>
        <RoundedBox
          args={[3.2, 0.1, 1.45]}
          radius={0.035}
          smoothness={4}
          position={[0, 0.85, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={p.wood} roughness={0.6} />
        </RoundedBox>
        {legs.map(([x, z]) => (
          <mesh key={`${x}-${z}`} position={[x, 0.4, z]} castShadow>
            <boxGeometry args={[0.09, 0.8, 0.09]} />
            <meshStandardMaterial color={p.woodDark} roughness={0.7} />
          </mesh>
        ))}
      </group>

      <Clutter p={p} brand={brand} />
      <Person shirt={brand} reduced={reduced} />

      <Hotspot id="screen" onHover={onHover}>
        <Monitor hue={hue} dark={dark} p={p} />
      </Hotspot>

      <Hotspot id="keyboard" onHover={onHover}>
        <RoundedBox
          args={[1.45, 0.055, 0.46]}
          radius={0.018}
          smoothness={3}
          position={[0, 0.93, 0.36]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={p.metalLight} roughness={0.6} />
        </RoundedBox>
        <Keyboard p={p} brand={brand} />
      </Hotspot>

      <Hotspot id="phone" onHover={onHover}>
        <group position={[-1.12, 1.06, 0.34]} rotation={[-0.32, 0.3, 0]}>
          <RoundedBox args={[0.28, 0.52, 0.028]} radius={0.032} smoothness={4} castShadow>
            <meshStandardMaterial color={p.metal} roughness={0.35} metalness={0.45} />
          </RoundedBox>
          <mesh position={[0, 0, 0.016]}>
            <planeGeometry args={[0.245, 0.465]} />
            <meshStandardMaterial
              color={brand}
              emissive={brand}
              emissiveIntensity={dark ? 0.8 : 0.3}
              roughness={0.3}
            />
          </mesh>
        </group>
      </Hotspot>

      <Hotspot id="mug" onHover={onHover}>
        <Mug color={brand} reduced={reduced} />
      </Hotspot>

      <Hotspot id="plant" onHover={onHover}>
        <Plant p={p} />
      </Hotspot>

      <Hotspot id="lamp" onHover={onHover}>
        <Lamp p={p} dark={dark} />
      </Hotspot>

      <Hotspot id="books" onHover={onHover}>
        <Books p={p} brand={brand} />
      </Hotspot>

      <Chair p={p} />
    </group>
  );
};

export default Desk;
