'use client';

import { useToast } from '@/hooks/useToast';

interface ToastContainerProps {
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
}) => {
  const { toasts, hideToast } = useToast();

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  const getToastColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'info':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className={`fixed z-50 ${positionClasses[position]} pointer-events-none`}
    >
      <div className="space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={` ${getToastColor(toast.type)} animate-in slide-in-from-top-2 fade-in pointer-events-auto max-w-[400px] min-w-[300px] rounded-lg px-4 py-3 shadow-lg duration-300`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getToastIcon(toast.type)}</span>
                <span className="text-sm font-medium">{toast.message}</span>
              </div>
              <button
                onClick={() => hideToast(toast.id)}
                className="ml-4 flex-shrink-0 text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
