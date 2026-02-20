"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import type { TooltipProps, LegendProps } from "recharts";

import { cn } from "@/app/lib/utils";

/* ---------------- THEMES ---------------- */

const THEMES = {
  light: "",
  dark: ".dark",
} as const;

/* ---------------- TYPES ---------------- */

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

type TooltipPayloadItem = {
  name?: string;
  value?: number;
  dataKey?: string;
  color?: string;
  payload?: Record<string, any>;
};

type CustomTooltipProps = TooltipProps<number, string> & {
  className?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
  labelKey?: string;
  label?: string | number;
  payload?: TooltipPayloadItem[];
};

/* ---------------- CONTEXT ---------------- */

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within ChartContainer");
  }
  return context;
}

/* ---------------- CONTAINER ---------------- */

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        data-chart={chartId}
        className={cn("flex aspect-video justify-center text-xs", className)}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});

ChartContainer.displayName = "ChartContainer";

/* ---------------- STYLE ---------------- */

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const entries = Object.entries(config).filter(([_, value]) => value.color || value.theme);
  if (!entries.length) return null;

  const css = Object.entries(THEMES)
    .map(([theme, prefix]) => {
      const vars = entries
        .map(([key, item]) => {
          const color = item.theme?.[theme as keyof typeof THEMES] || item.color;
          return color ? `  --color-${key}: ${color};` : "";
        })
        .join("\n");

      return `
${prefix} [data-chart=${id}] {
${vars}
}`;
    })
    .join("\n");

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
};

/* ---------------- TOOLTIP ---------------- */

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<HTMLDivElement, CustomTooltipProps>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      formatter,
      nameKey,
      labelKey,
      labelClassName,
      ...props
    },
    ref
  ) => {
    const { config } = useChart();

    if (!active || !payload?.length) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {payload.map((item: TooltipPayloadItem, index: number) => {
          const key = nameKey || item.dataKey || item.name || "value";
          const itemConfig = config[key] ?? config[item.name ?? ""];
          const color = item.color || item.payload?.fill || "gray";

          return (
            <div key={index} className="flex w-full items-center gap-2">
              {!hideIndicator && (
                <div
                  className="shrink-0 rounded-xs border-[--color-border] bg-[--color-bg]"
                  style={{
                    "--color-bg": color,
                    "--color-border": color,
                    width: indicator === "dot" ? "0.625rem" : "0.25rem",
                    height: "0.625rem",
                  } as React.CSSProperties}
                />
              )}
              <span>{itemConfig?.label ?? item.name}</span>
              <span className="ml-auto font-mono font-medium tabular-nums text-foreground">
                {formatter ? formatter(item.value ?? 0, item.name ?? "", item as any, index, payload as any) : item.value}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
);

ChartTooltipContent.displayName = "ChartTooltipContent";

/* ---------------- LEGEND ---------------- */

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean;
      nameKey?: string;
    }
>(({ className, payload, verticalAlign = "bottom", hideIcon = false, nameKey }, ref) => {
  const { config } = useChart();
  if (!payload?.length) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {(payload as TooltipPayloadItem[]).map((item, index) => {
        const key = nameKey || item.dataKey || "value";
        const itemConfig = config[key];

        return (
          <div key={index} className="flex items-center gap-1.5">
            {!hideIcon && (
              <div
                className="h-2 w-2 rounded-xs"
                style={{ backgroundColor: item.color || "gray" }}
              />
            )}
            <span>{itemConfig?.label ?? item.value}</span>
          </div>
        );
      })}
    </div>
  );
});

ChartLegendContent.displayName = "ChartLegendContent";

/* ---------------- EXPORT ---------------- */

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
