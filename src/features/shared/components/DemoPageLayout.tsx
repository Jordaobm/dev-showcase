"use client";

interface DemoFeatureChip {
  label: string;
  id: string | null;
  done: boolean;
}

interface DemoPageLayoutProps {
  name: string;
  description: string;
  summaryLabel: string;
  features: DemoFeatureChip[];
  children: React.ReactNode;
}

export const DemoPageLayout = ({
  name,
  description,
  summaryLabel,
  features,
  children,
}: Readonly<DemoPageLayoutProps>) => {
  return (
    <div className="space-y-8 pb-12">
      <div className="text-center space-y-2">
        <h3 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          {name}
        </h3>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
          {summaryLabel}
        </p>
        <div className="flex flex-wrap gap-2">
          {features.map(({ label, id, done }) =>
            done ? (
              <button
                key={label}
                onClick={() =>
                  document
                    .getElementById(id!)
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors cursor-pointer"
              >
                ✅ {label}
              </button>
            ) : (
              <span
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 text-gray-400 border border-gray-200"
              >
                🚫 {label}
              </span>
            ),
          )}
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
};
