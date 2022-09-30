import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface Counter {
	[key: string]: number;
}

let counters: Counter = {
	created: 0,
	changes: 0,
	terminals: 0,
	editorsOpend: 0,
	deleted: 0,
};

export function activate(context: vscode.ExtensionContext) {
	counters.created = context.globalState.get('created') || 0;
	counters.changes = context.globalState.get('changes') || 0;
	counters.deleted = context.globalState.get('deleted') || 0;
	counters.terminals = context.globalState.get('terminals') || 0;
	counters.editorsOpend = context.globalState.get('editorsOpend') || 0;

	function getHtmlForPanel(): string {
		const htmlDoc = fs.readFileSync(
			context.extensionPath + '/media/activityView.html',
			'utf8'
		);

		return htmlDoc
			.replace('$(title)', 'Coding activity')
			.replace(
				'$(css)',
				context.extensionPath + '/media/activityView.css'
			)
			.replace('$(deleted)', counters.deleted.toString())
			.replace('$(changed)', counters.changes.toString())
			.replace('$(created)', counters.created.toString())
			.replace('$(terminals)', counters.terminals.toString());
	}

	let showStatsQuickCommandhandler = vscode.commands.registerCommand(
		'tracker.showQuick',
		() => {
			const showQuick = vscode.window.createQuickPick();
			showQuick.items = Object.keys(counters).map((k: string) => {
				let item: vscode.QuickPickItem = {
					label: k + ': ' + counters[k],
				};
				return item;
			});
			showQuick.onDidHide(() => showQuick.dispose());
			showQuick.onDidAccept(() => {
				showQuick.dispose();
			});
			showQuick.show();
		}
	);

	let saveStatsCommandhandler = vscode.commands.registerCommand(
		'tracker.saveStats',
		(e) => {
			saveCounter(context.globalState);
		}
	);

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
			panel.webview.html = getHtmlForPanel();

			const updateInterval = setInterval(() => {
				panel.webview.html = getHtmlForPanel();
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

	context.subscriptions.push(saveStatsCommandhandler);
	context.subscriptions.push(showStatsQuickCommandhandler);
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

const saveCounter = (state: vscode.Memento) => {
	Object.keys(counters).forEach((k: string) => {
		state.update(k, counters[k]);
	});
};

export function deactivate(context: vscode.ExtensionContext) {
	saveCounter(context.globalState);
}
