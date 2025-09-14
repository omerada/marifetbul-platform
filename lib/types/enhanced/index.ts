/**
 * Enhanced Type System Index
 * Exports all enhanced types including branded types, discriminated unions, and API responses
 */

import type * as React from 'react';

// Re-export branded types and import Brand for local use
export * from './branded';
import type { Brand } from './branded';

// Re-export discriminated unions
export * from './discriminated-unions';

// Re-export enhanced API responses
export * from './api-responses';

// Utility type helpers
export type NonEmptyArray<T> = [T, ...T[]];

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type ValuesOf<T> = T[keyof T];

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Nullable<T> = T | null;

export type NonNullable<T> = T extends null | undefined ? never : T;

// Function type utilities
export type AsyncReturnType<
  T extends (...args: unknown[]) => Promise<unknown>,
> = T extends (...args: unknown[]) => Promise<infer R> ? R : unknown;

export type Parameters<T extends (...args: unknown[]) => unknown> = T extends (
  ...args: infer P
) => unknown
  ? P
  : never;

export type ReturnType<T extends (...args: unknown[]) => unknown> = T extends (
  ...args: unknown[]
) => infer R
  ? R
  : unknown;

// Object type utilities
export type PickByType<T, U> = Pick<T, KeysOfType<T, U>>;

export type OmitByType<T, U> = Omit<T, KeysOfType<T, U>>;

export type Flatten<T> = T extends (infer U)[] ? U : T;

export type DeepFlatten<T> = T extends (infer U)[]
  ? U extends (infer V)[]
    ? DeepFlatten<V>
    : U
  : T;

// Conditional type utilities
export type If<C extends boolean, T, F> = C extends true ? T : F;

export type Unless<C extends boolean, T, F> = C extends false ? T : F;

export type IsEqual<T, U> = T extends U ? (U extends T ? true : false) : false;

export type IsArray<T> = T extends readonly unknown[] ? true : false;

export type IsFunction<T> = T extends (...args: unknown[]) => unknown
  ? true
  : false;

export type IsObject<T> = T extends object
  ? T extends unknown[]
    ? false
    : true
  : false;

// String manipulation types
export type Capitalize<S extends string> = S extends `${infer F}${infer R}`
  ? `${Uppercase<F>}${R}`
  : S;

export type Uncapitalize<S extends string> = S extends `${infer F}${infer R}`
  ? `${Lowercase<F>}${R}`
  : S;

export type KebabCase<S extends string> = S extends `${infer F}${infer R}`
  ? F extends Uppercase<F>
    ? `-${Lowercase<F>}${KebabCase<R>}`
    : `${F}${KebabCase<R>}`
  : S;

export type CamelCase<S extends string> = S extends `${infer F}-${infer R}`
  ? `${F}${Capitalize<CamelCase<R>>}`
  : S;

export type SnakeCase<S extends string> = S extends `${infer F}${infer R}`
  ? F extends Uppercase<F>
    ? `_${Lowercase<F>}${SnakeCase<R>}`
    : `${F}${SnakeCase<R>}`
  : S;

// Array type utilities
export type Head<T extends readonly unknown[]> = T extends readonly [
  infer H,
  ...unknown[],
]
  ? H
  : never;

export type Tail<T extends readonly unknown[]> = T extends readonly [
  unknown,
  ...infer Rest,
]
  ? Rest
  : never;

export type Last<T extends readonly unknown[]> = T extends readonly [
  ...unknown[],
  infer L,
]
  ? L
  : never;

export type Init<T extends readonly unknown[]> = T extends readonly [
  ...infer I,
  unknown,
]
  ? I
  : never;

export type Length<T extends readonly unknown[]> = T['length'];

export type Reverse<T extends readonly unknown[]> = T extends readonly [
  ...infer Rest,
  infer Last,
]
  ? [Last, ...Reverse<Rest>]
  : [];

