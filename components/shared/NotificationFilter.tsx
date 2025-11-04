import type { NotificationType } from '@/types/core/notification';

type FilterType = 'ALL' | NotificationType;

interface NotificationFilterProps {
  selected: FilterType;
  onChange: (filter: FilterType) => void;
  counts?: Partial<Record<FilterType, number>>;
}

const filterOptions: { value: FilterType; label: string; icon: string }[] = [
  { value: 'ALL', label: 'Tümü', icon: '📋' },
  { value: 'job_application', label: 'İş Başvuruları', icon: '�' },
  { value: 'job_accepted', label: 'Kabul Edilen İşler', icon: '✅' },
  { value: 'job_completed', label: 'Tamamlanan İşler', icon: '🎉' },
  { value: 'payment_received', label: 'Ödemeler', icon: '�' },
  { value: 'message_received', label: 'Mesajlar', icon: '💬' },
  { value: 'review_received', label: 'Değerlendirmeler', icon: '⭐' },
  { value: 'system_update', label: 'Sistem', icon: '⚙️' },
  { value: 'promotion', label: 'Promosyonlar', icon: '🎁' },
  { value: 'reminder', label: 'Hatırlatmalar', icon: '⏰' },
];

export function NotificationFilter({
  selected,
  onChange,
  counts,
}: NotificationFilterProps) {
  return (
    <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto pb-2">
      {filterOptions.map((option) => {
        const count = counts?.[option.value];
        const hasCount = count !== undefined && count > 0;

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              selected === option.value
                ? 'bg-blue-600 text-white'
                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
            {hasCount && (
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                  selected === option.value
                    ? 'bg-white text-blue-600'
                    : 'bg-blue-100 text-blue-600'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
