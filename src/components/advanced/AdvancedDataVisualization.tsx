/**
 * Advanced Data Visualization Component
 * Year 3000 Level Interactive Charts and Dashboards
 */

import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Maximize2 } from 'lucide-react';

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface AdvancedDataVisualizationProps {
  data: ChartData[];
  title?: string;
  description?: string;
  chartType?: 'line' | 'area' | 'bar' | 'pie' | 'radar';
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  animated?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function AdvancedDataVisualization({
  data,
  title = 'Data Visualization',
  description,
  chartType = 'line',
  height = 400,
  colors = COLORS,
  showLegend = true,
  showGrid = true,
  animated = true,
}: AdvancedDataVisualizationProps) {
  const [selectedChart, setSelectedChart] = useState(chartType);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const chartComponents = useMemo(() => {
    const commonProps = {
      data,
      height,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (selectedChart) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ccc',
                borderRadius: '8px',
              }}
            />
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ r: 4 }}
              animationDuration={animated ? 1000 : 0}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.6}
              animationDuration={animated ? 1000 : 0}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            <Bar
              dataKey="value"
              fill={colors[0]}
              radius={[8, 8, 0, 0]}
              animationDuration={animated ? 1000 : 0}
            />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart width={height} height={height}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={height / 3}
              fill="#8884d8"
              dataKey="value"
              animationDuration={animated ? 1000 : 0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            {showLegend && <Legend />}
          </PieChart>
        );

      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data} width={height} height={height}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis />
            <Radar
              name="Value"
              dataKey="value"
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.6}
              animationDuration={animated ? 1000 : 0}
            />
            <Tooltip />
            {showLegend && <Legend />}
          </RadarChart>
        );

      default:
        return null;
    }
  }, [data, selectedChart, height, colors, showLegend, showGrid, animated]);

  const handleExport = () => {
    // Export chart as image
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    // Implementation would render chart to canvas
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${title || 'chart'}.png`;
    link.href = url;
    link.click();
  };

  return (
    <Card className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 m-0' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedChart} onValueChange={(v) => setSelectedChart(v as typeof selectedChart)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="line">Line</TabsTrigger>
            <TabsTrigger value="area">Area</TabsTrigger>
            <TabsTrigger value="bar">Bar</TabsTrigger>
            <TabsTrigger value="pie">Pie</TabsTrigger>
            <TabsTrigger value="radar">Radar</TabsTrigger>
          </TabsList>
          <TabsContent value={selectedChart} className="mt-4">
            <ResponsiveContainer width="100%" height={height}>
              {chartComponents}
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

/**
 * Real-time updating chart
 */
export function RealTimeChart({
  data,
  updateInterval = 1000,
  ...props
}: AdvancedDataVisualizationProps & { updateInterval?: number }) {
  const [chartData, setChartData] = useState(data);

  React.useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setChartData((prev) => {
        const newData = [...prev];
        const lastItem = newData[newData.length - 1];
        newData.push({
          ...lastItem,
          name: new Date().toLocaleTimeString(),
          value: Math.random() * 100,
        });
        return newData.slice(-20); // Keep last 20 points
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return <AdvancedDataVisualization {...props} data={chartData} />;
}

/**
 * 3D-like visualization using CSS transforms
 */
export function ThreeDChart({ data, ...props }: AdvancedDataVisualizationProps) {
  return (
    <div className="perspective-1000">
      <div className="transform-gpu rotate-x-12">
        <AdvancedDataVisualization {...props} data={data} />
      </div>
    </div>
  );
}

