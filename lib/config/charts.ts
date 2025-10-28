/**
 * Chart Configuration
 * Recharts global configuration for consistent styling
 */

export const chartConfig = {
  colors: {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    success: 'hsl(142.1 76.2% 36.3%)',
    warning: 'hsl(47.9 95.8% 53.1%)',
    danger: 'hsl(0 84.2% 60.2%)',
    muted: 'hsl(var(--muted))',
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
  },

  revenue: {
    stroke: 'hsl(142.1 76.2% 36.3%)', // Success green
    fill: 'hsl(142.1 76.2% 36.3% / 0.1)',
    gradient: {
      from: 'hsl(142.1 76.2% 36.3% / 0.4)',
      to: 'hsl(142.1 76.2% 36.3% / 0.05)',
    },
  },

  spending: {
    stroke: 'hsl(221.2 83.2% 53.3%)', // Primary blue
    fill: 'hsl(221.2 83.2% 53.3% / 0.1)',
    gradient: {
      from: 'hsl(221.2 83.2% 53.3% / 0.4)',
      to: 'hsl(221.2 83.2% 53.3% / 0.05)',
    },
  },

  orders: {
    stroke: 'hsl(262.1 83.3% 57.8%)', // Purple
    fill: 'hsl(262.1 83.3% 57.8% / 0.1)',
  },

  proposals: {
    stroke: 'hsl(47.9 95.8% 53.1%)', // Warning yellow
    fill: 'hsl(47.9 95.8% 53.1% / 0.1)',
  },

  completion: {
    stroke: 'hsl(173.4 80.4% 40%)', // Teal
    fill: 'hsl(173.4 80.4% 40% / 0.1)',
  },

  grid: {
    stroke: 'hsl(var(--border))',
    strokeDasharray: '3 3',
  },

  tooltip: {
    contentStyle: {
      backgroundColor: 'hsl(var(--popover))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '0.5rem',
      padding: '0.75rem',
    },
    labelStyle: {
      color: 'hsl(var(--foreground))',
      fontWeight: 600,
      marginBottom: '0.25rem',
    },
    itemStyle: {
      color: 'hsl(var(--muted-foreground))',
    },
  },

  legend: {
    wrapperStyle: {
      paddingTop: '1rem',
    },
    iconType: 'line' as const,
  },

  responsiveContainer: {
    width: '100%',
    height: 300,
  },

  animation: {
    duration: 800,
    easing: 'ease-in-out' as const,
  },
} as const;

/**
 * Format currency for chart display
 */
export const formatChartCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M ₺`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K ₺`;
  }
  return `${value.toFixed(0)} ₺`;
};

/**
 * Format number with K/M suffix
 */
export const formatChartNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

/**
 * Format percentage
 */
export const formatChartPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * Get date label based on data range
 */
export const getDateLabel = (date: Date, days: number): string => {
  if (days <= 7) {
    // For week view, show day name
    return date.toLocaleDateString('tr-TR', { weekday: 'short' });
  } else if (days <= 31) {
    // For month view, show day
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  } else {
    // For longer periods, show month
    return date.toLocaleDateString('tr-TR', {
      month: 'short',
      year: '2-digit',
    });
  }
};

/**
 * Chart responsive breakpoints
 */
export const chartBreakpoints = {
  mobile: {
    height: 250,
    fontSize: 12,
    showLegend: false,
  },
  tablet: {
    height: 300,
    fontSize: 14,
    showLegend: true,
  },
  desktop: {
    height: 350,
    fontSize: 14,
    showLegend: true,
  },
} as const;
