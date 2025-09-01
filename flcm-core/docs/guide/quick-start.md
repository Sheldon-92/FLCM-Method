# Quick Start Guide

Get up and running with FLCM 2.0 in just 5 minutes! This guide will walk you through your first learning session.

## Prerequisites

Make sure you have FLCM 2.0 installed. If not, see our [Installation Guide](/guide/installation).

```bash
# Verify installation
flcm --version
```

## Step 1: Initialize Your First Project

Create a new learning project:

```bash
# Create and navigate to your project directory
mkdir my-learning-project
cd my-learning-project

# Initialize FLCM project
flcm init
```

This creates:
- `flcm-config.yaml` - Project configuration
- `content/` - Raw content directory  
- `output/` - Processed content directory
- `templates/` - Custom templates
- `.flcm/` - Project metadata

## Step 2: Learn from a URL

Let's process your first piece of content:

```bash
# Learn from an article (replace with any URL)
flcm learn https://example.com/interesting-article

# Or from a research paper
flcm learn https://arxiv.org/pdf/2301.00001.pdf

# Or from a YouTube video
flcm learn https://www.youtube.com/watch?v=example
```

FLCM will:
1. **Extract** content from the URL
2. **Analyze** it with the Scholar Agent
3. **Process** it through methodologies
4. **Generate** structured learning materials

## Step 3: Review Your Learning Materials

Check what FLCM created for you:

```bash
# View the processed content
ls output/

# Read the main summary
cat output/latest/summary.md

# Check the knowledge extraction
cat output/latest/knowledge-points.md
```

You'll find:
- 📝 **Summary**: Key points and main ideas
- 🧠 **Knowledge Points**: Structured learning notes
- 🔗 **Connections**: Links to related concepts
- 📊 **Visual Maps**: Concept diagrams (if applicable)

## Step 4: Create Content from Your Learning

Now let's create something new based on what you learned:

```bash
# Generate a blog post
flcm create blog --input output/latest/ --topic "Key insights from my learning"

# Create a LinkedIn post
flcm create linkedin --input output/latest/ --style professional

# Generate a Twitter thread
flcm create twitter --input output/latest/ --max-tweets 5
```

## Step 5: Customize Your Experience

### Configure Your Learning Style

```bash
# Open the configuration
flcm config edit
```

Customize these settings:

```yaml
# Learning preferences
learning:
  depth: progressive  # beginner, intermediate, advanced, progressive
  style: visual      # visual, textual, mixed
  pace: moderate     # slow, moderate, fast

# Agent preferences  
agents:
  scholar:
    analysis_depth: deep
    extract_quotes: true
    generate_questions: true
  
  creator:
    voice_analysis: true
    maintain_tone: consistent
    creativity_level: balanced
```

### Set Your Voice DNA

Help the Creator Agent understand your writing style:

```bash
# Analyze your writing samples
flcm voice-dna analyze ~/Documents/my-blog-posts/

# Or provide sample text directly
flcm voice-dna learn --text "Your writing sample here..."
```

## Step 6: Explore Advanced Features

### Batch Processing

Process multiple sources at once:

```bash
# Create a reading list
echo "https://example1.com" >> reading-list.txt
echo "https://example2.com" >> reading-list.txt
echo "https://example3.com" >> reading-list.txt

# Process all at once
flcm learn --batch reading-list.txt
```

### Methodology Selection

Choose specific learning methodologies:

```bash
# Use Progressive Depth Learning
flcm learn https://example.com --methodology progressive-depth

# Use Analogy-Based Learning  
flcm learn https://example.com --methodology analogy-based

# Combine multiple methodologies
flcm learn https://example.com --methodology progressive-depth,analogy-based
```

### Template Customization

Create custom output templates:

```bash
# List available templates
flcm templates list

# Create a custom template
flcm templates create my-summary --based-on default-summary

# Use custom template
flcm learn https://example.com --template my-summary
```

