"use client";

interface FlowStepsColumn {
  label: string;
  steps: string[];
  variant: "neutral" | "highlight";
}

const VARIANT_CLASSES = {
  neutral: {
    item: "border-gray-200 bg-gray-50",
    badge: "bg-gray-400",
    text: "text-gray-600",
  },
  highlight: {
    item: "border-green-200 bg-green-50",
    badge: "bg-green-400",
    text: "text-green-800",
  },
} as const;

interface FlowStepsGridProps {
  columns: [FlowStepsColumn, FlowStepsColumn];
}

export const FlowStepsGrid = ({ columns }: Readonly<FlowStepsGridProps>) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {columns.map((column) => {
        const classes = VARIANT_CLASSES[column.variant];
        return (
          <div key={column.label}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {column.label}
            </p>
            <div className="space-y-2">
              {column.steps.map((step, i) => (
                <div
                  key={step}
                  className={`flex items-center gap-3 p-2 border rounded-lg text-xs ${classes.item}`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${classes.badge}`}
                  >
                    {i + 1}
                  </span>
                  <span className={classes.text}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
