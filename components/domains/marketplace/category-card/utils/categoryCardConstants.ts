/**
 * CategoryCard Constants
 *
 * Icon mappings and animation configurations
 */

import {
  Code,
  Palette,
  Megaphone,
  Home,
  GraduationCap,
  Heart,
  Car,
  DollarSign,
  Leaf,
  ChefHat,
  PartyPopper,
  Dumbbell,
  Baby,
  Users,
  Scale,
  MapPin,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ============================================================================
// Icon Mapping
// ============================================================================

export const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Palette,
  Megaphone,
  Home,
  GraduationCap,
  Heart,
  Car,
  DollarSign,
  Leaf,
  ChefHat,
  PartyPopper,
  Dumbbell,
  Baby,
  Users,
  Scale,
  MapPin,
};

export const DEFAULT_ICON = Code;

// ============================================================================
// Animation Variants
// ============================================================================

export const CARD_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.23, 1, 0.32, 1],
    },
  },
  hover: {
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.23, 1, 0.32, 1],
    },
  },
};

export const ICON_VARIANTS = {
  rest: { scale: 1, rotate: 0 },
  hover: {
    scale: 1,
    rotate: 0,
    transition: { duration: 0.2 },
  },
};

export const EXPAND_VARIANTS = {
  collapsed: {
    opacity: 0,
    height: 0,
  },
  expanded: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};

export const SUBCATEGORY_EXPAND_VARIANTS = {
  collapsed: {
    opacity: 0,
    height: 0,
  },
  expanded: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.2,
    },
  },
};

// ============================================================================
// Display Constants
// ============================================================================

export const MAX_ITEMS = {
  COMPACT_SERVICES: 3,
  FEATURED_SERVICES: 3,
  DETAILED_SKILLS: 4,
  DETAILED_SERVICES: 4,
  DETAILED_SUBCATEGORIES: 3,
  DEFAULT_SUBCATEGORIES: 6,
  DEFAULT_SKILLS: 6,
};

export const SERVICE_LIST_MAX_HEIGHT = '320px'; // 80 * 4
export const SUBCATEGORY_SERVICES_MAX_HEIGHT = '384px'; // 96 * 4
