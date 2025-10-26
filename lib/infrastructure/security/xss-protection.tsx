/**
 * XSS Protection Utilities - Client-Side Only
 *
 * Provides client-side input sanitization to prevent XSS attacks.
 * Uses DOMPurify for HTML sanitization (browser-only).
 *
 * IMPORTANT: This module only works on the client-side.
 * Server-side content should be sanitized by the backend.
 *
 * Features:
 * - Client-side HTML sanitization (DOMPurify)
 * - Safe render helpers for React
 * - URL validation and sanitization
 * - Attribute encoding
 * - Context-aware sanitization
 *
 * @example
 * ```tsx
 * import { sanitizeHtml, SafeHtml } from '@/lib/infrastructure/security/xss-protection';
 *
 * // Sanitize HTML (client-side only)
 * const clean = sanitizeHtml(userInput);
 *
 * // Safe render in React (use dynamic import for SSR)
 * <SafeHtml html={userContent} />
 * ```
 */

'use client';

import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import type { Config } from 'dompurify';
import { Logger } from '../monitoring/logger';

const logger = new Logger({ level: 'info' });

// ============================================================================
// DOMPURIFY CONFIGURATION
// ============================================================================

/**
 * DOMPurify configuration presets
 */
export const SANITIZE_CONFIG = {
  /**
   * Strict: Only allows basic text formatting
   * Removes all potentially dangerous elements
   */
  STRICT: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'span'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  } as Config,

  /**
   * Basic: Allows common formatting and links
   */
  BASIC: {
    ALLOWED_TAGS: [
      'b',
      'i',
      'em',
      'strong',
      'u',
      'br',
      'p',
      'span',
      'a',
      'ul',
      'ol',
      'li',
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto):)?\/\//i,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  } as Config,

  /**
   * Rich: Allows rich text formatting (blog posts, comments)
   */
  RICH: {
    ALLOWED_TAGS: [
      'b',
      'i',
      'em',
      'strong',
      'u',
      's',
      'strike',
      'del',
      'ins',
      'br',
      'p',
      'div',
      'span',
      'blockquote',
      'code',
      'pre',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'a',
      'img',
      'ul',
      'ol',
      'li',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
    ],
    ALLOWED_ATTR: [
      'href',
      'title',
      'target',
      'rel',
      'src',
      'alt',
      'width',
      'height',
      'class',
      'id',
      'colspan',
      'rowspan',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto):)?\/\//i,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  } as Config,

  /**
   * Full: Allows most HTML (for trusted admin content)
   * Still removes dangerous elements like script, object, embed
   */
  FULL: {
    FORBID_TAGS: [
      'script',
      'style',
      'iframe',
      'object',
      'embed',
      'form',
      'input',
      'button',
    ],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  } as Config,
};

// ============================================================================
// HTML SANITIZATION
// ============================================================================

/**
 * Sanitize HTML content using DOMPurify
 */
export function sanitizeHtml(
  html: string,
  config: keyof typeof SANITIZE_CONFIG | Config = 'BASIC'
): string {
  try {
    if (!html || typeof html !== 'string') {
      return '';
    }

    // Get configuration
    const purifyConfig =
      typeof config === 'string'
        ? SANITIZE_CONFIG[config as keyof typeof SANITIZE_CONFIG]
        : config;

    // Sanitize HTML
    const clean = DOMPurify.sanitize(html, purifyConfig) as string;

    logger.debug('HTML sanitized', {
      originalLength: html.length,
      cleanLength: clean.length,
      config: typeof config === 'string' ? config : 'custom',
    });

    return clean;
  } catch (error) {
    logger.error(
      'HTML sanitization error',
      error instanceof Error ? error : new Error(String(error)),
      {
        htmlLength: html?.length,
      }
    );

    // Return empty string on error (fail safe)
    return '';
  }
}

/**
 * Sanitize HTML and return only text content (strip all tags)
 */
export function sanitizeToText(html: string): string {
  try {
    if (!html || typeof html !== 'string') {
      return '';
    }

    // Use DOMPurify to remove all tags
    const text = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [],
      KEEP_CONTENT: true,
    });

    return text.trim();
  } catch (error) {
    logger.error(
      'Text sanitization error',
      error instanceof Error ? error : new Error(String(error)),
      {
        htmlLength: html?.length,
      }
    );

    return '';
  }
}

// ============================================================================
// URL SANITIZATION
// ============================================================================

/**
 * Sanitize URL to prevent javascript: and data: URLs
 */
