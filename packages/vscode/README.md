# Diana Configuration Language - VS Code Extension

This extension provides support for the Diana configuration language in Visual Studio Code.

## Features

- **Syntax Highlighting**: Full syntax highlighting for `.diana` and `.dna` files
- **File Type Detection**: Automatic recognition of Diana configuration files
- **Basic Language Support**: 
  - Hover information for values
  - Document symbols for navigation
  - Auto-completion for basic values
  - Comment support with `;`

## Supported File Extensions

- `.diana` - Standard Diana configuration files
- `.dna` - Short form Diana files

## Diana Language Syntax

Diana is a configuration language designed for clarity and tooling support. Here's a quick example:

```diana
; Application configuration
app_name: "My Application"
version: "1.0.0"
debug: true

; Server settings
server:
  host: "localhost"
  port: 8080
  ssl: false

; List example
features:
  * "authentication"
  * "logging"
  * "monitoring"

; Inline objects and arrays
config: { timeout: 30, retries: 3 }
numbers: [1, 2, 3, 4, 5]
```

## Language Features

### Data Types
- **Strings**: `"text"` or `"""multi-line text"""`
- **Numbers**: `123`, `-45`, `3.14`, `6.02e23`
- **Booleans**: `true`, `false`
- **Null**: `null`
- **Objects**: `{ key: "value" }` or indented blocks
- **Arrays**: `[1, 2, 3]` or `* item` format

### Key Types
- **Simple keys**: `key: "value"`
- **Dot notation**: `nested.path.key: "value"`
- **Quoted keys**: `"key with spaces": "value"`
- **Computed keys**: `[123]: "numeric key"`, `[true]: "boolean key"`

### Comments
Comments start with `;` and continue to the end of the line:

```diana
; This is a comment
key: "value"  ; This is also a comment
```

## Future Features

- Language Server Protocol (LSP) integration
- Advanced error detection and validation
- Code formatting
- Refactoring support
- IntelliSense for complex configurations

## Requirements

- Visual Studio Code 1.80.0 or higher

## Installation

This extension is part of the Diana language toolchain. Install it through the VS Code extension marketplace or build it from source.

## Contributing

Contributions are welcome! Please see the main Diana project repository for contribution guidelines.

## License

MIT License - see the LICENSE file for details. 