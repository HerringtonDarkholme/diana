# Diana Configuration Language Documentation

Welcome to the Diana configuration language documentation! This folder contains comprehensive guides and references for using Diana in Simple Mode.

## 📚 Documentation Files

### [Grammar Reference](./grammar.md)
Complete grammar documentation for Diana Simple Mode, including:
- Syntax basics and data types
- Key formats and object structures
- List definitions and nested structures
- Comprehensive examples and real-world scenarios
- Token and AST reference

## 🚀 Quick Start

Diana is a configuration language designed for clarity and tooling support. Here's a simple example:

```diana
; Application configuration
app_name: "My Application"
version: "1.0.0"
debug: true

server:
  host: "localhost"
  port: 8080

database:
  host: "localhost"
  port: 5432
  credentials:
    username: "admin"
    password: "secret"
```

## 🎯 Key Features

- **Human-readable**: Clean, YAML-like syntax
- **Explicit types**: No automatic type conversion
- **Flexible keys**: Support for dot notation, quoted keys, and computed keys
- **Comments**: Full comment support with `;`
- **Mixed styles**: Combine inline and indented structures

## 📖 Learning Path

1. Start with the [Grammar Reference](./grammar.md) introduction
2. Learn about data types and basic syntax
3. Explore key formats and object structures
4. Practice with the provided examples
5. Reference the grammar specification for advanced usage

## 🔧 Tools and Integration

Diana includes:
- TypeScript parser and tokenizer
- VS Code extension for syntax highlighting
- CLI tools for processing Diana files

## 📝 File Extensions

Diana configuration files typically use:
- `.diana` - Standard Diana configuration files
- `.dna` - Short form Diana files

## 🤝 Contributing

When contributing to Diana documentation:
- Follow the established structure and examples
- Include practical, real-world examples
- Keep Simple Mode focus (no script mode features)
- Test examples with the Diana parser

---

For more information about the Diana project, see the main [README](../README.md).
