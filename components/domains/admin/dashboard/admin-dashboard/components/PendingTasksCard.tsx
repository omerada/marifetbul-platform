/**
 * PendingTasksCard Component
 *
 * Pending tasks list display
 */

import { ListTodo, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { DEFAULT_TASKS, TASK_COLOR_MAP } from '../utils/dashboardConstants';
import type { PendingTasksCardProps } from '../types/adminDashboardTypes';

export function PendingTasksCard({
  tasks = DEFAULT_TASKS,
}: PendingTasksCardProps) {
  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 shadow-md">
            <ListTodo className="h-5 w-5 text-orange-600" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Bekleyen İşlemler
          </CardTitle>
        </div>
        <Button variant="ghost" size="sm" className="text-orange-600">
          Tümünü Görüntüle
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {tasks.map((task, index) => {
            const IconComponent = task.icon;
            const colorClass = TASK_COLOR_MAP[task.color];

            return (
              <div
                key={index}
                className="group flex items-center justify-between rounded-lg border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 transition-all duration-300 hover:border-gray-200 hover:shadow-md"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-md transition-all duration-300 group-hover:scale-110 ${colorClass}`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={colorClass}>{task.count}</Badge>
                  <ChevronRight className="h-5 w-5 text-gray-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
