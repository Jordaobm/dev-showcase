"use client";

import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { MousePointer2, Sparkles, Wand2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";
import { useRef, useState } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 8000;
const GALAXY_RADIUS = 5;
const BRANCHES = 3;
const SPIN = 1.2;
const RANDOMNESS = 0.4;
const RANDOMNESS_POWER = 3;
const INSIDE_COLOR = "#ff6030";
const OUTSIDE_COLOR = "#1b3984";

const EXPLODE_SPEED = 1;

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uSize;

  varying vec3 vColor;

  void main() {
    vColor = color;

    vec3 pos = position;
    float dist = length(vec2(pos.x, pos.z));
    float angle = atan(pos.z, pos.x);
    angle += uTime * 0.08 / (dist + 0.3);
    pos.x = cos(angle) * dist;
    pos.z = sin(angle) * dist;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    gl_PointSize = uSize * (1.0 / -mvPosition.z);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;

  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    float strength = 1.0 - smoothstep(0.0, 0.5, dist);
    gl_FragColor = vec4(vColor, strength);
  }
`;

const generateGalaxyData = () => {
  const galaxyPositions = new Float32Array(PARTICLE_COUNT * 3);
  const explodedPositions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);

  const colorInside = new THREE.Color(INSIDE_COLOR);
  const colorOutside = new THREE.Color(OUTSIDE_COLOR);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;

    const radius = Math.random() * GALAXY_RADIUS;
    const spinAngle = radius * SPIN;
    const branchAngle = ((i % BRANCHES) / BRANCHES) * Math.PI * 2;

    const randomSign = () => (Math.random() < 0.5 ? 1 : -1);
    const randomX =
      Math.random() ** RANDOMNESS_POWER * randomSign() * RANDOMNESS * radius;
    const randomY =
      Math.random() ** RANDOMNESS_POWER * randomSign() * RANDOMNESS * radius;
    const randomZ =
      Math.random() ** RANDOMNESS_POWER * randomSign() * RANDOMNESS * radius;

    galaxyPositions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    galaxyPositions[i3 + 1] = randomY;
    galaxyPositions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    const explodeRadius = GALAXY_RADIUS * 2.2;
    explodedPositions[i3] = (Math.random() - 0.5) * explodeRadius;
    explodedPositions[i3 + 1] = (Math.random() - 0.5) * explodeRadius;
    explodedPositions[i3 + 2] = (Math.random() - 0.5) * explodeRadius;

    const mixedColor = colorInside
      .clone()
      .lerp(colorOutside, radius / GALAXY_RADIUS);
    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  return { galaxyPositions, explodedPositions, colors };
};

const { galaxyPositions, explodedPositions, colors } = generateGalaxyData();

const Galaxy = ({ exploded }: Readonly<{ exploded: boolean }>) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const transitionRef = useRef(0);

  useFrame((state, delta) => {
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

    const target = exploded ? 1 : 0;
    if (transitionRef.current !== target) {
      const dir = target > transitionRef.current ? 1 : -1;
      transitionRef.current = THREE.MathUtils.clamp(
        transitionRef.current + dir * delta * EXPLODE_SPEED,
        0,
        1,
      );

      const posAttr = pointsRef.current.geometry.attributes
        .position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;
      const t = transitionRef.current;

      for (let i = 0; i < array.length; i++) {
        array[i] = galaxyPositions[i] * (1 - t) + explodedPositions[i] * t;
      }
      posAttr.needsUpdate = true;
    }

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      state.pointer.y * 0.3,
      0.05,
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      state.pointer.x * 0.3,
      0.05,
    );
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[galaxyPositions.slice(), 3]}
          />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          vertexShader={VERTEX_SHADER}
          fragmentShader={FRAGMENT_SHADER}
          uniforms={{ uTime: { value: 0 }, uSize: { value: 22 } }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexColors
        />
      </points>
    </group>
  );
};

const SCENE_ELEMENT_KEYS = [
  { labelKey: "galaxyElementSpiralLabel", descKey: "galaxyElementSpiralDesc" },
  { labelKey: "galaxyElementShaderLabel", descKey: "galaxyElementShaderDesc" },
  { labelKey: "galaxyElementColorLabel", descKey: "galaxyElementColorDesc" },
  { labelKey: "galaxyElementRotationLabel", descKey: "galaxyElementRotationDesc" },
  { labelKey: "galaxyElementGlowLabel", descKey: "galaxyElementGlowDesc" },
  { labelKey: "galaxyElementExplodeLabel", descKey: "galaxyElementExplodeDesc" },
] as const;

export const GalaxyShaderSection = () => {
  const t = useTranslations();
  const [exploded, setExploded] = useState(false);

  const interactionTips = [
    { actionKey: "galaxyMouseTip", descKey: "galaxyMouseDesc" },
    { actionKey: "galaxyExplodeButtonTip", descKey: "galaxyExplodeButtonDesc" },
    { actionKey: "commonScrollTip", descKey: "commonScrollDesc" },
  ] as const;

  return (
    <div id="galaxy-shader" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("demo3d.galaxyTitle")}
      </h3>

      <div className="mt-4 space-y-6 text-gray-600 text-base leading-relaxed">
        <div>
          <p>{t.rich("demo3d.galaxyIntroDesc1", renderHtmlText)}</p>
          <p className="mt-2">{t("demo3d.galaxyIntroDesc2")}</p>
        </div>

        <div>
          <p className="font-semibold text-gray-600 mb-3">
            {t("demo3d.commonSceneContentsTitle")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SCENE_ELEMENT_KEYS.map(({ labelKey, descKey }) => (
              <div
                key={labelKey}
                className="flex gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50 text-xs"
              >
                <span className="shrink-0 text-gray-400 mt-0.5">—</span>
                <div>
                  <p className="font-semibold text-gray-700 mb-0.5">
                    {t(`demo3d.${labelKey}`)}
                  </p>
                  <p className="text-gray-500 leading-relaxed">
                    {t(`demo3d.${descKey}`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
        <div className="flex items-center gap-2 mb-3">
          <MousePointer2 className="w-4 h-4 shrink-0" />
          <p className="font-bold">{t("demo3d.commonInteractionTitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {interactionTips.map(({ actionKey, descKey }) => (
            <div key={actionKey} className="p-3 bg-amber-100 rounded-lg">
              <p className="font-semibold text-amber-900 text-xs">
                {t(`demo3d.${actionKey}`)}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {t(`demo3d.${descKey}`)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="mt-4 rounded-xl overflow-hidden border border-gray-200 relative"
        style={{ height: 500 }}
      >
        <Canvas style={{ height: "100%" }}>
          <color attach="background" args={["#05030d"]} />
          <PerspectiveCamera makeDefault position={[0, 4, 9]} fov={60} />
          <OrbitControls
            enableRotate={false}
            enablePan={false}
            minDistance={1}
            maxDistance={8}
          />
          <Galaxy exploded={exploded} />
        </Canvas>

        <button
          type="button"
          onClick={() => setExploded((prev) => !prev)}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-black/75 backdrop-blur-sm border border-white/10 text-white text-sm font-medium hover:bg-black/90 transition-colors cursor-pointer"
        >
          {exploded ? (
            <>
              <Sparkles className="w-4 h-4" />
              {t("demo3d.galaxyRegroupButton")}
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              {t("demo3d.galaxyExplodeButton")}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
