"use client";

import {
  Html,
  OrbitControls,
  PerspectiveCamera,
  Stars,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Box, Camera, Lightbulb, MousePointer2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

const TOON_STEPS = 4;

const TOON_GRADIENT_MAP = (() => {
  const data = new Uint8Array(TOON_STEPS * 4);
  for (let i = 0; i < TOON_STEPS; i++) {
    const value = Math.round((i / (TOON_STEPS - 1)) * 255);
    data[i * 4 + 0] = value;
    data[i * 4 + 1] = value;
    data[i * 4 + 2] = value;
    data[i * 4 + 3] = 255;
  }
  const texture = new THREE.DataTexture(data, TOON_STEPS, 1, THREE.RGBAFormat);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  return texture;
})();

const drawEarthTexture = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) => {
  ctx.fillStyle = "#2f7bd6";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#4caf50";
  ctx.strokeStyle = "#2e7d32";
  ctx.lineWidth = Math.max(1, w * 0.008);

  const continents = [
    { x: w * 0.16, y: h * 0.42, rx: w * 0.12, ry: h * 0.22 },
    { x: w * 0.3, y: h * 0.74, rx: w * 0.07, ry: h * 0.12 },
    { x: w * 0.54, y: h * 0.3, rx: w * 0.1, ry: h * 0.16 },
    { x: w * 0.68, y: h * 0.64, rx: w * 0.13, ry: h * 0.2 },
    { x: w * 0.88, y: h * 0.36, rx: w * 0.06, ry: h * 0.1 },
  ];

  for (const c of continents) {
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
};

const drawJupiterTexture = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) => {
  const bandColors = [
    "#e0a567",
    "#c97f4a",
    "#e8c39a",
    "#c97f4a",
    "#e0a567",
    "#b5703f",
    "#e0a567",
  ];
  const bandHeight = h / bandColors.length;
  bandColors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, i * bandHeight, w, bandHeight + 1);
  });

  ctx.fillStyle = "#c1502e";
  ctx.strokeStyle = "#8c3a20";
  ctx.lineWidth = Math.max(1, w * 0.005);
  ctx.beginPath();
  ctx.ellipse(w * 0.28, h * 0.62, w * 0.09, h * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
};

