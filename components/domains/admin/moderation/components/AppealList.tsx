/**
 * Appeal List Component
 *
 * Displays list of content appeals as interactive cards.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { FileText, Eye, User, Calendar, UserCheck } from 'lucide-react';
import type { ContentAppeal } from '../types/appeal';
import {
  getStatusIcon,
  getStatusColor,
  getPriorityColor,
  getReasonText,
  formatAppealDate,
} from '../utils/appealHelpers';

interface AppealListProps {
  appeals: ContentAppeal[];
  onAppealClick: (appeal: ContentAppeal) => void;
  isLoading?: boolean;
}

export function AppealList({
  appeals,
  onAppealClick,
  isLoading,
}: AppealListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <p className="text-gray-500">İtirazlar yükleniyor...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>İtiraz Listesi ({appeals.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {appeals.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
              <p className="text-gray-500">
                Filtrelerinizle eşleşen itiraz bulunamadı
              </p>
            </div>
          ) : (
            appeals.map((appeal) => {
              const StatusIcon = getStatusIcon(appeal.status);

              return (
                <div
                  key={appeal.id}
                  className="cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md"
                  onClick={() => onAppealClick(appeal)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="mb-2 flex items-center gap-3">
                        <span className="font-semibold text-blue-600">
                          #{appeal.appealNumber}
                        </span>
                        <Badge
                          className={`border ${getStatusColor(appeal.status)} flex items-center gap-1`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {appeal.status}
                        </Badge>
                        <Badge
                          className={`border ${getPriorityColor(appeal.priority)}`}
                        >
                          {appeal.priority}
                        </Badge>
                      </div>

                      {/* Title */}
                      <h3 className="mb-1 font-medium text-gray-900">
                        {appeal.originalContent.title}
                      </h3>

                      {/* Reason */}
                      <p className="mb-2 text-sm text-gray-600">
                        <strong>İtiraz Nedeni:</strong>{' '}
                        {getReasonText(appeal.appealReason)}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {appeal.userInfo.firstName} {appeal.userInfo.lastName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatAppealDate(appeal.createdAt)}
                        </span>
                        {appeal.assignedTo && (
                          <span className="flex items-center gap-1">
                            <UserCheck className="h-3 w-3" />
                            {appeal.assignedTo.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="ml-4 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppealClick(appeal);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
