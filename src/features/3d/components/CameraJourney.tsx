"use client";

import {
  Float,
  Html,
  PerspectiveCamera,
  Scroll,
  ScrollControls,
  Stars,
  useScroll,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MousePointer2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";
import {
  SiAngular,
  SiDocker,
  SiGit,
  SiGithub,
  SiGithubactions,
  SiGitlab,
  SiJavascript,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiOpenjdk,
  SiPostgresql,
  SiReact,
  SiSpringboot,
  SiSqlite,
  SiTypescript,
  SiVite,
} from "react-icons/si";
import type { IconType } from "react-icons";
import { SOCIAL_LINKS } from "@/lib/social-links";
import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";

const CAMERA_Z_START = 30;

const INTRO_SCROLL_FRACTION = 0.0;

interface TechEntry {
  name: string;
  descKey: string;
  Icon: IconType;
  color: string;
  z: number;
  side: "left" | "right";
}

interface CategorySection {
  title: string;
  techs: Array<Omit<TechEntry, "z" | "side">>;
}

const CORRIDOR_SECTIONS: CategorySection[] = [
  {
    title: "Frontend",
    techs: [
      {
        name: "React",
        descKey: "journeyTechReactDesc",
        Icon: SiReact,
        color: "#61DAFB",
      },
      {
        name: "JavaScript",
        descKey: "journeyTechJavaScriptDesc",
        Icon: SiJavascript,
        color: "#F7DF1E",
      },
      {
        name: "TypeScript",
        descKey: "journeyTechTypeScriptDesc",
        Icon: SiTypescript,
        color: "#3178C6",
      },
      {
        name: "Angular",
        descKey: "journeyTechAngularDesc",
        Icon: SiAngular,
        color: "#DD0031",
      },
      {
        name: "Next.js",
        descKey: "journeyTechNextjsDesc",
        Icon: SiNextdotjs,
        color: "#FFFFFF",
      },
      {
        name: "Vite",
        descKey: "journeyTechViteDesc",
        Icon: SiVite,
        color: "#646CFF",
      },
    ],
  },
  {
    title: "Backend",
    techs: [
      {
        name: "Node.js",
        descKey: "journeyTechNodeDesc",
        Icon: SiNodedotjs,
        color: "#68A063",
      },
      {
        name: "Java",
        descKey: "journeyTechJavaDesc",
        Icon: SiOpenjdk,
        color: "#f89820",
      },
      {
        name: "Spring Boot",
        descKey: "journeyTechSpringBootDesc",
        Icon: SiSpringboot,
        color: "#6DB33F",
      },
    ],
  },
  {
    title: "Banco de Dados",
    techs: [
      {
        name: "PostgreSQL",
        descKey: "journeyTechPostgresDesc",
        Icon: SiPostgresql,
        color: "#336791",
      },
      {
        name: "MySQL",
        descKey: "journeyTechMySqlDesc",
        Icon: SiMysql,
        color: "#4479A1",
      },
      {
        name: "MongoDB",
        descKey: "journeyTechMongoDesc",
        Icon: SiMongodb,
        color: "#47A248",
      },
      {
        name: "SQLite",
        descKey: "journeyTechSqliteDesc",
        Icon: SiSqlite,
        color: "#003B57",
      },
    ],
  },
  {
    title: "DevOps",
    techs: [
      {
        name: "Docker",
        descKey: "journeyTechDockerDesc",
        Icon: SiDocker,
        color: "#2496ED",
      },
      {
        name: "CI/CD",
        descKey: "journeyTechCiCdDesc",
        Icon: SiGithubactions,
        color: "#2088FF",
      },
      {
        name: "GitHub",
        descKey: "journeyTechGitHubDesc",
        Icon: SiGithub,
        color: "#FFFFFF",
      },
      {
        name: "GitLab",
        descKey: "journeyTechGitLabDesc",
        Icon: SiGitlab,
        color: "#FC6D26",
      },
      {
        name: "GitFlow",
        descKey: "journeyTechGitFlowDesc",
        Icon: SiGit,
        color: "#F05032",
      },
    ],
  },
];

interface ArchEntry {
  title: string;
  z: number;
}

const ITEM_SPACING = 9;
const ARCH_GAP = 10;
const PORTAL_GAP = 16;
const CORRIDOR_START_Z = 10;

const buildCorridor = () => {
  const techs: TechEntry[] = [];
  const arches: ArchEntry[] = [];
  let z = CORRIDOR_START_Z;

  CORRIDOR_SECTIONS.forEach((section, sectionIndex) => {
    if (sectionIndex > 0) {
      z -= ARCH_GAP;
      arches.push({ title: section.title, z });
      z -= ARCH_GAP / 2;
    }
    section.techs.forEach((tech, techIndex) => {
      z -= ITEM_SPACING;
      techs.push({ ...tech, z, side: techIndex % 2 === 0 ? "left" : "right" });
    });
  });

  z -= PORTAL_GAP;
  const portalZ = z;

  return { techs, arches, portalZ };
};

const {
  techs: TECH_STACK,
  arches: CATEGORY_ARCHES,
  portalZ: PORTAL_Z,
} = buildCorridor();

const CAMERA_Z_END = PORTAL_Z + 4;

const SIDE_X = { left: -3.2, right: 3.2 };

const OVERLAY_Z_INDEX_RANGE: [number, number] = [900, 0];

const PORTAL_CTA_Z_INDEX_RANGE: [number, number] = [1900, 1100];

const useCanvasPortal = () => {
  const { gl } = useThree();
  return useMemo(
    () => ({ current: gl.domElement.parentNode as HTMLElement }),
    [gl],
  );
};

const SPIRAL_RADIUS = 0.5;
const SPIRAL_SPEED = 0.7;

const SpiralFloat = ({
  children,
  phase,
}: Readonly<{ children: ReactNode; phase: number }>) => {
  const ref = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = phase + state.clock.elapsedTime * SPIRAL_SPEED;
    ref.current.position.x = Math.cos(t) * SPIRAL_RADIUS;
    ref.current.position.y = Math.sin(t) * SPIRAL_RADIUS;
  });

  return <group ref={ref}>{children}</group>;
};

