/**
 * Portfolio Analytics Charts
 * Sprint 1: Story 3.2 - Analytics Visualizations
 *
 * Recharts-based visualization components for portfolio analytics
 */

'use client';

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { PortfolioAnalytics } from '@/hooks/business/portfolio/usePortfolioAnalytics';

// ============================================================================
// COLORS
// ============================================================================

const CHART_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
];

// ============================================================================
// VIEW COUNT BAR CHART
// ============================================================================

interface ViewCountChartProps {
  data: PortfolioAnalytics['viewTrend'];
}

export function ViewCountChart({ data }: ViewCountChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-gray-500">
        Veri bulunamadı
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
        <XAxis
          dataKey="title"
          angle={-45}
          textAnchor="end"
          height={100}
          className="text-xs"
          tick={{ fontSize: 12 }}
        />
        <YAxis className="text-xs" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
          formatter={(value: number) => [
            `${value} görüntülenme`,
            'Görüntülenme',
          ]}
        />
        <Bar dataKey="views" fill="#3b82f6" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ============================================================================
// CATEGORY DISTRIBUTION PIE CHART
// ============================================================================

interface CategoryChartProps {
  data: PortfolioAnalytics['categoryDistribution'];
}

export function CategoryChart({ data }: CategoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-gray-500">
        Veri bulunamadı
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry) => {
            const percent =
              typeof entry.percent === 'number' ? entry.percent : 0;
            return `${entry.name || ''}: ${(percent * 100).toFixed(0)}%`;
          }}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
          formatter={(value, _name, props) => {
            const payload = props?.payload as
              | { name: string; count: number }
              | undefined;
            return [
              `${value} görüntülenme (${payload?.count || 0} portfolio)`,
              payload?.name || 'Kategori',
            ];
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ============================================================================
// TOP SKILLS LIST
// ============================================================================

interface TopSkillsListProps {
  data: PortfolioAnalytics['topSkills'];
}

export function TopSkillsList({ data }: TopSkillsListProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-gray-500">
        Veri bulunamadı
      </div>
    );
  }

  const maxViews = Math.max(...data.map((s) => s.totalViews));

  return (
    <div className="space-y-3">
      {data.map((skill, index) => {
        const percentage = (skill.totalViews / maxViews) * 100;
        return (
          <div key={skill.skill} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">
                #{index + 1} {skill.skill}
              </span>
              <span className="text-gray-500">
                {skill.totalViews} görüntülenme • {skill.count} portfolio
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// TOP PORTFOLIOS TABLE
// ============================================================================

interface TopPortfoliosTableProps {
  data: PortfolioAnalytics['topViewedPortfolios'];
}

export function TopPortfoliosTable({ data }: TopPortfoliosTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-gray-500">
        Veri bulunamadı
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left text-sm font-medium text-gray-500">
            <th className="pr-4 pb-3">#</th>
            <th className="pr-4 pb-3">Portfolio</th>
            <th className="pr-4 pb-3">Kategori</th>
            <th className="pr-4 pb-3 text-right">Görüntülenme</th>
            <th className="pb-3 text-right">Görseller</th>
          </tr>
        </thead>
        <tbody>
          {data.map((portfolio, index) => (
            <tr
              key={portfolio.id}
              className="border-b last:border-0 hover:bg-gray-50"
            >
              <td className="py-3 pr-4 text-sm font-medium text-gray-900">
                {index + 1}
              </td>
              <td className="py-3 pr-4">
                <div>
                  <div className="font-medium text-gray-900">
                    {portfolio.title}
                  </div>
                  <div className="line-clamp-1 text-sm text-gray-500">
                    {portfolio.description}
                  </div>
                </div>
              </td>
              <td className="py-3 pr-4 text-sm text-gray-600">
                {portfolio.category || '-'}
              </td>
              <td className="py-3 pr-4 text-right text-sm font-medium text-gray-900">
                {portfolio.viewCount}
              </td>
              <td className="py-3 text-right text-sm text-gray-600">
                {portfolio.images?.length || 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
