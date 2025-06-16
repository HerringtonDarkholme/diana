# Diana Configuration Language Grammar (Simple Mode)

## 1. Introduction

Diana is a configuration language designed for clarity and tooling support. This document covers **Simple Mode**, which is like YAML but without automatic type conversion, giving you explicit control over your data types.

### Key Features
- Human-readable syntax
- Explicit data types
- Support for comments
- Flexible key formats
- Both inline and indented structures

## 2. Syntax Basics

### Comments
Diana supports both line comments and block comments:

#### Line Comments
Line comments start with `;` and continue to the end of the line:

```diana
; This is a comment
key: "value"  ; This is also a comment
```

#### Block Comments
Block comments start with `;;;` and end with `;;;`, allowing multi-line comments:

```diana
;;;
This is a block comment that can span
multiple lines and is useful for longer
explanations or documentation.
;;;

key: "value"

;;;
Another block comment
with more content
;;;
```

### Indentation and Block Structure
Diana uses indentation to define nested structures, similar to YAML:

```diana
parent:
  child1: "value1"
  child2: "value2"
  nested:
    deep: "nested value"
```

## 3. Data Types

### Integer
Whole numbers, including negative values:

```diana
positive: 123
negative: -456
zero: 0
```

**JSON Output:**
```json
{
  "positive": 123,
  "negative": -456,
  "zero": 0
}
```

### Float
Decimal numbers:

```diana
pi: 3.14159
negative_float: -2.5
```

**JSON Output:**
```json
{
  "pi": 3.14159,
  "negative_float": -2.5
}
```

### Scientific Notation
Numbers in scientific notation:

```diana
avogadro: 6.0221409e+23
small: 1.23e-10
```

**JSON Output:**
```json
{
  "avogadro": 6.0221409e+23,
  "small": 1.23e-10
}
```

### Boolean
True or false values:

```diana
enabled: true
disabled: false
```

**JSON Output:**
```json
{
  "enabled": true,
  "disabled": false
}
```

### Null
Represents absence of value:

```diana
empty: null
```

**JSON Output:**
```json
{
  "empty": null
}
```

### String
Text values in double quotes:

```diana
simple: "Hello, World!"
with_spaces: "This has spaces"
empty_string: ""
```

**JSON Output:**
```json
{
  "simple": "Hello, World!",
  "with_spaces": "This has spaces",
  "empty_string": ""
}
```

#### Multi-line Strings
Use triple quotes for multi-line strings:

```diana
description: """
This is a multi-line string.
It can span multiple lines
and preserves formatting.
"""
```

**JSON Output:**
```json
{
  "description": "\nThis is a multi-line string.\nIt can span multiple lines\nand preserves formatting.\n"
}
```

## 4. Keys and Objects

### Key Types

#### KeyPath (Dot Notation)
Simple identifiers and dot-separated paths:

```diana
simple_key: "value"
nested.path.key: "nested value"
top.level.config: 42
```

**JSON Output:**
```json
{
  "simple_key": "value",
  "nested": {
    "path": {
      "key": "nested value"
    }
  },
  "top": {
    "level": {
      "config": 42
    }
  }
}
```

#### StringKey (Quoted Keys)
Keys in double quotes, useful for keys with special characters:

```diana
"key with spaces": "value"
"dot.in.key": "literal dot in key name"
"special-chars!@#": "value"
```

**JSON Output:**
```json
{
  "key with spaces": "value",
  "dot.in.key": "literal dot in key name",
  "special-chars!@#": "value"
}
```

#### ComputedKey (Bracketed Keys)
Keys in square brackets for numbers, booleans, or strings:

```diana
[123]: "numeric key"
[true]: "boolean key"
["complex.key"]: "string key with dots"
```

**JSON Output:**
```json
{
  "123": "numeric key",
  "true": "boolean key",
  "complex.key": "string key with dots"
}
```

### Object Definition

#### Inline Objects
Objects defined on a single line:

```diana
config: { host: "localhost", port: 8080 }
point: { x: 10, y: 20 }
```

**JSON Output:**
```json
{
  "config": {
    "host": "localhost",
    "port": 8080
  },
  "point": {
    "x": 10,
    "y": 20
  }
}
```

#### Indented Objects
Objects defined with indentation:

```diana
database:
  host: "localhost"
  port: 5432
  credentials:
    username: "admin"
    password: "secret"
```

**JSON Output:**
```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "credentials": {
      "username": "admin",
      "password": "secret"
    }
  }
}
```

#### Mixed Style
Combining inline and indented styles:

```diana
server: {
  host: "localhost",
  settings:
    debug: true
    timeout: 30,
  port: 8080
}
```