export function sanitizeUrl(url: string): string {
  try {
    if (!url || typeof url !== 'string') {
      return '';
    }

    const trimmed = url.trim();

    // Blacklist dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];

    const lowerUrl = trimmed.toLowerCase();
    for (const protocol of dangerousProtocols) {
      if (lowerUrl.startsWith(protocol)) {
        logger.warn('Dangerous URL protocol blocked', {
          url: trimmed.substring(0, 50),
          protocol,
        });
        return '';
      }
    }

    // Allow http, https, mailto, tel
    const allowedProtocols = ['http://', 'https://', 'mailto:', 'tel:', '/'];
    const hasAllowedProtocol = allowedProtocols.some((protocol) =>
      lowerUrl.startsWith(protocol)
    );

    if (!hasAllowedProtocol) {
      // If no protocol, assume https
      return `https://${trimmed}`;
    }

    return trimmed;
  } catch (error) {
    logger.error(
      'URL sanitization error',
      error instanceof Error ? error : new Error(String(error)),
      {
        url: url?.substring(0, 50),
      }
    );

    return '';
  }
}

/**
 * Validate if URL is safe
 */
export function isUrlSafe(url: string): boolean {
  const sanitized = sanitizeUrl(url);
  return sanitized !== '' && sanitized === url.trim();
}

// ============================================================================
// ATTRIBUTE ENCODING
// ============================================================================

/**
 * Encode HTML entities for safe output
 */
export function encodeHtmlEntities(str: string): string {
  if (!str || typeof str !== 'string') {
    return '';
  }

  const entityMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };

  return str.replace(/[&<>"'/]/g, (char) => entityMap[char] || char);
}

/**
 * Encode for use in HTML attributes
 */
export function encodeAttribute(str: string): string {
  return encodeHtmlEntities(str);
}

/**
 * Encode for use in JavaScript strings
 */
export function encodeJavaScript(str: string): string {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\//g, '\\/');
}

// ============================================================================
// REACT SAFE RENDER (CLIENT-SIDE ONLY)
// ============================================================================

/**
 * Safe HTML render component for React - Client-Side Only
 *
 * IMPORTANT: This component only works on the client-side.
 * For SSR pages, use dynamic import:
 *
 * const SafeHtml = dynamic(() => import('./xss-protection').then(m => m.SafeHtml), { ssr: false });
 */
export function SafeHtml({
  html,
  config = 'BASIC',
  className,
  as: Component = 'div',
}: {
  html: string;
  config?: keyof typeof SANITIZE_CONFIG | Config;
  className?: string;
  as?: React.ElementType;
}) {
  const [cleanHtml, setCleanHtml] = useState('');

  useEffect(() => {
    // Client-side only sanitization
    if (typeof window !== 'undefined') {
      setCleanHtml(sanitizeHtml(html, config));
    }
  }, [html, config]);

  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}

/**
 * Safe text render component (strips all HTML)
 */
export function SafeText({
  text,
  className,
  as: Component = 'span',
}: {
  text: string;
  className?: string;
  as?: React.ElementType;
}) {
  const cleanText = sanitizeToText(text);

  return <Component className={className}>{cleanText}</Component>;
}

// ============================================================================
// CONTEXT-AWARE SANITIZATION
// ============================================================================

/**
 * Sanitize based on context (where the content will be used)
 */
export function sanitizeByContext(
  content: string,
  context: 'html' | 'text' | 'url' | 'attribute' | 'javascript'
): string {
  switch (context) {
    case 'html':
      return sanitizeHtml(content, 'BASIC');
    case 'text':
      return sanitizeToText(content);
    case 'url':
      return sanitizeUrl(content);
    case 'attribute':
      return encodeAttribute(content);
    case 'javascript':
      return encodeJavaScript(content);
    default:
      // Default to text (safest)
      return sanitizeToText(content);
  }
}

/**
 * Sanitize user input for storage
 * Removes dangerous content but preserves intended formatting
 */
export function sanitizeUserInput(
  input: string,
  allowRichText = false
): string {
  return sanitizeHtml(input, allowRichText ? 'RICH' : 'BASIC');
}

/**
 * Sanitize search query
 * Removes HTML and special characters
 */
export function sanitizeSearchQuery(query: string): string {
  const text = sanitizeToText(query);

  // Remove special regex characters
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Check if string contains potential XSS
 */
export function containsXss(str: string): boolean {
  if (!str || typeof str !== 'string') {
    return false;
  }

  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data:text\/html/i,
  ];

  return xssPatterns.some((pattern) => pattern.test(str));
}

/**
 * Validate and sanitize email for display
 */
export function sanitizeEmail(email: string): string {
  const text = sanitizeToText(email);

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(text)) {
    return '';
  }

  return text.toLowerCase();
}

// ============================================================================
// EXPORTS
// ============================================================================

export { DOMPurify };
