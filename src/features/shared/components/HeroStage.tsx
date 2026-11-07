import { Code } from "lucide-react";

const LIGHT_CONES = [
  { left: "13%", rotate: "-20deg", opacity: 0.5 },
  { left: "37%", rotate: "0deg", opacity: 1 },
  { left: "61%", rotate: "20deg", opacity: 0.5 },
];

const LACQUER =
  "linear-gradient(145deg, #f05252 0%, #dc2626 38%, #991b1b 100%)";

const Tile = () => (
  <div
    className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[22%]"
    style={{
      background: LACQUER,
      boxShadow:
        "inset 0 3px 0 rgba(255,255,255,0.45), inset 0 -14px 28px rgba(0,0,0,0.28)",
    }}
  >
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse 80% 55% at 30% 0%, rgba(255,255,255,0.65), rgba(255,255,255,0) 70%)",
      }}
    />
    <div className="hero-gloss-sweep absolute inset-y-0 -left-1/2 w-1/3" />
    <Code
      className="relative h-1/2 w-1/2 text-white"
      strokeWidth={1.75}
      style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))" }}
    />
  </div>
);

/**
 * Vitrine do hero: o logotipo do Dev Showcase em laca vermelha, em pé sobre
 * um piso brilhante, sob três holofotes. Cenário e reflexo são só CSS.
 */
export const HeroStage = () => (
  <div
    className="relative aspect-[5/4] w-full overflow-hidden rounded-[32px] border border-white/70"
    style={{
      background:
        "radial-gradient(ellipse 80% 70% at 50% 0%, #ffffff 0%, #eceef1 55%, #dcdfe4 100%)",
      boxShadow:
        "0 2px 4px rgba(0,0,0,0.03), 0 24px 60px rgba(0,0,0,0.10)",
    }}
    aria-hidden="true"
  >
    {LIGHT_CONES.map((cone) => (
      <div
        key={cone.left}
        className="absolute top-0 h-[80%] w-[26%] origin-top"
        style={{
          left: cone.left,
          opacity: cone.opacity,
          transform: `rotate(${cone.rotate})`,
          clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)",
          filter: "blur(16px)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
        }}
      />
    ))}

    <div
      className="absolute inset-x-0 bottom-0 h-[40%] border-t border-black/[0.05]"
      style={{
        background: "linear-gradient(180deg, #e3e5e9 0%, #f8f9fa 100%)",
      }}
    />

    <div
      className="absolute bottom-[26%] left-1/2 h-[5%] w-[40%] -translate-x-1/2 rounded-[50%]"
      style={{ background: "rgba(0,0,0,0.35)", filter: "blur(14px)" }}
    />

    <div className="absolute bottom-[28%] left-1/2 aspect-square w-[34%] -translate-x-1/2">
      <Tile />
    </div>

    <div
      className="absolute left-1/2 top-[72%] w-[34%] -translate-x-1/2 opacity-30"
      style={{
        maskImage:
          "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0) 50%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0) 50%)",
      }}
    >
      <div className="aspect-square w-full -scale-y-100">
        <Tile />
      </div>
    </div>
  </div>
);