**JSON Output:**
```json
{
  "server": {
    "host": "localhost",
    "settings": {
      "debug": true,
      "timeout": 30
    },
    "port": 8080
  }
}
```

### Nested Objects
Objects can be nested to any depth:

```diana
app:
  database:
    primary:
      host: "db1.example.com"
      port: 5432
    replica:
      host: "db2.example.com"
      port: 5432
  cache:
    redis:
      host: "redis.example.com"
      port: 6379
```

**JSON Output:**
```json
{
  "app": {
    "database": {
      "primary": {
        "host": "db1.example.com",
        "port": 5432
      },
      "replica": {
        "host": "db2.example.com",
        "port": 5432
      }
    },
    "cache": {
      "redis": {
        "host": "redis.example.com",
        "port": 6379
      }
    }
  }
}
```

## 5. Lists

### Inline Lists
Lists defined on a single line:

```diana
numbers: [1, 2, 3, 4, 5]
colors: ["red", "green", "blue"]
mixed: [1, "two", true, null]
```

**JSON Output:**
```json
{
  "numbers": [1, 2, 3, 4, 5],
  "colors": ["red", "green", "blue"],
  "mixed": [1, "two", true, null]
}
```

### Indented Lists
Lists defined with indentation using `*`:

```diana
fruits:
  * "apple"
  * "banana"
  * "orange"

tasks:
  * "write documentation"
  * "test the parser"
  * "deploy application"
```

**JSON Output:**
```json
{
  "fruits": ["apple", "banana", "orange"],
  "tasks": [
    "write documentation",
    "test the parser",
    "deploy application"
  ]
}
```

### Mixed Style Lists
Combining inline and indented elements:

```diana
config: [
  "item1",
  * "item2"
  * "item3"
  * "item4",
  "item5"
]
```

**JSON Output:**
```json
{
  "config": ["item1", "item2", "item3", "item4", "item5"]
}
```

### Nested Lists
Lists can contain other lists and objects:

```diana
matrix:
  * [1, 2, 3]
  * [4, 5, 6]
  * [7, 8, 9]

users:
  * { name: "Alice", age: 30 }
  * { name: "Bob", age: 25 }
```

**JSON Output:**
```json
{
  "matrix": [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ],
  "users": [
    { "name": "Alice", "age": 30 },
    { "name": "Bob", "age": 25 }
  ]
}
```

## 6. Examples

### Basic Configuration
```diana
; Application configuration
app_name: "My Application"
version: "1.0.0"
debug: true

; Server settings
server:
  host: "0.0.0.0"
  port: 8080
  ssl: false

; Database configuration
database:
  host: "localhost"
  port: 5432
  name: "myapp_db"
  credentials:
    username: "dbuser"
    password: "dbpass"
```

**JSON Output:**
```json
{
  "app_name": "My Application",
  "version": "1.0.0",
  "debug": true,
  "server": {
    "host": "0.0.0.0",
    "port": 8080,
    "ssl": false
  },
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "myapp_db",
    "credentials": {
      "username": "dbuser",
      "password": "dbpass"
    }
  }
}
```

### Objects with Various Key Types
```diana
; Different key formats
simple_key: "value"
"quoted key": "value with quoted key"
nested.path: "dot notation"
[42]: "numeric key"
[true]: "boolean key"
["special.key"]: "quoted key with dots"

; Top-level nested path
config.database.timeout: 30
config.cache.ttl: 3600
```

**JSON Output:**
```json
{
  "simple_key": "value",
  "quoted key": "value with quoted key",
  "nested": {
    "path": "dot notation"
  },
  "42": "numeric key",
  "true": "boolean key",
  "special.key": "quoted key with dots",
  "config": {
    "database": {
      "timeout": 30
    },
    "cache": {
      "ttl": 3600
    }
  }
}
```

### Lists and Collections
```diana
; Simple lists
numbers: [1, 2, 3, 4, 5]
names: ["Alice", "Bob", "Charlie"]

; Indented lists
colors:
  * "red"
  * "green"
  * "blue"

; Mixed data types
mixed_list: [
  1,
  "string",
  true,
  null,
  { key: "value" }
]

; List of objects
users:
  * { name: "Alice", role: "admin" }
  * { name: "Bob", role: "user" }
  * { name: "Charlie", role: "moderator" }
```

**JSON Output:**
```json
{
  "numbers": [1, 2, 3, 4, 5],
  "names": ["Alice", "Bob", "Charlie"],
  "colors": ["red", "green", "blue"],
  "mixed_list": [
    1,
    "string",
    true,
    null,
    { "key": "value" }
  ],
  "users": [
    { "name": "Alice", "role": "admin" },
    { "name": "Bob", "role": "user" },
    { "name": "Charlie", "role": "moderator" }
  ]
}
```

