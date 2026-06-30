"use client";

import {
  Center,
  Environment,
  Float,
  OrbitControls,
  PerspectiveCamera,
  RoundedBoxGeometry,
  Text,
  Text3D,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Box, Camera, Lightbulb, MousePointer2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";

const LOGO_FACES = [
  { id: "front", position: [0, 0, 0.51] as const, rotation: [0, 0, 0] as const },
  { id: "back", position: [0, 0, -0.51] as const, rotation: [0, Math.PI, 0] as const },
  { id: "right", position: [0.51, 0, 0] as const, rotation: [0, Math.PI / 2, 0] as const },
  { id: "left", position: [-0.51, 0, 0] as const, rotation: [0, -Math.PI / 2, 0] as const },
];

const Logo = () => {
  return (
    <group>
      <mesh castShadow>
        <RoundedBoxGeometry args={[1, 1, 1]} radius={0.25} smoothness={4} />
        <meshStandardMaterial color="#DC2626" metalness={0.3} roughness={0.2} />
      </mesh>
      {LOGO_FACES.map((face) => (
        <Text
          key={face.id}
          position={face.position}
          rotation={face.rotation}
          fontSize={0.3}
          color="#fff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
          font="/fonts/fira-code-bold.ttf"
          outlineWidth={0.008}
          outlineColor="#fff"
          scale={[1, 1.3, 1]}
        >
          {"</>"}
        </Text>
      ))}

      <Center position={[1, 0.19, 0]}>
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={0.28}
          height={0.08}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.012}
          bevelSize={0.008}
          bevelSegments={4}
          castShadow
        >
          Dev
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.2}
            roughness={0.4}
          />
        </Text3D>
      </Center>

      <Center position={[2.4, 0.19, 0]}>
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={0.28}
          height={0.08}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.012}
          bevelSize={0.008}
          bevelSegments={4}
          castShadow
        >
          Showcase
          <meshStandardMaterial
            color="#DC2626"
            metalness={0.2}
            roughness={0.3}
          />
        </Text3D>
      </Center>

      <Center position={[1.7, -0.26, 0]}>
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={0.18}
          height={0.05}
          curveSegments={8}
          bevelEnabled
          bevelThickness={0.007}
          bevelSize={0.005}
          bevelSegments={3}
          castShadow
        >
          Premium Portfolio
          <meshStandardMaterial
            color="#888888"
            metalness={0.1}
            roughness={0.5}
          />
        </Text3D>
      </Center>
    </group>
  );
};

const SCENE_ELEMENT_KEYS = [
  { labelKey: "orbitElementLogoLabel", descKey: "orbitElementLogoDesc" },
  { labelKey: "orbitElementTextLabel", descKey: "orbitElementTextDesc" },
  { labelKey: "orbitElementFloatLabel", descKey: "orbitElementFloatDesc" },
  { labelKey: "orbitElementEnvLabel", descKey: "orbitElementEnvDesc" },
  { labelKey: "orbitElementShadowLabel", descKey: "orbitElementShadowDesc" },
  { labelKey: "orbitElementPbrLabel", descKey: "orbitElementPbrDesc" },
] as const;

export const OrbitControlsSection = () => {
  const t = useTranslations();

  const interactionTips = [
    { actionKey: "orbitDragTip", descKey: "orbitDragDesc" },
    { actionKey: "commonScrollTip", descKey: "commonScrollDesc" },
    { actionKey: "commonMobileTip", descKey: "commonMobileDesc" },
  ] as const;

  return (
    <div id="orbit-controls" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("demo3d.orbitTitle")}
      </h3>

      <div className="mt-4 space-y-6 text-gray-600 text-base leading-relaxed">
        <div>
          <p>{t.rich("demo3d.orbitIntroDesc1", renderHtmlText)}</p>
          <p className="mt-2">
            {t.rich("demo3d.orbitIntroDesc2", renderHtmlText)}
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
        className="mt-4 rounded-xl overflow-hidden border border-gray-200"
        style={{ height: 500 }}
      >
        <Canvas shadows="soft" style={{ height: "100%" }}>
          <PerspectiveCamera makeDefault position={[-2, 1, 6]} />
          <OrbitControls enablePan={false} target={[1.2, 0, 0]} />
          <Environment preset="sunset" />
          <directionalLight
            position={[3, 8, 4]}
            intensity={10}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-radius={12}
            shadow-camera-left={-4}
            shadow-camera-right={6}
            shadow-camera-top={4}
            shadow-camera-bottom={-4}
          />
          <Float
            speed={1.5}
            floatIntensity={0.4}
            rotationIntensity={0}
            position={[0, 0.3, 0]}
          >
            <Logo />
          </Float>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[1.2, -0.51, 0]}
            receiveShadow
          >
            <planeGeometry args={[14, 10]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </Canvas>
      </div>
    </div>
  );
};
