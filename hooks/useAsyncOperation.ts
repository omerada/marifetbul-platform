// LEGACY FILE - Use hooks/core/useUnifiedAsync.ts instead
export {
  useAsyncOperation,
  useAsyncAction,
  useMultipleAsyncOperations,
  useMutation,
} from './core/useUnifiedAsync';

// Legacy type exports for backward compatibility
export type {
  AsyncOperationHook as AsyncOperationResult,
  AsyncActionHook,
  AsyncState,
  MutationOptions,
} from './core/useUnifiedAsync';
