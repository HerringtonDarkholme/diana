import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Diana configuration language extension is now active!');

  // Register commands
  const helloWorldCommand = vscode.commands.registerCommand('vscode-diana.helloWorld', () => {
    vscode.window.showInformationMessage('Hello from Diana Configuration Language!');
  });

  const restartCommand = vscode.commands.registerCommand('diana.restart', () => {
    vscode.window.showInformationMessage('Diana Language Server restart command - LSP not yet implemented');
  });

  // Register hover provider for Diana files
  const hoverProvider = vscode.languages.registerHoverProvider('diana', {
    provideHover(document, position, _token) {
      const range = document.getWordRangeAtPosition(position);
      const word = document.getText(range);
      
      // Provide basic information about Diana syntax
      if (word === 'true' || word === 'false') {
        return new vscode.Hover('Diana boolean value');
      } else if (word === 'null') {
        return new vscode.Hover('Diana null value');
      } else if (word.match(/^-?\d+$/)) {
        return new vscode.Hover('Diana integer value');
      } else if (word.match(/^-?\d+\.\d+$/)) {
        return new vscode.Hover('Diana float value');
      }

      return new vscode.Hover('Diana configuration language');
    }
  });

  // Register document symbol provider for Diana files
  const documentSymbolProvider = vscode.languages.registerDocumentSymbolProvider('diana', {
    provideDocumentSymbols(document, _token) {
      const symbols: vscode.DocumentSymbol[] = [];
      const text = document.getText();
      const lines = text.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Skip comments and empty lines
        if (trimmed.startsWith(';') || trimmed === '') {
          continue;
        }

        // Match key-value pairs
        const keyValueMatch = trimmed.match(/^([^:]+):\s*(.*)$/);
        if (keyValueMatch) {
          const key = keyValueMatch[1].trim();
          const value = keyValueMatch[2].trim();
          
          const range = new vscode.Range(i, 0, i, line.length);
          const selectionRange = new vscode.Range(i, line.indexOf(key), i, line.indexOf(key) + key.length);
          
          let kind = vscode.SymbolKind.Property;
          if (value.startsWith('{') || value === '' && i + 1 < lines.length && lines[i + 1].match(/^  /)) {
            kind = vscode.SymbolKind.Object;
          } else if (value.startsWith('[')) {
            kind = vscode.SymbolKind.Array;
          }

          const symbol = new vscode.DocumentSymbol(
            key,
            value,
            kind,
            range,
            selectionRange
          );
          
          symbols.push(symbol);
        }
      }

      return symbols;
    }
  });

  // Register completion provider for Diana files
  const completionProvider = vscode.languages.registerCompletionItemProvider('diana', {
    provideCompletionItems(_document, _position, _token, _context) {
      const completions: vscode.CompletionItem[] = [];

      // Basic value completions
      const trueCompletion = new vscode.CompletionItem('true', vscode.CompletionItemKind.Value);
      trueCompletion.detail = 'Boolean true value';
      completions.push(trueCompletion);

      const falseCompletion = new vscode.CompletionItem('false', vscode.CompletionItemKind.Value);
      falseCompletion.detail = 'Boolean false value';
      completions.push(falseCompletion);

      const nullCompletion = new vscode.CompletionItem('null', vscode.CompletionItemKind.Value);
      nullCompletion.detail = 'Null value';
      completions.push(nullCompletion);

      return completions;
    }
  });

  // Add subscriptions
  context.subscriptions.push(helloWorldCommand);
  context.subscriptions.push(restartCommand);
  context.subscriptions.push(hoverProvider);
  context.subscriptions.push(documentSymbolProvider);
  context.subscriptions.push(completionProvider);

  // Show activation message
  vscode.window.showInformationMessage('Diana configuration language support activated!');
}

export function deactivate() {
  console.log('Diana extension deactivated');
} 