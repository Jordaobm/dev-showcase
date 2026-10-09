import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface ShowroomStageProps {
  icon: LucideIcon;
  active: boolean;
  children?: ReactNode;
}

export const ShowroomStage = ({
  icon: Icon,
  active,
  children,
}: Readonly<ShowroomStageProps>) => (
  <div
    className="relative aspect-[16/10] w-full overflow-hidden"
    style={{
      background:
        "radial-gradient(ellipse 75% 65% at 50% 0%, #ffffff 0%, #f2f3f5 55%, #e7e9ed 100%)",
    }}
    aria-hidden="true"
  >
    <div
      className="absolute inset-x-0 bottom-0 h-[40%] border-t border-black/[0.04]"
      style={{
        background: "linear-gradient(180deg, #e8eaee 0%, #f7f8f9 100%)",
      }}
    />

    <div
      className="absolute left-1/2 top-0 h-full w-[75%] -translate-x-1/2 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
      style={{
        background:
          "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 70%)",
      }}
    />

    <div
      className="absolute bottom-[14%] left-1/2 h-[15%] w-[46%] -translate-x-1/2 rounded-[50%]"
      style={{
        background: "radial-gradient(ellipse at 50% 25%, #ffffff, #dde0e5)",
        boxShadow:
          "0 16px 24px -10px rgba(0,0,0,0.28), inset 0 -2px 4px rgba(0,0,0,0.05)",
      }}
    />

    <div
      className="absolute bottom-[23%] left-1/2 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-[22px] transition-transform duration-500 motion-safe:group-hover:-translate-y-1.5"
      style={{
        background: "linear-gradient(145deg, #ffffff, #eceef1)",
        boxShadow:
          "0 20px 28px -12px rgba(0,0,0,0.3), inset 0 1px 0 #ffffff, inset 0 -2px 6px rgba(0,0,0,0.05)",
      }}
    >
      <Icon
        className="h-9 w-9"
        strokeWidth={1.5}
        style={{ color: active ? "var(--premium-red)" : "#9ca3af" }}
      />
    </div>

    {children}
  </div>
);
