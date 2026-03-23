import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 1400;
const COUNT_SOFT = 800;

function makeSphereCloud(count, radiusMin, radiusMax, flattenZ) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = radiusMin + Math.random() * (radiusMax - radiusMin);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.85;
    positions[i * 3 + 2] = r * Math.cos(phi) * flattenZ;
  }
  return positions;
}

export function NetflixAuraScene() {
  const group = useRef(null);
  const groupSoft = useRef(null);
  const torus = useRef(null);

  const geoMain = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(makeSphereCloud(COUNT, 2.2, 11, 0.35), 3));
    return g;
  }, []);

  const geoSoft = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(makeSphereCloud(COUNT_SOFT, 1.5, 9, 0.5), 3));
    return g;
  }, []);

  useFrame((_, delta) => {
    if (typeof document !== "undefined" && document.hidden) return;
    if (group.current) {
      group.current.rotation.y += delta * 0.045;
      group.current.rotation.x += delta * 0.012;
    }
    if (groupSoft.current) {
      groupSoft.current.rotation.y -= delta * 0.028;
      groupSoft.current.rotation.z += delta * 0.008;
    }
    if (torus.current) {
      torus.current.rotation.x += delta * 0.06;
      torus.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <group>
      <points ref={group} geometry={geoMain}>
        <pointsMaterial
          color="#e50914"
          size={0.045}
          transparent
          opacity={0.55}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <points ref={groupSoft} geometry={geoSoft}>
        <pointsMaterial
          color="#ffffff"
          size={0.022}
          transparent
          opacity={0.12}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <mesh ref={torus} rotation={[0.9, 0.4, 0]} scale={[5.2, 5.2, 5.2]}>
        <torusGeometry args={[1, 0.018, 12, 120]} />
        <meshBasicMaterial
          color="#e50914"
          transparent
          opacity={0.14}
          wireframe
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