const useCanvasTexture = (
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
  width: number,
  height: number,
) => {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    draw(ctx, width, height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

type PlanetId =
  | "sun"
  | "mercury"
  | "venus"
  | "earth"
  | "moon"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune";

interface PlanetI18nKeys {
  label: string;
  size: string;
  gravity: string;
  composition: string;
  distance: string;
  dayLength: string;
  yearLength: string;
  temperature: string;
}

const PLANET_I18N_KEYS: Record<PlanetId, PlanetI18nKeys> = {
  sun: {
    label: "solarPlanetSunLabel",
    size: "solarPlanetSunSize",
    gravity: "solarPlanetSunGravity",
    composition: "solarPlanetSunComposition",
    distance: "solarPlanetSunDistance",
    dayLength: "solarPlanetSunDayLength",
    yearLength: "solarPlanetSunYearLength",
    temperature: "solarPlanetSunTemperature",
  },
  mercury: {
    label: "solarPlanetMercuryLabel",
    size: "solarPlanetMercurySize",
    gravity: "solarPlanetMercuryGravity",
    composition: "solarPlanetMercuryComposition",
    distance: "solarPlanetMercuryDistance",
    dayLength: "solarPlanetMercuryDayLength",
    yearLength: "solarPlanetMercuryYearLength",
    temperature: "solarPlanetMercuryTemperature",
  },
  venus: {
    label: "solarPlanetVenusLabel",
    size: "solarPlanetVenusSize",
    gravity: "solarPlanetVenusGravity",
    composition: "solarPlanetVenusComposition",
    distance: "solarPlanetVenusDistance",
    dayLength: "solarPlanetVenusDayLength",
    yearLength: "solarPlanetVenusYearLength",
    temperature: "solarPlanetVenusTemperature",
  },
  earth: {
    label: "solarPlanetEarthLabel",
    size: "solarPlanetEarthSize",
    gravity: "solarPlanetEarthGravity",
    composition: "solarPlanetEarthComposition",
    distance: "solarPlanetEarthDistance",
    dayLength: "solarPlanetEarthDayLength",
    yearLength: "solarPlanetEarthYearLength",
    temperature: "solarPlanetEarthTemperature",
  },
  moon: {
    label: "solarPlanetMoonLabel",
    size: "solarPlanetMoonSize",
    gravity: "solarPlanetMoonGravity",
    composition: "solarPlanetMoonComposition",
    distance: "solarPlanetMoonDistance",
    dayLength: "solarPlanetMoonDayLength",
    yearLength: "solarPlanetMoonYearLength",
    temperature: "solarPlanetMoonTemperature",
  },
  mars: {
    label: "solarPlanetMarsLabel",
    size: "solarPlanetMarsSize",
    gravity: "solarPlanetMarsGravity",
    composition: "solarPlanetMarsComposition",
    distance: "solarPlanetMarsDistance",
    dayLength: "solarPlanetMarsDayLength",
    yearLength: "solarPlanetMarsYearLength",
    temperature: "solarPlanetMarsTemperature",
  },
  jupiter: {
    label: "solarPlanetJupiterLabel",
    size: "solarPlanetJupiterSize",
    gravity: "solarPlanetJupiterGravity",
    composition: "solarPlanetJupiterComposition",
    distance: "solarPlanetJupiterDistance",
    dayLength: "solarPlanetJupiterDayLength",
    yearLength: "solarPlanetJupiterYearLength",
    temperature: "solarPlanetJupiterTemperature",
  },
  saturn: {
    label: "solarPlanetSaturnLabel",
    size: "solarPlanetSaturnSize",
    gravity: "solarPlanetSaturnGravity",
    composition: "solarPlanetSaturnComposition",
    distance: "solarPlanetSaturnDistance",
    dayLength: "solarPlanetSaturnDayLength",
    yearLength: "solarPlanetSaturnYearLength",
    temperature: "solarPlanetSaturnTemperature",
  },
  uranus: {
    label: "solarPlanetUranusLabel",
    size: "solarPlanetUranusSize",
    gravity: "solarPlanetUranusGravity",
    composition: "solarPlanetUranusComposition",
    distance: "solarPlanetUranusDistance",
    dayLength: "solarPlanetUranusDayLength",
    yearLength: "solarPlanetUranusYearLength",
    temperature: "solarPlanetUranusTemperature",
  },
  neptune: {
    label: "solarPlanetNeptuneLabel",
    size: "solarPlanetNeptuneSize",
    gravity: "solarPlanetNeptuneGravity",
    composition: "solarPlanetNeptuneComposition",
    distance: "solarPlanetNeptuneDistance",
    dayLength: "solarPlanetNeptuneDayLength",
    yearLength: "solarPlanetNeptuneYearLength",
    temperature: "solarPlanetNeptuneTemperature",
  },
};

const PlanetLabel = ({
  label,
  yOffset,
}: Readonly<{ label: string; yOffset: number }>) => {
  return (
    <Html
      position={[0, yOffset, 0]}
      center
      distanceFactor={10}
      style={{ pointerEvents: "none" }}
    >
      <div className="px-2 py-0.5 rounded-full bg-black/70 text-white text-xs font-semibold whitespace-nowrap">
        {label}
      </div>
    </Html>
  );
};

const SUN_ID: PlanetId = "sun";

const Sol = ({
  label,
  isFocused,
  onFocus,
}: Readonly<{
  label: string;
  isFocused?: boolean;
  onFocus?: FocusHandler;
}>) => {
  const groupRef = useRef<THREE.Group>(null!);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh onClick={() => onFocus?.(groupRef, 2.5, SUN_ID)}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="#ffb238" />
      </mesh>
      <mesh scale={1.05}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="#7a3d00" side={THREE.BackSide} />
      </mesh>
      <pointLight intensity={500} color="#ffaa00" distance={0} decay={2} />
      {isFocused && <PlanetLabel label={label} yOffset={3.1} />}
    </group>
  );
};

const OrbitRing = ({ radius }: Readonly<{ radius: number }>) => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.05, radius + 0.05, 128]} />
      <meshBasicMaterial
        color="#4499ff"
        transparent
        opacity={0.12}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const LUA_RADIUS = 0.16;
