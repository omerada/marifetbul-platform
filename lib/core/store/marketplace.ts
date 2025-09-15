/**
 * Marketplace Store - Re-export from domains/marketplace
 * Legacy compatibility for existing imports
 */

// Re-export the marketplace store from the domains folder
export { useMarketplaceStore } from './domains/marketplace/marketplaceStore';

// Default export for compatibility
export { useMarketplaceStore as default } from './domains/marketplace/marketplaceStore';