const TechItem = ({
  name,
  desc,
  Icon,
  color,
  z,
  side,
}: Omit<TechEntry, "descKey"> & { desc: string }) => {
  const portal = useCanvasPortal();

  return (
    <group position={[SIDE_X[side], 0, z]}>
      <SpiralFloat phase={z}>
        <Float speed={2} floatIntensity={4} rotationIntensity={2.5}>
          <Html
            center
            distanceFactor={11}
            zIndexRange={OVERLAY_Z_INDEX_RANGE}
            portal={portal}
            style={{ pointerEvents: "none" }}
          >
            <div className="flex flex-col items-center gap-1 w-56 px-4 py-3 rounded-xl bg-black/70 border border-white/10 backdrop-blur-sm text-center">
              <Icon size={32} color={color} />
              <p className="text-white text-sm font-semibold mt-1">{name}</p>
              <p className="text-white/60 text-xs leading-relaxed">{desc}</p>
            </div>
          </Html>
        </Float>
      </SpiralFloat>
    </group>
  );
};

const TechStackObjects = ({
  techs,
}: Readonly<{
  techs: Array<Omit<TechEntry, "descKey"> & { desc: string }>;
}>) => {
  return (
    <>
      {techs.map((tech) => (
        <TechItem key={tech.name} {...tech} />
      ))}
    </>
  );
};

const ARCH_APPROACH_RANGE = 16;
const ARCH_COLOR_RAMP = 2.4;
const ARCH_RADIUS = 3.2;
const ARCH_COLOR_IDLE = new THREE.Color("#8888ff");
const ARCH_COLOR_CHARGED = new THREE.Color("#DC2626");

