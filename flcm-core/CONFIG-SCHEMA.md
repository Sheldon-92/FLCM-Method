# FLCM Configuration Schema Documentation

## Overview

The FLCM configuration system uses YAML format with a hierarchical structure. Configuration is loaded from two sources:

1. **core-config.yaml** - System defaults (version controlled)
2. **data/user-config.yaml** - User overrides (gitignored)

User configuration values override system defaults through deep merging.

## Configuration Structure

### System Section

```yaml
system:
  name: string           # System name (default: "FLCM - Friction Lab Content Maker")
  version: string        # System version following semver (e.g., "1.0.0")
  mode: string           # Operating mode: "development" | "production"
```

### Agents Section

Configure behavior for each of the four core agents:

```yaml
agents:
  collector:
    enabled: boolean     # Enable/disable agent (default: true)
    timeout: number      # Execution timeout in seconds (default: 300)
    methodologies:       # List of methodology names to use
      - string
  
  scholar:
    enabled: boolean
    timeout: number
    methodologies:
      - string
  
  creator:
    enabled: boolean
    timeout: number
    methodologies:
      - string
  
  adapter:
    enabled: boolean
    timeout: number
    platforms:           # Target platforms for adaptation
      - "linkedin"
      - "twitter"
      - "medium"
      - "substack"
```

### Workflows Section

Define workflow configurations:

```yaml
workflows:
  quick_mode:
    enabled: boolean         # Enable workflow (default: true)
    max_duration: number     # Maximum duration in seconds (default: 1800)
    agents:                  # Agents to use in workflow
      - string
    skip_learning: boolean   # Skip Scholar agent (default: true)
  
  standard_mode:
    enabled: boolean
    max_duration: number     # Default: 3600 (60 minutes)
    agents:
      - string
    full_pipeline: boolean   # Use all agents (default: true)
```

### Document Pipeline Section

Configure document processing:

```yaml
document_pipeline:
  format: string             # Output format (default: "markdown")
  frontmatter: boolean       # Include frontmatter (default: true)
  obsidian_compatible: boolean # Obsidian compatibility (default: true)
  auto_save: boolean         # Auto-save documents (default: true)
```

### Methodologies Section

Control methodology behavior:

```yaml
methodologies:
  transparency: boolean      # Show methodology usage (default: true)
  logging: boolean          # Log methodology decisions (default: true)
  user_visibility: string   # Visibility level: "full" | "summary" | "minimal"
```

### User Preferences Section

User-specific settings:

```yaml
user_preferences:
  default_mode: string      # Default workflow: "quick" | "standard"
  voice_profile: string     # Voice profile name (default: "default")
  platforms:
    primary: string         # Primary platform
    secondary:             # Secondary platforms
      - string
  
  obsidian:
    enabled: boolean       # Enable Obsidian integration
    vault_path: string     # Path to Obsidian vault
    auto_file: boolean     # Auto-file documents
```

### Validation Section

Quality control settings:

```yaml
validation:
  auto_validate: boolean    # Auto-validate outputs (default: true)
  strict_mode: boolean      # Strict validation (default: false)
  quality_threshold: number # Quality threshold 0-1 (default: 0.7)
```

### Paths Section

File system paths:

```yaml
paths:
  templates: string        # Template directory (default: ".flcm-core/templates")
  methodologies: string    # Methodologies directory
  tasks: string           # Tasks directory
  output: string          # Output directory (default: "output")
  logs: string            # Log directory (default: "logs")
```

### Debug Section

Debugging and logging:

```yaml
debug:
  enabled: boolean        # Enable debug mode (default: true)
  verbose: boolean        # Verbose output (default: false)
  log_level: string       # Log level: "debug" | "info" | "warning" | "error"
```

## Example Configurations

### Minimal Configuration

```yaml
system:
  version: "1.0.0"
  mode: "production"
```

### Quick Mode Focused

```yaml
system:
  version: "1.0.0"
  mode: "production"

workflows:
  quick_mode:
    enabled: true
    max_duration: 1200  # 20 minutes
  standard_mode:
    enabled: false

user_preferences:
  default_mode: "quick"
```

### Full Featured

```yaml
system:
  name: "My FLCM Instance"
  version: "1.0.0"
  mode: "development"

agents:
  collector:
    enabled: true
    methodologies:
      - "rice-framework"
      - "signal-extraction"
  scholar:
    enabled: true
    methodologies:
      - "progressive-depth"
  creator:
    enabled: true
    methodologies:
      - "spark-method"
      - "voice-dna"
  adapter:
    enabled: true
    platforms:
      - "linkedin"
      - "twitter"

workflows:
  quick_mode:
    enabled: true
    max_duration: 1800
  standard_mode:
    enabled: true
    max_duration: 3600

user_preferences:
  default_mode: "standard"
  voice_profile: "professional"
  platforms:
    primary: "linkedin"
    secondary: ["twitter", "medium"]
  
  obsidian:
    enabled: true
    vault_path: "/Users/me/Obsidian/MyVault"
    auto_file: true

validation:
  auto_validate: true
  strict_mode: true
  quality_threshold: 0.8

debug:
  enabled: true
  verbose: true
  log_level: "debug"
```

## Override Hierarchy

Configuration values are resolved in this order (highest priority first):

1. User configuration (user-config.yaml)
2. Core configuration (core-config.yaml)
3. System defaults (hardcoded)

## Validation Rules

### Required Fields
- `system.version` - Must be present and valid semver

### Enum Validations
- `system.mode`: "development" | "production"
- `methodologies.user_visibility`: "full" | "summary" | "minimal"
- `debug.log_level`: "debug" | "info" | "warning" | "error"

### Type Validations
- All `enabled` fields must be boolean
- All `timeout` and `max_duration` fields must be positive numbers
- All `threshold` values must be between 0 and 1
- All paths must be valid strings

### Agent Names
Valid agent names: `collector`, `scholar`, `creator`, `adapter`

### Platform Names
Supported platforms: `linkedin`, `twitter`, `medium`, `substack`, `wechat`, `xiaohongshu`

## Hot-Reload Behavior

When configuration files are modified:

1. System attempts to load and validate new configuration
2. If valid, new configuration is applied immediately
3. If invalid, previous valid configuration is retained
4. Changes are logged to console/debug log

## Best Practices

1. **Keep user-config.yaml minimal** - Only override what you need
2. **Use comments** - Document why settings are changed
3. **Test changes** - Validate configuration after modifications
4. **Version control core-config.yaml** - Track system defaults
5. **Never commit user-config.yaml** - Keep user preferences private

## Troubleshooting

### Configuration Not Loading
- Check YAML syntax is valid
- Verify file permissions
- Check file paths are correct

### Validation Errors
- Review error message for specific field
- Check value types match schema
- Verify enum values are from allowed list

### Hot-Reload Not Working
- Ensure hot-reload is enabled
- Check file system supports file watching
- Review debug logs for errors