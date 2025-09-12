'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Eye,
  Download,
  Filter,
} from 'lucide-react';

// Mock data
const metrics = [
  {
    title: 'Total Revenue',
    value: '₺331,000',
    change: '+12.5%',
    isPositive: true,
    icon: DollarSign,
  },
  {
    title: 'Active Users',
    value: '8,920',
    change: '+8.2%',
    isPositive: true,
    icon: Users,
  },
  {
    title: 'Total Jobs',
    value: '2,364',
    change: '+15.3%',
    isPositive: true,
    icon: Eye,
  },
  {
    title: 'Completion Rate',
    value: '94.2%',
    change: '-2.1%',
    isPositive: false,
    icon: TrendingUp,
  },
];

const topCategoriesData = [
  { category: 'Web Development', jobs: 156, revenue: 23400 },
  { category: 'Graphic Design', jobs: 134, revenue: 18900 },
  { category: 'Content Writing', jobs: 98, revenue: 14200 },
  { category: 'Digital Marketing', jobs: 87, revenue: 12800 },
  { category: 'Mobile App Dev', jobs: 76, revenue: 19600 },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('6m');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics & Reports
          </h1>
          <p className="mt-1 text-gray-600">
            Platform insights and performance metrics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>

          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>

          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm font-medium text-gray-600">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metric.value}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {metric.isPositive ? (
                    <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      metric.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {metric.change}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">
                    vs last period
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue Trend Card */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Chart will be implemented with Recharts
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900">₺331,000</p>
              <p className="text-sm text-green-600">+12.5% from last month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Top Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCategoriesData.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {category.category}
                  </p>
                  <p className="text-sm text-gray-500">{category.jobs} jobs</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    ₺{category.revenue.toLocaleString()}
                  </p>
                  <div className="mt-1 h-2 w-24 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{
                        width: `${(category.jobs / 156) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 py-3">
              <div>
                <p className="font-medium text-gray-900">
                  New user registration
                </p>
                <p className="text-sm text-gray-500">
                  John Doe joined as freelancer
                </p>
              </div>
              <span className="text-sm text-gray-400">2 min ago</span>
            </div>

            <div className="flex items-center justify-between border-b border-gray-200 py-3">
              <div>
                <p className="font-medium text-gray-900">Job posted</p>
                <p className="text-sm text-gray-500">
                  Web development project - ₺5,000
                </p>
              </div>
              <span className="text-sm text-gray-400">15 min ago</span>
            </div>

            <div className="flex items-center justify-between border-b border-gray-200 py-3">
              <div>
                <p className="font-medium text-gray-900">Payment completed</p>
                <p className="text-sm text-gray-500">Project #1234 - ₺2,500</p>
              </div>
              <span className="text-sm text-gray-400">1 hour ago</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Content flagged</p>
                <p className="text-sm text-gray-500">
                  Profile content requires review
                </p>
              </div>
              <span className="text-sm text-gray-400">2 hours ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
