import { homedir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getConfigPaths } from './paths';

// Mock os module
vi.mock('node:os', () => ({
  homedir: vi.fn(),
}));

describe('Configuration Paths', () => {
  const mockHomedir = '/mock/home/dir';
  const originalPlatform = process.platform;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(homedir).mockReturnValue(mockHomedir);
  });

  afterEach(() => {
    // Restore platform after each test
    Object.defineProperty(process, 'platform', { value: originalPlatform });
    vi.restoreAllMocks();
  });

  // Expected use case for Unix-like systems
  it('should return correct paths for Unix-like systems', () => {
    // Mock platform to non-Windows
    Object.defineProperty(process, 'platform', { value: 'darwin' });

    const paths = getConfigPaths();

    expect(paths).toEqual({
      configDir: join(mockHomedir, '.config', 'synapse'),
      configFile: join(mockHomedir, '.config', 'synapse', 'config.toml'),
      keysFile: join(mockHomedir, '.config', 'synapse', '.api-keys.toml'),
    });
  });

  // Test for Windows systems
  it('should return correct paths for Windows with APPDATA', () => {
    // Mock platform to Windows
    Object.defineProperty(process, 'platform', { value: 'win32' });

    // Mock APPDATA environment variable
    const mockAppData = 'C:\\Users\\User\\AppData\\Roaming';
    const originalAppData = process.env.APPDATA;
    process.env.APPDATA = mockAppData;

    try {
      const paths = getConfigPaths();

      expect(paths).toEqual({
        configDir: join(mockAppData, 'synapse'),
        configFile: join(mockAppData, 'synapse', 'config.toml'),
        keysFile: join(mockAppData, 'synapse', '.api-keys.toml'),
      });
    } finally {
      // Restore original APPDATA
      process.env.APPDATA = originalAppData;
    }
  });

  // Edge case: Windows without APPDATA set
  it('should handle Windows without APPDATA environment variable', () => {
    // Mock platform to Windows
    Object.defineProperty(process, 'platform', { value: 'win32' });

    // Remove APPDATA environment variable
    const originalAppData = process.env.APPDATA;
    // Need to actually unset the variable for the || fallback to work
    process.env.APPDATA = '';

    try {
      const paths = getConfigPaths();

      expect(paths).toEqual({
        configDir: join(mockHomedir, 'AppData', 'Roaming', 'synapse'),
        configFile: join(mockHomedir, 'AppData', 'Roaming', 'synapse', 'config.toml'),
        keysFile: join(mockHomedir, 'AppData', 'Roaming', 'synapse', '.api-keys.toml'),
      });
    } finally {
      // Restore original APPDATA
      process.env.APPDATA = originalAppData;
    }
  });
});
