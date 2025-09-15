// ================================================
// UNIFIED SERVICE LAYER ARCHITECTURE
// ================================================
// Clean Architecture service layer with domain separation

// ================================================
// BASE SERVICE LAYER
// ================================================
export {
  BaseService,
  ServiceError,
  createSuccessResult,
  createErrorResult,
} from './base';
export type {
  ServiceResult,
  ServiceOptions,
  ServiceContext,
  PaginationOptions,
  PaginatedResult,
  CacheConfig,
} from './base';

// ================================================
// EXISTING SERVICES
// ================================================

// Infrastructure Services
export { WebSocketManager, getWebSocketManager } from './websocket';
export { GeocodingService } from './geocoding';

// Import types and interfaces from base
import type { BaseService } from './base';

// ================================================
// SERVICE REGISTRY
// ================================================
export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, BaseService> = new Map();

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  registerService<T extends BaseService>(name: string, service: T): void {
    this.services.set(name, service);
  }

  getService<T extends BaseService>(name: string): T | null {
    const service = this.services.get(name);
    return (service as T) || null;
  }

  hasService(name: string): boolean {
    return this.services.has(name);
  }

  getAllServices(): Map<string, BaseService> {
    return new Map(this.services);
  }

  clearServices(): void {
    this.services.clear();
  }
}
