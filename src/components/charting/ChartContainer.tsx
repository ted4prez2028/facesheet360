
import { useChartConfig } from "@/hooks/useChartConfig";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartContainerProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const ChartContainer = ({ children, title, className }: ChartContainerProps) => {
  const config = useChartConfig();

  return (
    <Card className={cn("p-4", className)}>
      {title && (
        <h3 className="text-lg font-medium mb-4">{title}</h3>
      )}
      <div className="w-full" style={{ minHeight: "300px" }}>
        {children}
      </div>
    </Card>
  );
};

export default ChartContainer;
