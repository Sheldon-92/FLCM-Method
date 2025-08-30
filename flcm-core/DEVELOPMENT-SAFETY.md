# FLCM Development Safety Guidelines

## Core Safety Principles

### 1. Directory Isolation
- **ALL FLCM code MUST be in `.flcm-core/`**
- **NEVER modify `.bmad-core/` or `.claude/`**
- **Keep FLCM completely independent**

### 2. No Dynamic Code Execution
```typescript
// ❌ NEVER DO THIS:
eval(userInput);
new Function(code)();
exec(command);

// ✅ ALWAYS DO THIS:
const config = parseYAML(configFile);
const template = loadTemplate(templateFile);
```

### 3. Safe File Operations
- **Read-only** from user sources
- **Write only** to designated output directories
- **Validate** all file paths before access
- **Sanitize** all user inputs

### 4. Configuration-Driven Architecture
```yaml
# Agents defined in YAML (safe)
agent:
  name: Collector
  methodologies:
    - rice-framework
  tasks:
    - collect-sources
```

### 5. Template-Based Processing
```markdown
# Content templates (safe)
---
title: {{title}}
date: {{date}}
---
{{content}}
```

## What FLCM Does NOT Do

1. **No code generation** - We don't generate executable code
2. **No system commands** - We don't execute shell commands from user input
3. **No file system manipulation** - We don't modify system files
4. **No network requests to unknown URLs** - Only process provided content
5. **No database operations** - File-based storage only

## Safe Development Checklist

Before implementing any feature:

- [ ] Is all code in `.flcm-core/`?
- [ ] Does it avoid dynamic code execution?
- [ ] Are file paths validated?
- [ ] Is it configuration-driven?
- [ ] Are user inputs sanitized?
- [ ] Is it isolated from system operations?

## Agent Safety

Agents are safe because they:
1. **Defined in YAML** - No executable code
2. **Use predefined methodologies** - No dynamic logic
3. **Process through templates** - Structured output
4. **Communicate via documents** - No direct execution

## Command Safety

Commands are safe because they:
1. **Pre-defined in TypeScript** - No dynamic creation
2. **Validated inputs** - All parameters checked
3. **Limited scope** - Only FLCM operations
4. **Error boundaries** - Caught and handled safely

## Testing for Safety

```bash
# Safe testing approach
npm test                    # Run unit tests
npm run lint               # Check code quality
npm run type-check         # Verify types

# Check for dangerous patterns
grep -r "eval(" .flcm-core/
grep -r "Function(" .flcm-core/
grep -r "exec(" .flcm-core/
```

## If You're Unsure

Ask yourself:
1. Could this execute arbitrary code?
2. Could this access unauthorized files?
3. Could this modify system settings?
4. Could this make unauthorized network requests?

If ANY answer is "yes" or "maybe", STOP and reconsider the approach.

## Emergency Procedures

If something goes wrong:
1. **STOP** all operations
2. **CHECK** `.flcm-core/` for any issues
3. **VERIFY** no system files were modified
4. **RESTORE** from git if needed
5. **REPORT** the issue

## Remember

FLCM is a **content creation tool**, not a code generation platform.
It processes text through AI, not code through compilers.
Keep it simple, safe, and isolated.