const CategoryArch = ({ z }: Readonly<Pick<ArchEntry, "z">>) => {
  const coreMaterialRef = useRef<THREE.MeshStandardMaterial>(null!);
  const glowMaterialRef = useRef<THREE.MeshBasicMaterial>(null!);
  const haloMaterialRef = useRef<THREE.MeshBasicMaterial>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);
  const colorScratch = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    const distanceToArch = state.camera.position.z - z;
    const progress = THREE.MathUtils.clamp(
      THREE.MathUtils.mapLinear(distanceToArch, ARCH_APPROACH_RANGE, 0, 0, 1),
      0,
      1,
    );
    const colorProgress = Math.min(1, progress * ARCH_COLOR_RAMP);

    colorScratch.copy(ARCH_COLOR_IDLE).lerp(ARCH_COLOR_CHARGED, colorProgress);

    coreMaterialRef.current.emissive.copy(colorScratch);
    coreMaterialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      1,
      2.4,
      colorProgress,
    );

    glowMaterialRef.current.color.copy(colorScratch);
    glowMaterialRef.current.opacity = THREE.MathUtils.lerp(
      0.15,
      0.45,
      colorProgress,
    );
    haloMaterialRef.current.color.copy(colorScratch);
    haloMaterialRef.current.opacity = THREE.MathUtils.lerp(
      0.06,
      0.2,
      colorProgress,
    );

    lightRef.current.color.copy(colorScratch);
    lightRef.current.intensity = THREE.MathUtils.lerp(20, 90, colorProgress);
  });

  return (
    <group position={[0, 0, z]}>
      <mesh>
        <torusGeometry args={[ARCH_RADIUS, 0.5, 16, 64]} />
        <meshBasicMaterial
          ref={haloMaterialRef}
          color="#8888ff"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <torusGeometry args={[ARCH_RADIUS, 0.25, 16, 64]} />
        <meshBasicMaterial
          ref={glowMaterialRef}
          color="#8888ff"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <torusGeometry args={[ARCH_RADIUS, 0.1, 16, 64]} />
        <meshStandardMaterial
          ref={coreMaterialRef}
          color="#000000"
          emissive="#8888ff"
          emissiveIntensity={1}
          toneMapped={false}
          transparent
          opacity={0.9}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        color="#8888ff"
        intensity={20}
        distance={26}
        decay={1.5}
      />
    </group>
  );
};

const CategoryArches = () => {
  return (
    <>
      {CATEGORY_ARCHES.map((arch) => (
        <CategoryArch key={arch.title} {...arch} />
      ))}
    </>
  );
};

const PORTAL_RADIUS = 4.5;
const PORTAL_APPROACH_RANGE = 24;
const PORTAL_CTA_DISTANCE = 8;

const Portal = ({
  finalHeading,
  finalSubtext,
}: Readonly<{
  finalHeading: string;
  finalSubtext: string;
}>) => {
  const portal = useCanvasPortal();
  const coreMaterialRef = useRef<THREE.MeshStandardMaterial>(null!);
  const glowMaterialRef = useRef<THREE.MeshBasicMaterial>(null!);
  const haloMaterialRef = useRef<THREE.MeshBasicMaterial>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);
  const colorScratch = useMemo(() => new THREE.Color(), []);
  const [ctaVisible, setCtaVisible] = useState(false);

  useFrame((state) => {
    const distanceToPortal = state.camera.position.z - PORTAL_Z;
    const progress = THREE.MathUtils.clamp(
      THREE.MathUtils.mapLinear(
        distanceToPortal,
        PORTAL_APPROACH_RANGE,
        0,
        0,
        1,
      ),
      0,
      1,
    );
    const colorProgress = Math.min(1, progress * ARCH_COLOR_RAMP);

    colorScratch.copy(ARCH_COLOR_IDLE).lerp(ARCH_COLOR_CHARGED, colorProgress);
    coreMaterialRef.current.emissive.copy(colorScratch);
    coreMaterialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      1,
      2.4,
      colorProgress,
    );
    glowMaterialRef.current.color.copy(colorScratch);
    glowMaterialRef.current.opacity = THREE.MathUtils.lerp(
      0.15,
      0.5,
      colorProgress,
    );
    haloMaterialRef.current.color.copy(colorScratch);
    haloMaterialRef.current.opacity = THREE.MathUtils.lerp(
      0.06,
      0.25,
      colorProgress,
    );
    lightRef.current.color.copy(colorScratch);
    lightRef.current.intensity = THREE.MathUtils.lerp(20, 120, colorProgress);

    const visible = distanceToPortal < PORTAL_CTA_DISTANCE;
    if (visible !== ctaVisible) setCtaVisible(visible);
  });

  return (
    <group position={[0, 0, PORTAL_Z]}>
      <mesh>
        <torusGeometry args={[PORTAL_RADIUS, 0.6, 16, 64]} />
        <meshBasicMaterial
          ref={haloMaterialRef}
          color="#8888ff"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <torusGeometry args={[PORTAL_RADIUS, 0.3, 16, 64]} />
        <meshBasicMaterial
          ref={glowMaterialRef}
          color="#8888ff"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <torusGeometry args={[PORTAL_RADIUS, 0.14, 16, 64]} />
        <meshStandardMaterial
          ref={coreMaterialRef}
          color="#000000"
          emissive="#8888ff"
          emissiveIntensity={1}
          toneMapped={false}
          transparent
          opacity={0.9}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        color="#8888ff"
        intensity={20}
        distance={34}
        decay={1.5}
      />
      <Html
        center
        zIndexRange={PORTAL_CTA_Z_INDEX_RANGE}
        portal={portal}
        className={ctaVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
        style={{
          transition: "opacity 0.6s",
          visibility: ctaVisible ? "visible" : "hidden",
        }}
      >
        <div className="flex flex-col items-center gap-5 text-center w-md px-8 py-7 rounded-3xl bg-black/80 border border-white/15 backdrop-blur-sm">
          <p className="text-white text-3xl font-bold">{finalHeading}</p>
          <p className="text-white/70 text-base leading-relaxed">
            {finalSubtext}
          </p>
          <div className="flex gap-4 mt-1">
            <a
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full bg-white text-black text-base font-semibold hover:bg-white/90 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full bg-black/80 border border-white/20 text-white text-base font-semibold hover:bg-black transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </Html>
    </group>
  );
};

