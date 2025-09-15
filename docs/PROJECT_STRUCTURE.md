# Marifet Project Structure

This document describes the organized project structure after refactoring.

## 📁 Project Structure

```
marifet/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Grouped route - Authentication pages
│   ├── (dashboard)/    # Grouped route - Dashboard pages
│   ├── admin/          # Admin panel routes
│   ├── api/            # API routes
│   ├── info/           # Information pages (FAQ, How-it-works)
│   ├── legal/          # Legal pages (Privacy, Terms, Cookies, Safety)
│   └── [other-routes]/ # Other application routes
├── components/         # React Components
│   ├── domains/        # Business domain components
│   ├── shared/         # Cross-domain shared components
│   ├── ui/             # Base UI components
│   ├── layout/         # Layout components
│   ├── forms/          # Form components
│   └── providers/      # Context providers
├── hooks/              # Custom React Hooks
│   ├── business/       # Business logic hooks
│   ├── core/           # Core system hooks
│   ├── infrastructure/ # External service hooks
│   └── shared/         # Shared utility hooks
├── lib/                # Library & Utilities
│   ├── core/           # Core system (store, validations, constants)
│   ├── domains/        # Business domain logic
│   ├── infrastructure/ # External integrations (API, MSW, services)
│   └── shared/         # Shared utilities
├── types/              # TypeScript Type Definitions
│   ├── business/       # Business domain types
│   ├── core/           # Core system types
│   └── shared/         # Shared utility types
├── public/             # Static assets
├── scripts/            # Build and utility scripts
└── docs/               # Documentation
```

## 🎯 Organizational Principles

### 1. Domain-Driven Design

- Components, hooks, and types are organized by business domains
- Clear separation between business logic and infrastructure

### 2. Clean Architecture

- **Core**: Essential business logic and system components
- **Infrastructure**: External system integrations and APIs
- **Shared**: Common utilities used across domains

### 3. Route Grouping

- **(auth)**: Authentication-related pages
- **(dashboard)**: Dashboard and user panel pages
- **legal**: Privacy, terms, cookies, safety pages
- **info**: Informational pages like FAQ, how-it-works

### 4. Component Classification

- **domains/**: Business-specific components (admin, marketplace, jobs, etc.)
- **shared/**: Cross-domain reusable components
- **ui/**: Base design system components
- **layout/**: Layout and navigation components
- **forms/**: Form-related components
- **providers/**: React context providers

### 5. Hook Categories

- **business/**: Domain business logic hooks
- **core/**: System-level hooks (auth, toast, async operations)
- **infrastructure/**: External service hooks (API, integrations, data)
- **shared/**: Common utility hooks (UI, base functionality)

### 6. Lib Organization

- **core/**: System essentials (store, validations, constants, production settings)
- **domains/**: Business domain logic and services
- **infrastructure/**: External integrations (API clients, WebSocket, MSW, repositories)
- **shared/**: Utilities and common functions

### 7. Type Organization

- **business/**: Domain-specific type definitions
- **core/**: System and base type definitions
- **shared/**: Common utility and helper types

## 📋 Benefits

### ✅ **Eliminated Duplicates**

- Removed 6 duplicate utility files
- Consolidated MobileNavigation components
- Unified authentication hooks
- Cleaned up conflicting exports

### ✅ **Improved Organization**

- Clear separation of concerns
- Logical grouping of related functionality
- Consistent naming conventions
- Better discoverability

### ✅ **Enhanced Maintainability**

- Easier to locate specific functionality
- Reduced cognitive load for developers
- Clear dependency relationships
- Production-ready TypeScript configuration

### ✅ **Optimized Exports**

- Proper barrel exports for each module
- Resolved naming conflicts
- Improved tree-shaking capabilities
- Clean import statements

## 🚀 Next Steps

This structure is now ready for:

- Feature development
- Team collaboration
- Production deployment
- Scaling and maintenance

All TypeScript errors have been resolved and the project maintains backward compatibility through proper exports.
