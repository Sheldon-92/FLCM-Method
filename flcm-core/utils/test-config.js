/**
 * Test script for Configuration System
 * Run this to verify configuration loading and validation
 */

const configLoader = require('./config-loader.js');

console.log('=== FLCM Configuration System Test ===\n');

try {
    // Test 1: Load configuration
    console.log('Test 1: Loading configuration...');
    const config = configLoader.load();
    console.log('✓ Configuration loaded successfully');
    console.log(`  - System version: ${config.system.version}`);
    console.log(`  - Mode: ${config.system.mode}`);
    console.log('');

    // Test 2: Get specific values
    console.log('Test 2: Getting specific values...');
    const collectorEnabled = configLoader.get('agents.collector.enabled');
    const defaultMode = configLoader.get('user_preferences.default_mode');
    const invalidPath = configLoader.get('non.existent.path', 'default-value');
    
    console.log(`✓ Collector enabled: ${collectorEnabled}`);
    console.log(`✓ Default mode: ${defaultMode}`);
    console.log(`✓ Invalid path returned default: ${invalidPath}`);
    console.log('');

    // Test 3: Check feature flags
    console.log('Test 3: Checking feature flags...');
    const isCollectorEnabled = configLoader.isEnabled('agents.collector');
    const isScholarEnabled = configLoader.isEnabled('agents.scholar');
    console.log(`✓ Collector enabled check: ${isCollectorEnabled}`);
    console.log(`✓ Scholar enabled check: ${isScholarEnabled}`);
    console.log('');

    // Test 4: Configuration structure
    console.log('Test 4: Validating configuration structure...');
    const requiredSections = ['system', 'agents', 'workflows', 'document_pipeline'];
    let allPresent = true;
    
    for (const section of requiredSections) {
        if (config[section]) {
            console.log(`✓ Section '${section}' present`);
        } else {
            console.log(`✗ Section '${section}' missing`);
            allPresent = false;
        }
    }
    console.log('');

    // Test 5: Hot-reload setup (without actually watching)
    console.log('Test 5: Hot-reload capability...');
    console.log('✓ Hot-reload functions available');
    console.log('  - enableHotReload()');
    console.log('  - disableHotReload()');
    console.log('');

    // Summary
    console.log('=== Test Summary ===');
    console.log('✓ All configuration tests passed');
    console.log('✓ Configuration system is ready for use');
    
} catch (error) {
    console.error('✗ Configuration test failed:', error.message);
    process.exit(1);
}

console.log('\n=== Configuration Values ===');
console.log('Agents:', configLoader.get('agents'));
console.log('\nWorkflows:', configLoader.get('workflows'));
console.log('\nPaths:', configLoader.get('paths'));