const CameraRig = () => {
  const scroll = useScroll();

  useFrame((state) => {
    const travel = scroll.range(
      INTRO_SCROLL_FRACTION,
      1 - INTRO_SCROLL_FRACTION,
    );
    const targetZ = THREE.MathUtils.lerp(CAMERA_Z_START, CAMERA_Z_END, travel);
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      targetZ,
      0.08,
    );
  });

  return null;
};

const IntroNarrative = ({
  heading,
  subtext,
}: Readonly<{
  heading: string;
  subtext: string;
}>) => {
  return (
    <section
      style={{ height: "100vh" }}
      className="flex flex-col justify-center px-8 md:px-16"
    >
      <div className="max-w-md">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          {heading}
        </h2>
        <p className="text-white/70 text-sm md:text-base leading-relaxed">
          {subtext}
        </p>
      </div>
    </section>
  );
};

export const CameraJourneySection = () => {
  const t = useTranslations();

  const interactionTips = [
    { actionKey: "journeyScrollTip", descKey: "journeyScrollDesc" },
    { actionKey: "journeyTouchTip", descKey: "journeyTouchDesc" },
  ] as const;

  const techStack = TECH_STACK.map((tech) => ({
    ...tech,
    desc: t(`demo3d.${tech.descKey}`),
  }));

  return (
    <div id="camera-journey" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("demo3d.journeyTitle")}
      </h3>

      <div className="mt-4 space-y-2 text-gray-600 text-base leading-relaxed">
        <p>{t.rich("demo3d.journeyIntroDesc", renderHtmlText)}</p>
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
        <div className="flex items-center gap-2 mb-3">
          <MousePointer2 className="w-4 h-4 shrink-0" />
          <p className="font-bold">{t("demo3d.commonInteractionTitle")}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
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
        style={{ height: "80vh", minHeight: 560 }}
      >
        <Canvas style={{ height: "100%" }}>
          <color attach="background" args={["#000010"]} />
          <fog attach="fog" args={["#000010", 5, 100]} />
          <ambientLight intensity={0.3} />
          <PerspectiveCamera
            makeDefault
            position={[0, 0, CAMERA_Z_START]}
            fov={65}
          />
          <Stars
            radius={120}
            depth={60}
            count={3500}
            factor={3}
            fade
            speed={0.4}
          />

          <ScrollControls
            pages={22}
            damping={0.25}
            style={{ overscrollBehavior: "contain", zIndex: 1000 }}
          >
            <CameraRig />
            <TechStackObjects techs={techStack} />
            <CategoryArches />
            <Portal
              finalHeading={t("demo3d.journeyFinalHeading")}
              finalSubtext={t("demo3d.journeyFinalSubtext")}
            />
            <Scroll html>
              <IntroNarrative
                heading={t("demo3d.journeyIntroHeading")}
                subtext={t("demo3d.journeyIntroSubtext")}
              />
            </Scroll>
          </ScrollControls>
        </Canvas>
      </div>
    </div>
  );
};
