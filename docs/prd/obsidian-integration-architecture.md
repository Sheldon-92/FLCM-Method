# **Obsidian Integration Architecture**

## **Overview**

Obsidian serves as FLCM's knowledge persistence layer, providing bi-directional linking, knowledge graph visualization, and long-term content management. The integration uses direct file system access to create and manage markdown files within an Obsidian vault.

## **Vault Structure Design**

```
FLCM-Vault/
├── 00-Inbox/              # Raw inputs and initial captures
│   ├── sources/           # Collected URLs, documents
│   ├── ideas/            # Quick captures
│   └── briefs/           # Content briefs from Collector
│
├── 01-Learning/          # Scholar Agent domain
│   ├── concepts/         # Individual concept notes
│   ├── syntheses/        # Knowledge synthesis documents
│   ├── questions/        # Open questions and explorations
│   └── reflections/      # Learning reflection documents
│
├── 02-Creation/          # Creator Agent domain
│   ├── drafts/          # Work in progress content
│   ├── architectures/   # Content structure plans
│   └── revisions/       # Version history
│
├── 03-Published/         # Final content versions
│   ├── wechat/          # WeChat optimized versions
│   ├── xiaohongshu/     # XiaoHongShu versions
│   ├── linkedin/        # LinkedIn professional content
│   └── twitter/         # Twitter/X threads
│
├── 04-Knowledge-Base/    # Permanent knowledge store
│   ├── topics/          # Topic clusters
│   ├── methodologies/   # Learned and customized frameworks
│   ├── insights/        # Key learnings and discoveries
│   └── voice/           # Voice examples and patterns
│
├── Templates/           # Reusable document templates
│   ├── content-brief.md
│   ├── knowledge-synthesis.md
│   ├── reflection.md
│   └── publish-package.md
│
└── Attachments/         # Images, PDFs, supporting files
```

## **Document Frontmatter Schema**

All FLCM documents include standardized YAML frontmatter for metadata management:

```yaml
---