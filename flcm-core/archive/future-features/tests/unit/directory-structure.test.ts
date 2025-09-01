/**
 * Directory Structure Validation Tests
 * Ensures BMAD-compliant directory structure is properly created
 */

import * as fs from 'fs';
import * as path from 'path';

const basePath = path.join(__dirname, '..', '..');

describe('BMAD Directory Structure', () => {
  const expectedDirectories = [
    // Main BMAD directories
    'agents',
    'tasks',
    'methodologies',
    'templates',
    'checklists',
    'data',
    'workflows',
    'shared',
    'tests',
    
    // Agent-specific subdirectories
    'agents/scholar',
    'agents/creator',
    'agents/publisher',
    
    // Task subdirectories
    'tasks/scholar',
    'tasks/creator',
    'tasks/publisher',
    
    // Shared subdirectories
    'shared/config',
    'shared/utils',
    'shared/types',
    
    // Test subdirectories
    'tests/unit',
    'tests/integration',
  ];

  test.each(expectedDirectories)('should have directory: %s', (directory) => {
    const dirPath = path.join(basePath, directory);
    expect(fs.existsSync(dirPath)).toBe(true);
    
    const stats = fs.statSync(dirPath);
    expect(stats.isDirectory()).toBe(true);
  });

  const expectedFiles = [
    // Configuration files
    'package.json',
    'tsconfig.json',
    'jest.config.js',
    '.eslintrc.js',
    '.prettierrc',
    '.lintstagedrc.js',
    
    // Core implementation files
    'agents/types.ts',
    'agents/base-agent.ts',
    'agents/flcm-main.ts',
    
    // Test files
    'agents/__tests__/flcm-main.test.ts',
    
    // Documentation
    'README.md',
  ];

  test.each(expectedFiles)('should have file: %s', (file) => {
    const filePath = path.join(basePath, file);
    expect(fs.existsSync(filePath)).toBe(true);
    
    const stats = fs.statSync(filePath);
    expect(stats.isFile()).toBe(true);
  });

  test('should have proper package.json structure', () => {
    const packagePath = path.join(basePath, 'package.json');
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Check essential fields
    expect(packageContent.name).toBe('flcm-core');
    expect(packageContent.version).toBe('2.0.0');
    expect(packageContent.dependencies).toBeDefined();
    expect(packageContent.devDependencies).toBeDefined();
    
    // Check essential dependencies
    expect(packageContent.dependencies).toHaveProperty('winston');
    expect(packageContent.dependencies).toHaveProperty('js-yaml');
    expect(packageContent.devDependencies).toHaveProperty('typescript');
    expect(packageContent.devDependencies).toHaveProperty('jest');
    expect(packageContent.devDependencies).toHaveProperty('eslint');
    expect(packageContent.devDependencies).toHaveProperty('prettier');
  });

  test('should have proper TypeScript configuration', () => {
    const tsconfigPath = path.join(basePath, 'tsconfig.json');
    const tsconfigContent = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    expect(tsconfigContent.compilerOptions).toBeDefined();
    expect(tsconfigContent.compilerOptions.strict).toBe(true);
    expect(tsconfigContent.compilerOptions.target).toBe('ES2020');
    expect(tsconfigContent.compilerOptions.outDir).toBe('./dist');
    
    // Check path mappings
    expect(tsconfigContent.compilerOptions.paths).toBeDefined();
    expect(tsconfigContent.compilerOptions.paths['@agents/*']).toEqual(['./agents/*']);
    expect(tsconfigContent.compilerOptions.paths['@tasks/*']).toEqual(['./tasks/*']);
  });

  test('should have ESLint configuration', () => {
    const eslintPath = path.join(basePath, '.eslintrc.js');
    expect(fs.existsSync(eslintPath)).toBe(true);
    
    // Basic validation that it's a valid JS file
    const eslintContent = fs.readFileSync(eslintPath, 'utf8');
    expect(eslintContent).toContain('@typescript-eslint');
    expect(eslintContent).toContain('parser');
  });

  test('should have Prettier configuration', () => {
    const prettierPath = path.join(basePath, '.prettierrc');
    const prettierContent = JSON.parse(fs.readFileSync(prettierPath, 'utf8'));
    
    expect(prettierContent.semi).toBe(true);
    expect(prettierContent.singleQuote).toBe(true);
    expect(prettierContent.printWidth).toBe(120);
    expect(prettierContent.tabWidth).toBe(2);
  });

  test('should have Jest configuration', () => {
    const jestConfigPath = path.join(basePath, 'jest.config.js');
    expect(fs.existsSync(jestConfigPath)).toBe(true);
    
    const jestContent = fs.readFileSync(jestConfigPath, 'utf8');
    expect(jestContent).toContain('ts-jest');
    expect(jestContent).toContain('coverageDirectory');
  });

  test('should have proper directory permissions', () => {
    const checkDirs = ['agents', 'tasks', 'methodologies', 'data'];
    
    checkDirs.forEach(dir => {
      const dirPath = path.join(basePath, dir);
      const stats = fs.statSync(dirPath);
      
      // Check that directories are readable and writable
      expect(() => {
        fs.accessSync(dirPath, fs.constants.R_OK | fs.constants.W_OK);
      }).not.toThrow();
    });
  });

  test('should follow BMAD naming conventions', () => {
    const directories = fs.readdirSync(basePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    // Check that all directories follow kebab-case (lowercase with hyphens)
    directories.forEach(dir => {
      if (!dir.startsWith('.') && !dir.startsWith('node_modules')) {
        expect(dir).toMatch(/^[a-z0-9-]+$/);
      }
    });
  });

  test('should have all agent directories with proper structure', () => {
    const agentDirs = ['scholar', 'creator', 'publisher'];
    
    agentDirs.forEach(agent => {
      const agentPath = path.join(basePath, 'agents', agent);
      expect(fs.existsSync(agentPath)).toBe(true);
      
      const taskPath = path.join(basePath, 'tasks', agent);
      expect(fs.existsSync(taskPath)).toBe(true);
    });
  });
});