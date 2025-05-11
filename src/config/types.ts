/**
 * Configuration types and interfaces
 */

import type z from 'zod';
import type { ModelSpecSchema, ProfileSchema, SynapseConfigSchema } from './schemas';

/**
 * Profile configuration
 */
export type Profile = z.infer<typeof ProfileSchema>;

/**
 * LLM model specification
 */
export type ModelSpec = z.infer<typeof ModelSpecSchema>;

/**
 * Main application configuration
 */
export type SynapseConfig = z.infer<typeof SynapseConfigSchema>;