## Common Workflows

### 📚 Research Workflow

Perfect for academic or professional research:

```bash
# 1. Collect sources
flcm collect --topic "artificial intelligence" --sources 5

# 2. Process all sources
flcm learn --batch collected-sources.txt --methodology scholarly

# 3. Generate research summary
flcm create research-report --input output/ --format academic

# 4. Create presentation
flcm create presentation --input output/research-report.md --slides 10
```

### ✍️ Content Creation Workflow

Great for bloggers and content creators:

```bash
# 1. Learn from inspiration sources
flcm learn https://inspiration-source.com --methodology creative

# 2. Extract your voice DNA from existing content
flcm voice-dna analyze ~/my-blog/

# 3. Create new content
flcm create blog --input output/latest/ --voice-dna ~/.flcm/voice-profiles/default

# 4. Adapt for different platforms
flcm adapt output/blog-post.md --platforms linkedin,twitter,medium
```

### 🎓 Learning Workflow

Ideal for students and lifelong learners:

```bash
# 1. Learn from educational content
flcm learn https://educational-resource.com --methodology progressive-depth

# 2. Generate study materials
flcm create flashcards --input output/latest/
flcm create quiz --input output/latest/ --questions 10

# 3. Create knowledge map
flcm visualize output/latest/ --type concept-map

# 4. Schedule review
flcm schedule review output/latest/ --interval spaced-repetition
```

## Helpful Commands

### Status and Health

```bash
# Check system status
flcm status

# Run health check
flcm health

# View logs
flcm logs

# Get help
flcm help
```

### Project Management

```bash
# List all projects
flcm projects list

# Switch project
flcm projects use my-other-project

# Archive project
flcm projects archive my-old-project
```

### Configuration

```bash
# View current configuration
flcm config show

# Reset to defaults
flcm config reset

# Backup configuration
flcm config backup
```

## Tips for Success

### 🎯 Start Small
- Begin with short articles or videos
- Use default settings initially
- Gradually customize as you learn

### 🔄 Iterate and Improve
- Review generated content and provide feedback
- Adjust methodologies based on results  
- Refine your voice DNA over time

### 📁 Stay Organized
- Use descriptive project names
- Organize content by topic or date
- Clean up old projects periodically

### 🤖 Trust the AI, But Verify
- AI-generated content is a starting point
- Always review and edit before publishing
- Use multiple sources for important topics

## What's Next?

Now that you've got the basics down:

1. **[Deep Dive into Agents](/guide/agents)** - Understand how Scholar, Creator, and Publisher agents work
2. **[Explore Methodologies](/guide/methodologies)** - Learn about Progressive Depth Learning and other techniques
3. **[Customize Your Setup](/guide/configuration)** - Fine-tune FLCM for your specific needs
4. **[Advanced Examples](/examples/advanced-workflows)** - See complex use cases in action
5. **[Join the Community](https://github.com/Sheldon-92/FLCM-Method/discussions)** - Share your experiences and learn from others

## Getting Help

### Common Issues

**FLCM command not found**
```bash
# Add to PATH
echo 'export PATH="$HOME/.flcm/flcm-core/dist:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**Processing fails**
```bash
# Check health status
flcm health

# View detailed logs
flcm logs --level debug
```

**Content quality issues**
```bash
# Try different methodology
flcm learn URL --methodology progressive-depth

# Increase analysis depth
flcm config set agents.scholar.analysis_depth deep
```

### Support Resources

- 📖 **Documentation**: [Complete User Guide](/guide/)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Sheldon-92/FLCM-Method/issues)
- 💬 **Community**: [GitHub Discussions](https://github.com/Sheldon-92/FLCM-Method/discussions)
- ❓ **Questions**: [Stack Overflow](https://stackoverflow.com/questions/tagged/flcm)

---

**Ready to dive deeper?** Explore our [comprehensive guides](/guide/) or try some [advanced examples](/examples/)!