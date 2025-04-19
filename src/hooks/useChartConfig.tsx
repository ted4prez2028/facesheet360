
import { useTheme } from 'next-themes';

export const useChartConfig = () => {
  const { theme } = useTheme();
  
  const isDark = theme === 'dark';

  return {
    colors: {
      primary: isDark ? '#9b87f5' : '#7E69AB',
      secondary: isDark ? '#7E69AB' : '#6E59A5',
      accent: isDark ? '#D6BCFA' : '#9b87f5',
      muted: isDark ? '#1A1F2C' : '#F1F0FB',
      background: isDark ? '#1A1F2C' : '#FFFFFF',
      text: isDark ? '#FFFFFF' : '#1A1F2C',
    },
    gridLines: {
      color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
    tooltip: {
      background: isDark ? '#2D3748' : '#FFFFFF',
      border: isDark ? '#4A5568' : '#E2E8F0',
    },
    axis: {
      color: isDark ? '#718096' : '#4A5568',
    }
  };
};
