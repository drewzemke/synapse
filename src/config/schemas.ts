import z from 'zod';

/**
 * Default profile
 */
export const DEFAULT_PROFILE = {
  system_prompt: 'You are a helpful AI assistant.',
  temperature: 0.7,
};

/**
 * Profile configuration
 */
export const ProfileSchema = z
  .object({
    /** System prompt for the profile */
    system_prompt: z.string(),

    /** Temperature setting (0.0 - 1.0) */
    temperature: z.number().min(0).max(1).default(DEFAULT_PROFILE.temperature),
  })
  .strict();

/**
 * LLM model specification
 */
export const ModelSpecSchema = z
  .discriminatedUnion('provider', [
    z.object({
      provider: z.literal('anthropic'),
      model: z.string(),
    }),
    z.object({
      provider: z.literal('openai'),
      model: z.string(),
    }),
    z.object({
      provider: z.literal('openrouter'),
      model: z.string(),
    }),
    z.object({
      provider: z.literal('bedrock'),
      model: z.string(),
      aws_region: z.string().optional(),
    }),
  ])
  // remap `model` in the config to `modelStr` in the parsed object
  .transform((data) => {
    const { model, ...rest } = data;
    return { ...rest, modelStr: model };
  });

export const SynapseConfigSchema = z
  .object({
    // TODO: make this optional?
    /** General settings */
    general: z
      .object({
        /** Whether to stream responses by default */
        stream: z.boolean().default(true).optional(),

        /** The name of the profile to use when no profile is specified */
        default_profile: z.string().default('default').optional(),

        /** The name of the model to use when no model is specified */
        default_model: z.string().optional(),
      })
      .strict()
      .optional()
      .default({ stream: true }),

    /** User-defined profiles */
    profiles: z.record(z.string(), ProfileSchema).default({ default: DEFAULT_PROFILE }),

    /** User-defined models */
    models: z.record(z.string(), ModelSpecSchema).optional(),
  })
  .strict();

/**
 * Default configuration
 */
export const DEFAULT_CONFIG = SynapseConfigSchema.parse({});

/**
 * Default models
 */
export const DEFAULT_MODEL_ANTHROPIC = {
  provider: 'anthropic' as const,
  modelStr: 'claude-3-7-sonnet-latest',
};