const LUA_ORBIT_RADIUS = 1.5;
const LUA_ORBIT_SPEED = 1.2;
const LUA_SELF_ROTATION = 0.15;
const MOON_ID: PlanetId = "moon";

const Lua = ({
  label,
  isFocused,
  onFocus,
}: Readonly<{
  label: string;
  isFocused?: boolean;
  onFocus?: FocusHandler;
}>) => {
  const orbitRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    orbitRef.current.position.x =
      LUA_ORBIT_RADIUS * Math.cos(t * LUA_ORBIT_SPEED);
    orbitRef.current.position.z =
      LUA_ORBIT_RADIUS * Math.sin(t * LUA_ORBIT_SPEED);
    meshRef.current.rotation.y += delta * LUA_SELF_ROTATION;
  });

  return (
    <group ref={orbitRef}>
      <mesh
        ref={meshRef}
        onClick={() => onFocus?.(orbitRef, LUA_RADIUS, MOON_ID)}
      >
        <sphereGeometry args={[LUA_RADIUS, 16, 16]} />
        <meshToonMaterial color="#cfcfcf" gradientMap={TOON_GRADIENT_MAP} />
      </mesh>
      <mesh scale={1.12}>
        <sphereGeometry args={[LUA_RADIUS, 16, 16]} />
        <meshBasicMaterial color="#15151f" side={THREE.BackSide} />
      </mesh>
      {isFocused && <PlanetLabel label={label} yOffset={LUA_RADIUS + 0.35} />}
    </group>
  );
};

type FocusHandler = (
  ref: React.RefObject<THREE.Group>,
  radius: number,
  id: PlanetId,
) => void;

interface PlanetProps {
  id: PlanetId;
  label: string;
  color: string;
  texture?: THREE.Texture | null;
  radius: number;
  orbitRadius: number;
  orbitSpeed: number;
  selfRotation: number;
  orbitOffset?: number;
  children?: React.ReactNode;
  isFocused?: boolean;
  onFocus?: FocusHandler;
}

const Planet = ({
  id,
  label,
  color,
  texture,
  radius,
  orbitRadius,
  orbitSpeed,
  selfRotation,
  orbitOffset = 0,
  children,
  isFocused,
  onFocus,
}: Readonly<PlanetProps>) => {
  const orbitRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime + orbitOffset;
    orbitRef.current.position.x = orbitRadius * Math.cos(t * orbitSpeed);
    orbitRef.current.position.z = orbitRadius * Math.sin(t * orbitSpeed);
    meshRef.current.rotation.y += delta * selfRotation;
  });

  return (
    <group ref={orbitRef}>
      <mesh
        ref={meshRef}
        onClick={() => {
          onFocus?.(orbitRef, radius, id);
        }}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshToonMaterial
          color={color}
          map={texture ?? undefined}
          gradientMap={TOON_GRADIENT_MAP}
        />
      </mesh>
      <mesh scale={1.08}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial color="#15151f" side={THREE.BackSide} />
      </mesh>
      {isFocused && <PlanetLabel label={label} yOffset={radius + 0.5} />}
      {children}
    </group>
  );
};

const SATURN_ID: PlanetId = "saturn";

const Saturno = ({
  label,
  isFocused,
  onFocus,
}: Readonly<{
  label: string;
  isFocused?: boolean;
  onFocus?: FocusHandler;
}>) => {
  const orbitRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    orbitRef.current.position.x = 44 * Math.cos(t * 0.005);
    orbitRef.current.position.z = 44 * Math.sin(t * 0.005);
    meshRef.current.rotation.y += delta * 1.1;
  });

  return (
    <group ref={orbitRef}>
      <mesh ref={meshRef} onClick={() => onFocus?.(orbitRef, 1.7, SATURN_ID)}>
        <sphereGeometry args={[1.7, 32, 32]} />
        <meshToonMaterial color="#e8d2a0" gradientMap={TOON_GRADIENT_MAP} />
      </mesh>
      <mesh scale={1.06}>
        <sphereGeometry args={[1.7, 32, 32]} />
        <meshBasicMaterial color="#15151f" side={THREE.BackSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2 - 0.47, 0, 0]}>
        <ringGeometry args={[2.3, 3.8, 64]} />
        <meshBasicMaterial
          color="#c8a97c"
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
      {isFocused && <PlanetLabel label={label} yOffset={2.3} />}
    </group>
  );
};

