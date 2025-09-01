# **External APIs**

## **Web Content API**
- **Purpose:** Fetch and process web content for collection
- **Documentation:** Native fetch/WebFetch in Claude Code
- **Base URL(s):** Any public HTTP/HTTPS endpoint
- **Authentication:** None (public content)
- **Rate Limits:** Respect robots.txt and site policies

**Key Endpoints Used:**
- `GET {url}` - Fetch web page content

**Integration Notes:** Convert HTML to markdown, extract metadata, handle errors gracefully

## **Obsidian Local API**
- **Purpose:** Interface with Obsidian vault through file system
- **Documentation:** File system operations
- **Base URL(s):** Local file paths
- **Authentication:** File system permissions
- **Rate Limits:** None (local operation)

**Key Endpoints Used:**
- File write operations for document creation
- Directory operations for vault organization

**Integration Notes:** Maintain Obsidian-compatible markdown, proper frontmatter, wiki-links

---
