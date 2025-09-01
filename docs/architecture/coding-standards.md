# **Coding Standards**

## **Critical Fullstack Rules**

- **YAML Validity:** All YAML files must be valid and follow schema
- **Methodology Transparency:** Always log which methodologies are used
- **Document Pipeline:** Never skip stages in document processing
- **Voice Preservation:** Always maintain voice profile consistency
- **File Naming:** Follow pattern: [type]-[date]-[title-slug].md
- **Agent Communication:** Use document events, never direct calls
- **Error Recovery:** All workflows must handle errors gracefully
- **Obsidian Compatibility:** Maintain valid wiki-links and frontmatter

## **Naming Conventions**

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Commands | kebab-case | - | `/flcm:collect-sources` |
| Agents | lowercase | lowercase | `collector.yaml` |
| Tasks | kebab-case | kebab-case | `collect-sources.md` |
| Documents | kebab-case | kebab-case | `content-brief-2024-12-28.md` |
| Methodologies | kebab-case | kebab-case | `rice-framework.yaml` |

---