interface CameraApproach {
  fromCamera: THREE.Vector3;
  fromTarget: THREE.Vector3;
  offset: THREE.Vector3;
  t: number;
}

const APPROACH_RATE = 1.4;

const CameraController = ({
  targetRef,
  targetRadius,
  controls,
}: {
  targetRef: React.RefObject<THREE.Group> | null;
  targetRadius: number;
  controls: React.RefObject<OrbitControlsImpl | null>;
}) => {
  const approachRef = useRef<CameraApproach | null>(null);
  const pendingSetupRef = useRef(false);
  const prevPlanetPosRef = useRef<THREE.Vector3 | null>(null);
  const worldPosScratch = useRef(new THREE.Vector3());

  useEffect(() => {
    approachRef.current = null;
    prevPlanetPosRef.current = null;
    pendingSetupRef.current = !!targetRef;
  }, [targetRef]);

  useFrame(({ camera }, delta) => {
    if (!targetRef?.current || !controls.current) {
      approachRef.current = null;
      prevPlanetPosRef.current = null;
      return;
    }

    targetRef.current.updateWorldMatrix(true, false);
    const planetPos = targetRef.current.getWorldPosition(
      worldPosScratch.current,
    );

    if (pendingSetupRef.current) {
      const distance = THREE.MathUtils.clamp(targetRadius * 10, 1.5, 20);
      const direction = camera.position.clone().sub(controls.current.target);
      if (direction.lengthSq() < 1e-6) {
        direction.set(0, distance * 0.3, distance);
      } else {
        direction.normalize();
      }

      approachRef.current = {
        fromCamera: camera.position.clone(),
        fromTarget: controls.current.target.clone(),
        offset: direction.multiplyScalar(distance),
        t: 0,
      };
      pendingSetupRef.current = false;
    }

    if (approachRef.current) {
      const approach = approachRef.current;
      approach.t = Math.min(1, approach.t + delta * APPROACH_RATE);
      const eased = 1 - (1 - approach.t) ** 3;

      const desiredCamera = planetPos.clone().add(approach.offset);
      camera.position.lerpVectors(approach.fromCamera, desiredCamera, eased);
      controls.current.target.lerpVectors(
        approach.fromTarget,
        planetPos,
        eased,
      );
      controls.current.update();

      if (approach.t >= 1) {
        approachRef.current = null;
        prevPlanetPosRef.current = planetPos.clone();
      }
      return;
    }

    if (prevPlanetPosRef.current) {
      const moveDelta = planetPos.clone().sub(prevPlanetPosRef.current);
      if (moveDelta.lengthSq() > 0) {
        camera.position.add(moveDelta);
        controls.current.target.add(moveDelta);
        controls.current.update();
      }
    }
    prevPlanetPosRef.current = planetPos.clone();
  });

  return null;
};

const SCENE_ELEMENT_KEYS = [
  { labelKey: "solarElementToonLabel", descKey: "solarElementToonDesc" },
  { labelKey: "solarElementOutlineLabel", descKey: "solarElementOutlineDesc" },
  { labelKey: "solarElementTextureLabel", descKey: "solarElementTextureDesc" },
  { labelKey: "solarElementScaleLabel", descKey: "solarElementScaleDesc" },
  {
    labelKey: "solarElementCameraChaseLabel",
    descKey: "solarElementCameraChaseDesc",
  },
  {
    labelKey: "solarElementRealDataLabel",
    descKey: "solarElementRealDataDesc",
  },
] as const;

