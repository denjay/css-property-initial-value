// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
const properties = require("./properties.json");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "css-property-initial-value" is now active!'
  );

  const hoverProvider: vscode.HoverProvider = {
    provideHover(doc, pos, token): vscode.ProviderResult<vscode.Hover> {
      const range = doc.getWordRangeAtPosition(pos, /[A-Za-z0-9\-]+(?=\s*:)/g);
      if (!range) {
        return;
      }
      const text = doc.getText(range);
      // 将驼峰式转成连字符式
      const property = text.replace(/[A-Z]/, `-$&`).toLowerCase();
      const initialValue = getInitialValue(property);
      if (!initialValue) {
        return;
      }
      return new vscode.Hover(
        `**Initial value of ${property}:** ${initialValue}`
      );
    },
  };
  const languageIds = vscode.workspace
    .getConfiguration("cssPropertyInitialValue")
    .get("languageIds") as Array<string>;
  const selector = languageIds.length ? languageIds : "*";
  let disposable = vscode.languages.registerHoverProvider(
    selector,
    hoverProvider
  );

  context.subscriptions.push(disposable);
}

function getInitialValue(property: string): string | undefined {
  if (properties.hasOwnProperty(property)) {
    // 如果为数组，说明该属性为多个属性的简写形式，所以要找到这些属性的默认属性并拼到一起
    if (Array.isArray(properties[property].initial)) {
      return properties[property].initial
        .map((subProperty: string) => properties[subProperty].initial)
        .join(" ");
    } else {
      return properties[property].initial;
    }
  }
}
// This method is called when your extension is deactivated
export function deactivate() {}
