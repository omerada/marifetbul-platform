import { redirect } from 'next/navigation';

/**
 * Legacy Categories Page - Redirects to new location
 *
 * This page has been replaced by the more comprehensive
 * marketplace categories page at /marketplace/categories
 *
 * All requests to /categories will be automatically redirected
 * to /marketplace/categories to maintain backward compatibility
 * and avoid duplicate content.
 */
export default function CategoriesRedirectPage() {
  redirect('/marketplace/categories');
}