export const TechStackSolarSystem = () => {
  const t = useTranslations();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [focused, setFocused] = useState<{
    ref: React.RefObject<THREE.Group>;
    radius: number;
    id: PlanetId;
  } | null>(null);

  const earthTexture = useCanvasTexture(drawEarthTexture, 256, 128);
  const jupiterTexture = useCanvasTexture(drawJupiterTexture, 256, 128);

  const handleFocus: FocusHandler = (ref, radius, id) =>
    setFocused({ ref, radius, id });

  const info = focused ? PLANET_I18N_KEYS[focused.id] : null;

  const interactionTips = [
    { actionKey: "solarClickTip", descKey: "solarClickDesc" },
    { actionKey: "solarDragTip", descKey: "solarDragDesc" },
    { actionKey: "commonScrollTip", descKey: "commonScrollDesc" },
    { actionKey: "commonMobileTip", descKey: "commonMobileDesc" },
  ] as const;

  return (
    <div id="tech-stack-solar-system" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("demo3d.solarTitle")}
      </h3>

      <div className="mt-4 space-y-6 text-gray-600 text-base leading-relaxed">
        <div>
          <p>{t.rich("demo3d.solarIntroDesc1", renderHtmlText)}</p>
          <p className="mt-2">
            {t.rich("demo3d.solarIntroDesc2", renderHtmlText)}
          </p>
        </div>

        <div>
          <p className="font-semibold text-gray-600 mb-3">
            {t("demo3d.commonSceneIngredientsTitle")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="w-4 h-4 text-gray-400" />
                <p className="text-sm font-semibold text-gray-700">
                  {t("demo3d.commonCameraLabel")}
                </p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {t("demo3d.commonCameraDesc")}
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-gray-400" />
                <p className="text-sm font-semibold text-gray-700">
                  {t("demo3d.commonLightLabel")}
                </p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {t("demo3d.commonLightDesc")}
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Box className="w-4 h-4 text-gray-400" />
                <p className="text-sm font-semibold text-gray-700">
                  {t("demo3d.commonMeshLabel")}
                </p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {t.rich("demo3d.commonMeshDesc", renderHtmlText)}
              </p>
            </div>
          </div>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
        <Canvas shadows="soft" style={{ height: "100%" }}>
          <ambientLight intensity={0.4} />
          <color attach="background" args={["#000010"]} />
          <Stars
            radius={400}
            depth={120}
            count={3000}
            factor={2}
            saturation={0}
            fade
            speed={0.5}
          />
          <PerspectiveCamera makeDefault position={[10, 10, 25]} fov={50} />
          <OrbitControls ref={controlsRef} enablePan target={[0, 0, 0]} />
          <CameraController
            targetRef={focused?.ref ?? null}
            targetRadius={focused?.radius ?? 1}
            controls={controlsRef}
          />

          <Sol
            label={t(`demo3d.${PLANET_I18N_KEYS.sun.label}`)}
            isFocused={focused?.id === "sun"}
            onFocus={handleFocus}
          />

          <OrbitRing radius={6} />
          <OrbitRing radius={9} />
          <OrbitRing radius={13} />
          <OrbitRing radius={18} />
          <OrbitRing radius={30} />
          <OrbitRing radius={44} />
          <OrbitRing radius={58} />
          <OrbitRing radius={72} />

          <Planet
            id="mercury"
            label={t(`demo3d.${PLANET_I18N_KEYS.mercury.label}`)}
            color="#b8b4ad"
            radius={0.23}
            orbitRadius={6}
            orbitSpeed={0.6}
            selfRotation={0.009}
            orbitOffset={0}
            isFocused={focused?.id === "mercury"}
            onFocus={handleFocus}
          />
          <Planet
            id="venus"
            label={t(`demo3d.${PLANET_I18N_KEYS.venus.label}`)}
            color="#f3a93f"
            radius={0.57}
            orbitRadius={9}
            orbitSpeed={0.23}
            selfRotation={-0.01}
            orbitOffset={1}
            isFocused={focused?.id === "venus"}
            onFocus={handleFocus}
          />
          <Planet
            id="earth"
            label={t(`demo3d.${PLANET_I18N_KEYS.earth.label}`)}
            color="#2f7bd6"
            texture={earthTexture}
            radius={0.6}
            orbitRadius={13}
            orbitSpeed={0.15}
            selfRotation={0.5}
            orbitOffset={2}
            isFocused={focused?.id === "earth"}
            onFocus={handleFocus}
          >
            <Lua
              label={t(`demo3d.${PLANET_I18N_KEYS.moon.label}`)}
              isFocused={focused?.id === "moon"}
              onFocus={handleFocus}
            />
          </Planet>
          <Planet
            id="mars"
            label={t(`demo3d.${PLANET_I18N_KEYS.mars.label}`)}
            color="#c1502e"
            radius={0.32}
            orbitRadius={18}
            orbitSpeed={0.08}
            selfRotation={0.49}
            orbitOffset={4}
            isFocused={focused?.id === "mars"}
            onFocus={handleFocus}
          />

          <Planet
            id="jupiter"
            label={t(`demo3d.${PLANET_I18N_KEYS.jupiter.label}`)}
            color="#e0a567"
            texture={jupiterTexture}
            radius={2.0}
            orbitRadius={30}
            orbitSpeed={0.013}
            selfRotation={1.2}
            orbitOffset={0}
            isFocused={focused?.id === "jupiter"}
            onFocus={handleFocus}
          />
          <Saturno
            label={t(`demo3d.${PLANET_I18N_KEYS.saturn.label}`)}
            isFocused={focused?.id === "saturn"}
            onFocus={handleFocus}
          />
          <Planet
            id="uranus"
            label={t(`demo3d.${PLANET_I18N_KEYS.uranus.label}`)}
            color="#8fd9e0"
            radius={1.0}
            orbitRadius={58}
            orbitSpeed={0.0018}
            selfRotation={0.7}
            orbitOffset={2}
            isFocused={focused?.id === "uranus"}
            onFocus={handleFocus}
          />
          <Planet
            id="neptune"
            label={t(`demo3d.${PLANET_I18N_KEYS.neptune.label}`)}
            color="#4f6fe0"
            radius={0.95}
            orbitRadius={72}
            orbitSpeed={0.0008}
            selfRotation={0.74}
            orbitOffset={5}
            isFocused={focused?.id === "neptune"}
            onFocus={handleFocus}
          />
        </Canvas>

        {focused && info && (
          <div className="absolute top-4 right-4 z-10 w-64 rounded-xl border border-white/10 bg-black/75 backdrop-blur-sm p-4 text-white shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-sm">{t(`demo3d.${info.label}`)}</p>
              <button
                type="button"
                onClick={() => setFocused(null)}
                className="p-1.5 -m-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label={t("demo3d.solarCloseLabel")}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <dl className="space-y-2 text-xs">
              <div>
                <dt className="text-white/40 uppercase tracking-wide text-[10px]">
                  {t("demo3d.solarInfoSizeLabel")}
                </dt>
                <dd className="text-white/90 mt-0.5">
                  {t(`demo3d.${info.size}`)}
                </dd>
              </div>
              <div>
                <dt className="text-white/40 uppercase tracking-wide text-[10px]">
                  {t("demo3d.solarInfoGravityLabel")}
                </dt>
                <dd className="text-white/90 mt-0.5">
                  {t(`demo3d.${info.gravity}`)}
                </dd>
              </div>
              <div>
                <dt className="text-white/40 uppercase tracking-wide text-[10px]">
                  {t("demo3d.solarInfoCompositionLabel")}
                </dt>
                <dd className="text-white/90 mt-0.5">
                  {t(`demo3d.${info.composition}`)}
                </dd>
              </div>
              <div>
                <dt className="text-white/40 uppercase tracking-wide text-[10px]">
                  {t("demo3d.solarInfoDistanceLabel")}
                </dt>
                <dd className="text-white/90 mt-0.5">
                  {t(`demo3d.${info.distance}`)}
                </dd>
              </div>
              <div>
                <dt className="text-white/40 uppercase tracking-wide text-[10px]">
                  {t("demo3d.solarInfoDayLengthLabel")}
                </dt>
                <dd className="text-white/90 mt-0.5">
                  {t(`demo3d.${info.dayLength}`)}
                </dd>
              </div>
              <div>
                <dt className="text-white/40 uppercase tracking-wide text-[10px]">
                  {t("demo3d.solarInfoYearLengthLabel")}
                </dt>
                <dd className="text-white/90 mt-0.5">
                  {t(`demo3d.${info.yearLength}`)}
                </dd>
              </div>
              <div>
                <dt className="text-white/40 uppercase tracking-wide text-[10px]">
                  {t("demo3d.solarInfoTemperatureLabel")}
                </dt>
                <dd className="text-white/90 mt-0.5">
                  {t(`demo3d.${info.temperature}`)}
                </dd>
              </div>
            </dl>
            <p className="text-white/30 text-[10px] mt-3">
              {t("demo3d.solarInfoApproxNote")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