### Nested Structures
```diana
; Complex nested configuration
application:
  name: "Web Service"
  version: "2.1.0"

  environments:
    development:
      database:
        host: "dev-db.local"
        port: 5432
      api:
        base_url: "http://localhost:3000"
        timeout: 5000

    production:
      database:
        host: "prod-db.example.com"
        port: 5432
      api:
        base_url: "https://api.example.com"
        timeout: 10000

  features:
    * "authentication"
    * "logging"
    * "monitoring"
    * "caching"
```

**JSON Output:**
```json
{
  "application": {
    "name": "Web Service",
    "version": "2.1.0",
    "environments": {
      "development": {
        "database": {
          "host": "dev-db.local",
          "port": 5432
        },
        "api": {
          "base_url": "http://localhost:3000",
          "timeout": 5000
        }
      },
      "production": {
        "database": {
          "host": "prod-db.example.com",
          "port": 5432
        },
        "api": {
          "base_url": "https://api.example.com",
          "timeout": 10000
        }
      }
    },
    "features": [
      "authentication",
      "logging",
      "monitoring",
      "caching"
    ]
  }
}
```

### Real-world Configuration Scenarios
```diana
; Web server configuration
server:
  listen:
    address: "0.0.0.0"
    port: 80

  ssl:
    enabled: true
    certificate: "/path/to/cert.pem"
    private_key: "/path/to/key.pem"

  routes:
    * { path: "/api/*", handler: "api_handler" }
    * { path: "/static/*", handler: "static_handler" }
    * { path: "/*", handler: "default_handler" }

; Logging configuration
logging:
  level: "info"
  outputs:
    * { type: "console", format: "text" }
    * { type: "file", path: "/var/log/app.log", format: "json" }

  loggers:
    "app.database": "debug"
    "app.auth": "warn"
    "app.api": "info"
```

**JSON Output:**
```json
{
  "server": {
    "listen": {
      "address": "0.0.0.0",
      "port": 80
    },
    "ssl": {
      "enabled": true,
      "certificate": "/path/to/cert.pem",
      "private_key": "/path/to/key.pem"
    },
    "routes": [
      { "path": "/api/*", "handler": "api_handler" },
      { "path": "/static/*", "handler": "static_handler" },
      { "path": "/*", "handler": "default_handler" }
    ]
  },
  "logging": {
    "level": "info",
    "outputs": [
      { "type": "console", "format": "text" },
      { "type": "file", "path": "/var/log/app.log", "format": "json" }
    ],
    "loggers": {
      "app.database": "debug",
      "app.auth": "warn",
      "app.api": "info"
    }
  }
}
```

## 7. Grammar Reference

### Token Types
The Diana tokenizer recognizes these token types:

- `COMMENT` - Comments starting with `;` (line comments) or delimited by `;;;` (block comments)
- `IDENTIFIER` - Keys and identifiers
- `NUMBER` - Numeric values (int, float, scientific)
- `STRING` - String literals in double quotes
- `BOOLEAN` - `true` or `false`
- `NULL` - `null` value
- `COLON` - `:` separator
- `COMMA` - `,` separator
- `LBRACE`/`RBRACE` - `{` and `}` for objects
- `LBRACKET`/`RBRACKET` - `[` and `]` for lists and computed keys
- `ASTERISK` - `*` for list items
- `NEWLINE` - Line breaks
- `INDENT`/`DEDENT` - Indentation changes
- `EOF` - End of file

### AST Node Types
The parser generates these AST node types:

- `Program` - Root node containing all top-level elements
- `KeyValue` - Key-value pairs
- `Object` - Object literals
- `List` - Array literals
- `String` - String values
- `Number` - Numeric values
- `Boolean` - Boolean values
- `Null` - Null values
- `Identifier` - Identifiers and references
- `Comment` - Comment nodes

### Key Types
- `KeyPath` - Dot-separated paths (e.g., `a.b.c`)
- `StringKey` - Quoted string keys
- `ComputedKey` - Bracketed keys for numbers, booleans, or strings

### Error Handling
The parser handles common syntax errors:

- Missing colons after keys
- Unmatched brackets or braces
- Invalid indentation
- Malformed strings or numbers
- Unexpected tokens

Common error scenarios and their solutions:

```diana
; Error: Missing colon
key "value"  ; Should be: key: "value"

; Error: Unmatched brackets
list: [1, 2, 3  ; Should be: list: [1, 2, 3]

; Error: Invalid indentation
parent:
child: "value"  ; Should be indented under parent
```
