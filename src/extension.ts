import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let count = 0;

	let counters = {
		created: 0,
		changes: 0,
		terminals: 0,
		editorsOpend: 0,
		deleted: 0,
	};

	console.log('Congratulations, your extension "tracker" is now active!');

	
	vscode.window.onDidOpenTerminal((e) => {
		counters.terminals++;
		vscode.window.showInformationMessage(
			'Terminals opend: ' + counters.terminals
		);
	});
	vscode.window.onDidChangeActiveTextEditor((e) => {
		counters.editorsOpend++;
		vscode.window.showInformationMessage(
			'Editors opend: ' + counters.editorsOpend
		);
	});

	vscode.workspace.onDidDeleteFiles((e) => {
		counters.deleted += e.files.length;
		vscode.window.showInformationMessage(
			'Files deleted: ' + counters.deleted
		);
	});

	vscode.workspace.onDidCreateFiles((e) => {
		counters.created += e.files.length;
		vscode.window.showInformationMessage(
			'Files created: ' + counters.created
		);
	});

	vscode.workspace.onDidChangeTextDocument((e) => {
		if (e.contentChanges[0].text.length === 0) {
			return;
		}
		counters.changes += e.contentChanges[0].text.length;
		vscode.window.showInformationMessage('Changes: ' + counters.changes);
	});
}

export function deactivate() {}
