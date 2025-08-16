
"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

// Chart container component
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: Record<string, unknown>
  }
>(({ className, children, config, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("w-full", className)} {...props}>
      {children}
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

// Chart tooltip component
interface ChartTooltipProps extends React.ComponentProps<"div"> {
  active?: boolean
  payload?: Array<{ value: number | string; name: string; color?: string }>
  label?: string
  labelFormatter?: (value: string) => string
  labelClassName?: string
  formatter?: (value: number | string, name: string) => [string, string]
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "line" | "dot" | "dashed"
  nameKey?: string
  labelKey?: string
}

const ChartTooltip = React.forwardRef<HTMLDivElement, ChartTooltipProps>(
  ({ className, active, payload, label, labelFormatter, labelClassName, formatter, hideLabel, hideIndicator, indicator, nameKey, labelKey, ...props }, ref) => {
    if (!active || !payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-background p-2 shadow-md",
          className
        )}
        {...props}
      >
        {!hideLabel && label && (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter ? labelFormatter(label) : label}
          </div>
        )}
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              {!hideIndicator && (
                <div 
                  className={cn(
                    "h-2 w-2 rounded-full",
                    indicator === "line" && "h-0.5 w-4",
                    indicator === "dashed" && "h-0.5 w-4 border-dashed border-t-2"
                  )}
                  style={{ backgroundColor: entry.color }}
                />
              )}
              <span className="text-sm text-muted-foreground">
                {entry.name}:
              </span>
              <span className="text-sm font-medium">
                {formatter ? formatter(entry.value, entry.name)[0] : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
)
ChartTooltip.displayName = "ChartTooltip"

// Chart legend component
const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center space-x-4", className)}
      {...props}
    />
  )
})
ChartLegend.displayName = "ChartLegend"

export {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
}

// Re-export all Recharts components
export {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
