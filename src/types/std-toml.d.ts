/**
 * Type definitions for @std/toml
 */

declare module '@std/toml' {
  /**
   * Parse a TOML string into a JavaScript object
   */
  export function parse(toml: string): unknown;
  
  /**
   * Stringify a JavaScript object into a TOML string
   */
  export function stringify(obj: unknown): string;
}