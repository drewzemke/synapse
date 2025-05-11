import fs from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigManager, DEFAULT_CONFIG, DEFAULT_PROFILE } from './index';
import { getConfigPaths } from './paths';
import { DEFAULT_MODEL_ANTHROPIC } from './types';

// Mock fs module
vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    readFileSync: vi.fn(),
  },
}));

// Mock path module
vi.mock('./paths', () => ({
  getConfigPaths: vi.fn(),
}));

describe('ConfigManager', () => {
  const mockConfigPaths = {
    configDir: '/mock/config/dir',
    configFile: '/mock/config/dir/config.toml',
    keysFile: '/mock/config/dir/.api-keys.toml',
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Set up default mock behavior
    vi.mocked(getConfigPaths).mockReturnValue(mockConfigPaths);
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // Expected use case
  it('should load valid configuration from file', () => {
    // Prepare mock config file content
    const mockConfig = `
      [general]
      stream = false
      default_profile = "base"
      default_model = "claude"

      [profiles.base]
      system_prompt = "You are a helpful CLI assistant."
      temperature = 0.5

      [profiles.coding]
      system_prompt = "You are a coding assistant."
      temperature = 0.3

      [models.claude]
      provider = "anthropic"
      model = "claude-3-7-sonnet-latest"
    `;

    vi.mocked(fs.readFileSync).mockReturnValue(mockConfig);

    const configManager = new ConfigManager();
    const config = configManager.loadConfig();

    expect(config).toMatchObject({
      general: {
        stream: false,
        default_model: 'claude',
        default_profile: 'base',
      },
      profiles: {
        base: {
          system_prompt: 'You are a helpful CLI assistant.',
          temperature: 0.5,
        },
        coding: {
          system_prompt: 'You are a coding assistant.',
          temperature: 0.3,
        },
      },
      models: {
        claude: {
          provider: 'anthropic',
          modelStr: 'claude-3-7-sonnet-latest',
        },
      },
    });
  });

  // Test for config merging
  it('should merge partial configuration with defaults', () => {
    // Prepare mock config file with partial settings
    const mockConfig = `
      [profiles.custom]
      system_prompt = "Custom system prompt"
      # temperature not specified, should use default
    `;

    vi.mocked(fs.readFileSync).mockReturnValue(mockConfig);

    const configManager = new ConfigManager();
    const config = configManager.loadConfig();

    // General settings should be default
    expect(config.general).toEqual(DEFAULT_CONFIG.general);

    // Default profile should exist and be default
    expect(config.profiles?.default).toEqual(DEFAULT_CONFIG.profiles?.default);

    // Custom profile should have custom system prompt but default temperature
    expect(config.profiles?.custom).toMatchObject({
      system_prompt: 'Custom system prompt',
      temperature: DEFAULT_PROFILE.temperature,
    });
  });

  // Edge case: config file does not exist
  it('should use default config when file does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const configManager = new ConfigManager();
    const config = configManager.loadConfig();

    expect(config).toEqual(DEFAULT_CONFIG);
  });

  // Edge case: empty profiles
  it('should handle case with empty profiles section', () => {
    const mockConfig = `
      [general]
      stream = true

      [profiles]
      # No profiles defined
    `;

    vi.mocked(fs.readFileSync).mockReturnValue(mockConfig);

    const configManager = new ConfigManager();
    const config = configManager.loadConfig();

    // Should have default profiles
    expect(config.profiles?.default).toEqual(DEFAULT_PROFILE);
  });

  // Failure case: invalid TOML format
  it('should throw error when config file has invalid format', () => {
    // Setup mock readFileSync to return invalid TOML
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error('Parse error at line 1');
    });

    const configManager = new ConfigManager();

    expect(() => configManager.loadConfig()).toThrow('Invalid configuration file format');
  });

  // getProfile tests
  it('should return requested profile when it exists', () => {
    const mockConfig = `
      [profiles.default]
      system_prompt = "Default prompt"
      temperature = 0.7

      [profiles.test]
      system_prompt = "Test prompt"
      temperature = 0.5
    `;

    vi.mocked(fs.readFileSync).mockReturnValue(mockConfig);

    const configManager = new ConfigManager();
    configManager.loadConfig();

    const profile = configManager.getProfile('test');

    expect(profile).toMatchObject({
      system_prompt: 'Test prompt',
      temperature: 0.5,
    });
  });

  it('should throw an error when requested profile does not exist', () => {
    const mockConfig = `
      [profiles.default]
      system_prompt = "Default prompt"
      temperature = 0.7
    `;

    vi.mocked(fs.readFileSync).mockReturnValue(mockConfig);

    const configManager = new ConfigManager();
    configManager.loadConfig();

    expect(() => configManager.getProfile('nonexistent')).toThrow(
      "Profile 'nonexistent' not found",
    );
  });

  it('should return built-in default profile when no profiles exist', () => {
    const mockConfig = `
      [general]
      stream = true
      # No profiles defined
    `;

    vi.mocked(fs.readFileSync).mockReturnValue(mockConfig);

    const configManager = new ConfigManager();
    configManager.loadConfig();

    const profile = configManager.getProfile();

    expect(profile).toEqual(DEFAULT_PROFILE);
  });

  it('should use the user-defined default profile when no profile name is specified', () => {
    // Mock config with a custom "default" profile
    const mockConfig = `
      [general]
      default_profile = "default"

      [profiles.default]
      system_prompt = "Custom default system prompt"
      temperature = 0.5
    `;

    vi.mocked(fs.readFileSync).mockReturnValue(mockConfig);

    const configManager = new ConfigManager();
    configManager.loadConfig();

    // When no profile name is provided, should use the custom "default" profile
    const profile = configManager.getProfile();

    expect(profile).toMatchObject({
      system_prompt: 'Custom default system prompt',
      temperature: 0.5,
    });
  });

  // Models configuration tests
  describe('Models Configuration', () => {
    // Expected use case
    it('should load valid models configuration from file', () => {
      // Prepare mock config file content
      const mockConfig = `
        [models.claude-3-7]
        provider = "anthropic"
        model = "claude-3-7-sonnet-latest"

        [models.openai-gpt4]
        provider = "openai"
        model = "gpt-4-turbo"

        [models.openrouter-claude]
        provider = "openrouter"
        model = "anthropic/claude-3.5-sonnet"
      `;

      vi.mocked(fs.readFileSync).mockReturnValue(mockConfig);

      const configManager = new ConfigManager();
      const config = configManager.loadConfig();

      expect(config.models).toBeDefined();
      expect(config.models).toMatchObject({
        'claude-3-7': {
          provider: 'anthropic',
          modelStr: 'claude-3-7-sonnet-latest',
        },
        'openai-gpt4': {
          provider: 'openai',
          modelStr: 'gpt-4-turbo',
        },
        'openrouter-claude': {
          provider: 'openrouter',
          modelStr: 'anthropic/claude-3.5-sonnet',
        },
      });
    });

    // Test for getModel method
    it('should return requested model when it exists', () => {
      const mockConfig = `
        [models.claude-3-7]
        provider = "anthropic"
        model = "claude-3-7-sonnet-latest"

        [models.openai-gpt4]
        provider = "openai"
        model = "gpt-4-turbo"
      `;

      vi.mocked(fs.readFileSync).mockReturnValue(mockConfig);

      const configManager = new ConfigManager();
      configManager.loadConfig();

      const model = configManager.getModel('claude-3-7');

      expect(model).toMatchObject({
        provider: 'anthropic',
        modelStr: 'claude-3-7-sonnet-latest',
      });
    });

    // Test for default model when no model name is provided
    it('should return default model when no model name is provided', () => {
      const mockConfig = `
        [models.claude-3-7]
        provider = "anthropic"
        model = "claude-3-7-sonnet-latest"
      `;

      vi.mocked(fs.readFileSync).mockReturnValue(mockConfig);

      const configManager = new ConfigManager();
      configManager.loadConfig();

      const model = configManager.getModel();

      expect(model).toEqual(DEFAULT_MODEL_ANTHROPIC);
    });

    // Edge case: model does not exist
    it('should throw an error when requested model does not exist', () => {
      const mockConfig = `
        [models.claude-3-7]
        provider = "anthropic"
        model = "claude-3-7-sonnet-latest"
      `;

      vi.mocked(fs.readFileSync).mockReturnValue(mockConfig);

      const configManager = new ConfigManager();
      configManager.loadConfig();

      expect(() => configManager.getModel('nonexistent')).toThrow("Model 'nonexistent' not found");
    });

    // Validation: invalid provider
    it('should ignore models with invalid provider', () => {
      const mockConfig = `
        [models.valid]
        provider = "anthropic"
        model = "claude-3-7-sonnet-latest"

        [models.invalid]
        provider = "invalid-provider"
        model = "some-model"
      `;

      vi.mocked(fs.readFileSync).mockReturnValue(mockConfig);

      const configManager = new ConfigManager();
      const config = configManager.loadConfig();

      expect(config.models?.valid).toBeDefined();
      expect(config.models?.invalid).toBeUndefined();
    });

    // Validation: missing required fields
    it('should ignore models with missing required fields', () => {
      const mockConfig = `
        [models.valid]
        provider = "anthropic"
        model = "claude-3-7-sonnet-latest"

        [models.missing-provider]
        model = "some-model"

        [models.missing-model]
        provider = "anthropic"
      `;

      vi.mocked(fs.readFileSync).mockReturnValue(mockConfig);

      const configManager = new ConfigManager();
      const config = configManager.loadConfig();

      expect(config.models?.valid).toBeDefined();
      expect(config.models?.['missing-provider']).toBeUndefined();
      expect(config.models?.['missing-model']).toBeUndefined();
    });

    // Ensure config remains backward compatible
    it('should have no default models if none are defined in config', () => {
      const mockConfig = `
        [general]
        stream = true
      `;

      vi.mocked(fs.readFileSync).mockReturnValue(mockConfig);

      const configManager = new ConfigManager();
      const config = configManager.loadConfig();

      expect(config.models).toBeUndefined();
    });
  });
});
