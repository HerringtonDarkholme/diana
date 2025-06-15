import { describe, it, expect } from 'vitest';
import { compile } from '../src/compiler';
import { parse } from '../src/parser';
import { tokenize } from '../src/tokenizer';

// Helper function to compile Diana string to JSON
function compileToJson(dianaString: string): any {
  const tokens = tokenize(dianaString);
  const ast = parse(tokens);
  return compile(ast);
}

describe('Diana E2E Snapshot Tests', () => {
  it('should compile simple key-value pairs', () => {
    const input = `
name: "Diana"
version: "0.1.0"
active: true
count: 42
    `.trim();
    
    const result = compileToJson(input);
    expect(result).toMatchSnapshot();
  });

  it('should compile nested objects', () => {
    const input = `
database: {
  host: "localhost"
  port: 5432
  credentials: {
    username: "admin"
    password: "secret"
    ssl: true
  }
}
    `.trim();
    
    const result = compileToJson(input);
    expect(result).toMatchSnapshot();
  });

  it('should compile arrays and lists', () => {
    const input = `
servers: ["web1", "web2", "web3"]
ports: [80, 443, 8080]
features: ["authentication", "logging", "monitoring"]
mixed: [1, "two", true, null]
    `.trim();
    
    const result = compileToJson(input);
    expect(result).toMatchSnapshot();
  });

  it('should compile dot notation keys', () => {
    const input = `
app.name: "MyApp"
app.config.debug: true
app.config.timeout: 30000
server.database.host: "db.example.com"
server.database.port: 5432
    `.trim();
    
    const result = compileToJson(input);
    expect(result).toMatchSnapshot();
  });

  it('should compile quoted keys with special characters', () => {
    const input = `
"app.name": "Special Key"
"server-config": "dash-key"
["computed.key"]: "bracket notation"
"spaced key": "with spaces"
    `.trim();
    
    const result = compileToJson(input);
    expect(result).toMatchSnapshot();
  });

  it('should compile multi-line strings', () => {
    const input = `
description: """
This is a multi-line string
that spans several lines
and preserves formatting.
"""
sql: """
SELECT * FROM users
WHERE active = true
  AND created_at > '2023-01-01'
ORDER BY created_at DESC;
"""
    `.trim();
    
    const result = compileToJson(input);
    expect(result).toMatchSnapshot();
  });

  it('should compile complex nested structures', () => {
    const input = `
; Configuration for a web application
application: {
  name: "E-Commerce Platform"
  version: "2.1.0"
  
  ; Server configuration
  server: {
    host: "0.0.0.0"
    port: 8080
    ssl: {
      enabled: true
      cert: "/path/to/cert.pem"
      key: "/path/to/key.pem"
    }
  }
  
  ; Database settings
  database: {
    type: "postgresql"
    connection: {
      host: "db.internal"
      port: 5432
      database: "ecommerce"
      pool: {
        min: 2
        max: 10
        timeout: 30000
      }
    }
  }
  
  ; Feature flags
  features: {
    payments: true
    recommendations: false
    analytics: true
  }
}

; Environment-specific overrides
environment.production: true
environment.debug: false
logging.level: "info"
logging.outputs: ["console", "file"]

; Service configurations as separate objects
payment_service.name: "payment-gateway"
payment_service.url: "https://api.payments.com"
payment_service.timeout: 5000

email_service.name: "email-service"
email_service.url: "https://api.email.com"
email_service.timeout: 3000
    `.trim();
    
    const result = compileToJson(input);
    expect(result).toMatchSnapshot();
  });

  it('should compile mixed data types and null values', () => {
    const input = `
string_value: "hello world"
integer_value: 123
float_value: 45.67
boolean_true: true
boolean_false: false
null_value: null
empty_string: ""
zero_number: 0
    `.trim();
    
    const result = compileToJson(input);
    expect(result).toMatchSnapshot();
  });

  it('should compile user configuration using dot notation', () => {
    const input = `
; User 1 configuration
user1.id: 1
user1.name: "Alice"
user1.email: "alice@example.com"
user1.active: true
user1.roles: ["admin", "user"]

; User 2 configuration  
user2.id: 2
user2.name: "Bob"
user2.email: "bob@example.com"
user2.active: false
user2.roles: ["user"]
user2.metadata.last_login: "2023-12-01"
user2.metadata.preferences.theme: "dark"
user2.metadata.preferences.notifications: true

; User list
user_ids: [1, 2]
    `.trim();
    
    const result = compileToJson(input);
    expect(result).toMatchSnapshot();
  });

  it('should compile with comments throughout', () => {
    const input = `
; Top-level comment
name: "Test App"  ; inline comment

; Section for API configuration
api: {
  ; Base URL for the API
  base_url: "https://api.example.com"
  
  ; API version
  version: "v1"
  
  ; Timeout settings
  timeouts: {
    connect: 5000  ; Connection timeout in ms
    read: 30000    ; Read timeout in ms
  }
}

; Another top-level setting
debug: true
    `.trim();
    
    const result = compileToJson(input);
    expect(result).toMatchSnapshot();
  });

  it('should compile indented lists with asterisk syntax', () => {
    const input = `
pets:
  * object: 'obj'
    inList: true
  * name: "Fluffy"
    type: "cat"
    age: 3

config:
  * feature: "auth"
    enabled: true
  * feature: "logging"
    enabled: false
    level: "debug"

simple_list:
  * "item1"
  * "item2"
  * "item3"
    `.trim();
    
    const result = compileToJson(input);
    expect(result).toMatchSnapshot();
  });
}); 