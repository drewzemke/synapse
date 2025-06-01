import fs from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SynapseArgs } from '../cli/args';
import { ConfigManager } from './index';
import { getConfigPaths } from './paths';
import { DEFAULT_CONFIG, DEFAULT_MODEL_ANTHROPIC, DEFAULT_PROFILE } from './schemas';

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    readFileSync: vi.fn(),
  },
}));

vi.mock('./paths', () => ({
  getConfigPaths: vi.fn(),
}));

const fakeArgs: () => SynapseArgs = () => ({ $0: '', _: [] });

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

  it('should load valid configuration from file', () => {
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
    const config = configManager.loadConfig(fakeArgs());

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

  it('should merge partial configuration with defaults', () => {
    const mockConfig = `
      [profiles.custom]
      system_prompt = "Custom system prompt"
      # temperature not specified, should use default
    `;

    vi.mocked(fs.readFileSync).mockReturnValue(mockConfig);

    const configManager = new ConfigManager();
    const config = configManager.loadConfig(fakeArgs());

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
    const config = configManager.loadConfig(fakeArgs());

    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it('should throw error when config file has invalid format', () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error('Parse error at line 1');
    });

    const configManager = new ConfigManager();

    expect(() => configManager.loadConfig(fakeArgs())).toThrow('Invalid configuration file format');
  });

  describe('getProfile', () => {
    it('should return requested profile when it exists', () => {
      const mockConfig = `
      [profiles.test]
      system_prompt = "Test prompt"
      temperature = 0.5
    `;

      vi.mocked(fs.readFileSync).mockReturnValue(mockConfig);

      const configManager = new ConfigManager();
      configManager.loadConfig(fakeArgs());

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
      configManager.loadConfig(fakeArgs());

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
      configManager.loadConfig(fakeArgs());

      const profile = configManager.getProfile();

      expect(profile).toEqual(DEFAULT_PROFILE);
    });
  });

  // Models configuration tests
  describe('getModel', () => {
    it('should return requested model when it exists', () => {
      const mockConfig = `
        [models.claude]
        provider = "anthropic"
        model = "claude-3-7-sonnet-latest"

        [models.gpt4]
        provider = "openai"
        model = "gpt-4-turbo"
      `;

      vi.mocked(fs.readFileSync).mockReturnValue(mockConfig);

      const configManager = new ConfigManager();
      configManager.loadConfig(fakeArgs());

      const model = configManager.getModel('claude');

      expect(model).toMatchObject({
        provider: 'anthropic',
        modelStr: 'claude-3-7-sonnet-latest',
      });
    });

    it('should return default model when no model name is provided', () => {
      const mockConfig = `
        [models.claude]
        provider = "anthropic"
        model = "claude-3-7-sonnet-latest"
      `;

      vi.mocked(fs.readFileSync).mockReturnValue(mockConfig);

      const configManager = new ConfigManager();
      configManager.loadConfig(fakeArgs());

      const model = configManager.getModel();

      expect(model).toEqual(DEFAULT_MODEL_ANTHROPIC);
    });

    it('should throw an error when requested model does not exist', () => {
      const mockConfig = `
        [models.claude]
        provider = "anthropic"
        model = "claude-3-7-sonnet-latest"
      `;

      vi.mocked(fs.readFileSync).mockReturnValue(mockConfig);

      const configManager = new ConfigManager();
      configManager.loadConfig(fakeArgs());

      expect(() => configManager.getModel('nonexistent')).toThrow("Model 'nonexistent' not found");
    });

    it('should throw errors for models with invalid provider', () => {
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
      expect(() => configManager.loadConfig(fakeArgs())).toThrow(/validation error/i);
    });

    it('throw errors for models with missing required fields', () => {
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
      expect(() => configManager.loadConfig(fakeArgs())).toThrow(/validation error/i);
    });
  });
});
