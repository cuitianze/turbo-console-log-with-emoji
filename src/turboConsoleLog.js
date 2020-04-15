// @flow

const vscode = require("vscode");
const emoji = require("node-emoji");
const logMessage = require("./logMessage");
import type { LogMessage, ExtensionProperties } from "./Types";

/**
 * Activation method
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 */
function activate(context: vscode.ExtensionContext) {
  vscode.commands.registerCommand(
    "turboConsoleLogWithEmoji.displayLogMessage",
    async () => {
      const editor: vscode.TextEditor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const tabSize: number = editor.options.tabSize;
      const document: vscode.TextDocument = editor.document;
      const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(
        "turboConsoleLogWithEmoji"
      );
      const properties: ExtensionProperties = extensionProperties(config);
      for (let index = 0; index < editor.selections.length; index++) {
        const selection: vscode.Selection = editor.selections[index];
        const selectedVar: string = document.getText(selection);
        const lineOfSelectedVar: number = selection.active.line;
        // Check if the selection line is not the last one in the document and the selected variable is not empty
        if (selectedVar.trim().length !== 0) {
          await editor.edit(editBuilder => {
            const logMessageLine = logMessage.logMessageLine(
              document,
              lineOfSelectedVar,
              selectedVar
            );
            editBuilder.insert(
              new vscode.Position(
                logMessageLine >= document.lineCount
                  ? document.lineCount
                  : logMessageLine,
                0
              ),
              logMessage.message(
                document,
                selectedVar,
                lineOfSelectedVar,
                properties.wrapLogMessage,
                properties.logMessagePrefix,
                properties.quote,
                properties.addSemicolonInTheEnd,
                properties.insertEnclosingClass,
                properties.insertEnclosingFunction,
                properties.makeLogColorful,
                properties.logMessageFontSize,
                tabSize
              )
            );
          });
        }
      }
    }
  );
  vscode.commands.registerCommand(
    "turboConsoleLogWithEmoji.commentAllLogMessages",
    () => {
      const editor: vscode.TextEditor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const tabSize: number = editor.options.tabSize;
      const document: vscode.TextDocument = editor.document;
      const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(
        "turboConsoleLogWithEmoji"
      );
      const properties: ExtensionProperties = extensionProperties(config);
      const logMessages: LogMessage[] = logMessage.detectAll(
        document,
        tabSize,
        properties.logMessagePrefix
      );
      editor.edit(editBuilder => {
        logMessages.forEach(({ spaces, lines }) => {
          lines.forEach((line: vscode.Range) => {
            editBuilder.delete(line);
            editBuilder.insert(
              new vscode.Position(line.start.line, 0),
              `${spaces}// ${document.getText(line).trim()}\n`
            );
            // editBuilder.insert(new vscode.Position(range.start.line, 80), `Good`)
          });
        });
      });
    }
  );
  vscode.commands.registerCommand(
    "turboConsoleLogWithEmoji.uncommentAllLogMessages",
    () => {
      const editor: vscode.TextEditor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const tabSize: number = editor.options.tabSize;
      const document: vscode.TextDocument = editor.document;
      const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(
        "turboConsoleLogWithEmoji"
      );
      const properties: ExtensionProperties = extensionProperties(config);
      const logMessages: LogMessage[] = logMessage.detectAll(
        document,
        tabSize,
        properties.logMessagePrefix
      );
      editor.edit(editBuilder => {
        logMessages.forEach(({ spaces, lines }) => {
          lines.forEach((line: vscode.Range) => {
            editBuilder.delete(line);
            editBuilder.insert(
              new vscode.Position(line.start.line, 0),
              `${spaces}${document
                .getText(line)
                .replace(/\//g, "")
                .trim()}\n`
            );
          });
        });
      });
    }
  );
  vscode.commands.registerCommand(
    "turboConsoleLogWithEmoji.deleteAllLogMessages",
    () => {
      const editor: vscode.TextEditor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const tabSize: number = editor.options.tabSize;
      const document: vscode.TextDocument = editor.document;
      const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(
        "turboConsoleLogWithEmoji"
      );
      const properties: ExtensionProperties = extensionProperties(config);
      const logMessages: LogMessage[] = logMessage.detectAll(
        document,
        tabSize,
        properties.logMessagePrefix
      );
      editor.edit(editBuilder => {
        logMessages.forEach(({ lines }) => {
          lines.forEach((line: vscode.Range) => {
            editBuilder.delete(line);
          });
        });
      });
    }
  );
}

function setLogMessagePrefix(
  logMessagePrefix: String,
  randomEmojiPrefix: Boolean
) {
  const prefix = [];
  if (randomEmojiPrefix) {
    prefix.push(emoji.random().emoji);
  }
  if (logMessagePrefix) {
    prefix.push(logMessagePrefix);
  }

  return prefix.length ? prefix.join(" ") : "";
}

// TODO: Fix flow issues later
function extensionProperties(
  workspaceConfig: vscode.WorkspaceConfiguration
): ExtensionProperties {
  const extensionProperties: ExtensionProperties = {};
  // $FlowFixMe
  extensionProperties.wrapLogMessage = workspaceConfig.wrapLogMessage || false;
  // $FlowFixMe
  extensionProperties.logMessagePrefix = setLogMessagePrefix(
    // $FlowFixMe
    workspaceConfig.logMessagePrefix,
    // $FlowFixMe
    workspaceConfig.randomEmojiPrefix
  );
  // $FlowFixMe
  extensionProperties.addSemicolonInTheEnd =
    // $FlowFixMe
    workspaceConfig.addSemicolonInTheEnd || false;
  // $FlowFixMe
  extensionProperties.insertEnclosingClass =
    // $FlowFixMe
    workspaceConfig.insertEnclosingClass || true;
  // $FlowFixMe
  extensionProperties.insertEnclosingFunction =
    // $FlowFixMe
    workspaceConfig.insertEnclosingFunction || true;
  // $FlowFixMe
  extensionProperties.quote = workspaceConfig.quote || '"';
  // $FlowFixMe
  extensionProperties.makeLogColorful = workspaceConfig.makeLogColorful || true;
  // $FlowFixMe
  extensionProperties.logMessageFontSize =
    // $FlowFixMe
    workspaceConfig.logMessageFontSize || 16;
  return extensionProperties;
}

exports.activate = activate;