// Union type utilities
export type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type UnionToTuple<T> =
  UnionToIntersection<T extends unknown ? () => T : never> extends () => infer W
    ? [...UnionToTuple<Exclude<T, W>>, W]
    : [];

export type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;

// Record type utilities
export type RecordKey = string | number | symbol;

export type StrictRecord<K extends RecordKey, V> = Record<K, V> & {
  [P in Exclude<RecordKey, K>]?: never;
};

export type PartialRecord<K extends RecordKey, V> = Partial<Record<K, V>>;

export type RequiredRecord<K extends RecordKey, V> = { [P in K]-?: V };

// Type assertion utilities
export type Expect<T extends true> = T;

export type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? true
    : false;

export type NotEqual<X, Y> = Equal<X, Y> extends true ? false : true;

export type Extends<A, B> = A extends B ? true : false;

export type NotExtends<A, B> = Extends<A, B> extends true ? false : true;

// Database and API type utilities
export type EntityId<T extends string = string> = Brand<
  string,
  `EntityId<${T}>`
>;

export type CreatedAt = Brand<string, 'CreatedAt'>;
export type UpdatedAt = Brand<string, 'UpdatedAt'>;
export type DeletedAt = Brand<string, 'DeletedAt'>;

export interface BaseEntity {
  id: EntityId;
  createdAt: CreatedAt;
  updatedAt: UpdatedAt;
  deletedAt?: DeletedAt;
}

export interface AuditableEntity extends BaseEntity {
  createdBy: UserId;
  updatedBy: UserId;
  deletedBy?: UserId;
}

export type CreateInput<T extends BaseEntity> = Omit<T, keyof BaseEntity>;

export type UpdateInput<T extends BaseEntity> = Partial<
  Omit<T, keyof BaseEntity>
>;

export type EntityWithoutTimestamps<T extends BaseEntity> = Omit<
  T,
  'createdAt' | 'updatedAt' | 'deletedAt'
>;

// Form and validation type utilities
export type FormData<T> = {
  [K in keyof T]: T[K] extends
    | string
    | number
    | boolean
    | Date
    | null
    | undefined
    ? T[K]
    : string;
};

export type ValidationErrors<T> = Partial<Record<keyof T, string[]>>;

export interface FormState<T> {
  data: FormData<T>;
  errors: ValidationErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

// API and service type utilities
export type ServiceMethod<TInput = void, TOutput = void> = TInput extends void
  ? () => Promise<TOutput>
  : (input: TInput) => Promise<TOutput>;

export type ServiceConfig = {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
};

export interface PaginationInput {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationOutput<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Event and state management type utilities
export type EventHandler<T = void> = T extends void
  ? () => void
  : (payload: T) => void;

export interface Event<T = void> {
  type: string;
  payload: T;
  timestamp: number;
  source?: string;
}

export type StateUpdater<T> = (prevState: T) => T | Partial<T>;

export type StateSetter<T> = T | StateUpdater<T>;

// Component and UI type utilities
export type ComponentProps<
  T extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<unknown>,
> =
  T extends React.JSXElementConstructor<infer P>
    ? P
    : T extends keyof JSX.IntrinsicElements
      ? JSX.IntrinsicElements[T]
      : Record<string, unknown>;

export type PropsWithoutRef<T> = T extends unknown
  ? 'ref' extends keyof T
    ? Pick<T, Exclude<keyof T, 'ref'>>
    : T
  : T;

export type ElementType =
  | keyof JSX.IntrinsicElements
  | React.JSXElementConstructor<unknown>;

// Theme and styling type utilities
export type ThemeColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export type ThemeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ThemeVariant = 'solid' | 'outline' | 'ghost' | 'link';

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeBreakpoints {
  mobile: string;
  tablet: string;
  desktop: string;
  wide: string;
}

// JSX namespace declaration
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: unknown;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

// Import re-exports for convenience
import type { UserId } from './branded';
export type { UserId };
