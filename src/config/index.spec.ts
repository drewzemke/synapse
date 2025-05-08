import fs from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigManager, DEFAULT_CONFIG, DEFAULT_PROFILE } from './index';
import { getConfigPaths } from './paths';

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

      [profiles.default]
      system_prompt = "You are a helpful CLI assistant."
      temperature = 0.5

      [profiles.coding]
      system_prompt = "You are a coding assistant."
      temperature = 0.3
    `;

    vi.mocked(fs.readFileSync).mockReturnValue(mockConfig);

    const configManager = new ConfigManager();
    const config = configManager.loadConfig();

    expect(config).toMatchObject({
      general: {
        stream: false,
      },
      profiles: {
        default: {
          system_prompt: 'You are a helpful CLI assistant.',
          temperature: 0.5,
        },
        coding: {
          system_prompt: 'You are a coding assistant.',
          temperature: 0.3,
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

    expect(() => configManager.getProfile('nonexistent')).toThrow('Profile does not exist');
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
});
