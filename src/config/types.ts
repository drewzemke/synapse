/**
 * Configuration types and interfaces
 */

/**
 * Main application configuration
 */
export interface SynapseConfig {
  /** General settings */
  general: {
    /** Whether to stream responses by default */
    stream: boolean;
  };
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: SynapseConfig = {
  general: {
    stream: true,
  },
};
