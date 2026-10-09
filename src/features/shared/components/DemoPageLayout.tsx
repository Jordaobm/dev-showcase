"use client";

interface DemoFeatureChip {
  label: string;
  id: string | null;
  done: boolean;
}

interface DemoPageLayoutProps {
  summaryLabel: string;
  features: DemoFeatureChip[];
  children: React.ReactNode;
}

export const DemoPageLayout = ({
  summaryLabel,
  features,
  children,
}: Readonly<DemoPageLayoutProps>) => {
  return (
    <div className="space-y-8 pb-12">
      <nav
        aria-label={summaryLabel}
        className="flex flex-col gap-3 border-b border-gray-100 pb-6 sm:flex-row sm:items-baseline sm:gap-6"
      >
        <span className="shrink-0 text-sm font-semibold text-gray-900">
          {summaryLabel}
        </span>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {features.map(({ label, id, done }) => (
            <li key={label}>
              {done ? (
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById(id!)
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="cursor-pointer text-gray-600 transition-colors hover:text-[var(--premium-red)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--premium-red)]"
                >
                  {label}
                </button>
              ) : (
                <span className="text-gray-400">{label}</span>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div>{children}</div>
    </div>
  );
};
