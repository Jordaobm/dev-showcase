const PALETTE = [
  { bg: "bg-rose-50", text: "text-rose-600" },
  { bg: "bg-blue-50", text: "text-blue-600" },
  { bg: "bg-emerald-50", text: "text-emerald-600" },
  { bg: "bg-violet-50", text: "text-violet-600" },
  { bg: "bg-amber-50", text: "text-amber-600" },
];

const colorFor = (name: string) => {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
};

const initialsFor = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

interface ParticipantAvatarProps {
  name: string;
  size?: "sm" | "md";
  showPresence?: boolean;
  online?: boolean;
}

export const ParticipantAvatar = ({
  name,
  size = "md",
  showPresence,
  online,
}: ParticipantAvatarProps) => {
  const color = colorFor(name || "?");
  const sizeClass = size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs";

  return (
    <div className="relative flex-shrink-0">
      <div
        className={`${sizeClass} ${color.bg} ${color.text} rounded-full flex items-center justify-center font-semibold ring-1 ring-black/5`}
      >
        {initialsFor(name) || "?"}
      </div>
      {showPresence && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-white ${
            online ? "bg-emerald-400" : "bg-gray-300"
          }`}
        />
      )}
    </div>
  );
};
