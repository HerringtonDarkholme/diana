import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "vscode-diana" is now active!');

  let disposable = vscode.commands.registerCommand('vscode-diana.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from vscode-diana!');
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {} 