/**
 * Type declarations for isomorphic-dompurify
 * This module provides DOMPurify for both browser and Node.js environments
 */
declare module 'isomorphic-dompurify' {
  import DOMPurify from 'dompurify';
  export default DOMPurify;
  export type { Config } from 'dompurify';
}
