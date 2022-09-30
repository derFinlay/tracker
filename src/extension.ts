import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

let counters = {
	created: 0,
	changes: 0,
	terminals: 0,
	editorsOpend: 0,
	deleted: 0,
};

export function activate(context: vscode.ExtensionContext) {
	function getHtmlForPanel(webview: vscode.Webview): string {
		const htmlDoc = fs.readFileSync(
			context.extensionPath + '/media/activityView.html',
			'utf8'
		);

		return htmlDoc
			.replace('$(deleted)', counters.deleted.toString())
			.replace('$(changed)', counters.changes.toString())
			.replace('$(created)', counters.created.toString())
			.replace('$(terminals)', counters.terminals.toString());
	}

	let showStatsWebviewCommandhandler = vscode.commands.registerCommand(
		'tracker.showActivity',
		() => {
			const panel = vscode.window.createWebviewPanel(
				'codingActivity',
				'Coding Activity',
				vscode.ViewColumn.One,
				{
					localResourceRoots: [
						vscode.Uri.file(
							path.join(context.extensionPath, 'media')
						),
					],
				}
			);
			panel.webview.html = getHtmlForPanel(panel.webview);

			const updateInterval = setInterval(() => {
				panel.webview.html = getHtmlForPanel(panel.webview);
			}, 5000);

			panel.onDidDispose(
				() => {
					clearInterval(updateInterval);
				},
				null,
				context.subscriptions
			);
		}
	);

	context.subscriptions.push(showStatsWebviewCommandhandler);

	vscode.window.onDidOpenTerminal((e) => {
		counters.terminals++;
	});
	vscode.window.onDidChangeActiveTextEditor((e) => {
		counters.editorsOpend++;
	});

	vscode.workspace.onDidDeleteFiles((e) => {
		counters.deleted += e.files.length;
	});

	vscode.workspace.onDidCreateFiles((e) => {
		counters.created += e.files.length;
	});

	vscode.workspace.onDidChangeTextDocument((e) => {
		if (e.contentChanges[0].text.length === 0) {
			return;
		}
		counters.changes += e.contentChanges[0].text.length;
	});
}

const saveCounter = async (counter: string, value: Number): Promise<void> => {
	//TODO: save counter to database
};

export function deactivate() {
	//TODO: save counters
}
