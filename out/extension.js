import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { displayWebview } from './webview.js';
import { installPrismaPartOne } from './ormOne.js';
import { installPrismaPartTwo } from './ormTwo.js';
import { generateParts } from './partsGenerator.js';
import { spawn, exec } from 'child_process';
import { parsePrismaSchema } from './parse-prisma-schema.js';
let paths = {};
let db = {};
let panel = undefined;
function execShell(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, { cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath }, (err, stdout, stderr) => {
            if (err) {
                reject(new Error(`Command failed: ${stderr}`));
                return;
            }
            resolve(stdout);
        });
    });
}
export const sudoName_ = (await execShell('whoami')).trim();
// will hold the content of prisma/schema.prisma file as a string after we read it
// with fs.readlinkSync in response to 'ready' command from OrmThree.html
// after making models with parsePrismaSchema we will send stringified models
// and set schema to empty string to free up memory
let schema = ''; //
export function runCommandStream(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const proc = spawn(command, args, {
            cwd: options.cwd,
            shell: true,
        });
        proc.stdout.on('data', (data) => {
            const text = data.toString();
            options.onStdout?.(text);
            if (options.terminal) {
                options.terminal.sendText(text, false);
            }
        });
        proc.stderr.on('data', (data) => {
            const text = data.toString();
            options.onStderr?.(text);
            if (options.terminal) {
                options.terminal.sendText(text, false);
            }
        });
        proc.on('close', (code) => {
            resolve(code ?? 0);
        });
        proc.on('error', (err) => {
            reject(err);
        });
    });
}
export const sleep = async (ms) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // ms here is a dummy but required by
            // resolve to send out some value
            resolve(ms);
        }, ms);
    });
};
export const channel = vscode.window.createOutputChannel('getWebviewHtml');
export const log = (msg, show = true) => {
    channel.appendLine(Array.isArray(msg) ? msg.join('\n') : msg);
    if (show) {
        channel.show();
    }
};
export const error = (msg) => {
    vscode.window.showErrorMessage(msg);
    log(`ERROR: ${msg}`);
};
export const info = (msg) => {
    vscode.window.showInformationMessage(msg);
};
function deletePendingFile() {
    if (fs.existsSync(paths.pending)) {
        fs.unlink(paths.pending, (err) => {
            if (err) {
                vscode.window.showInformationMessage('Could not delete installPartTwo.pending file at /prisma. Please delete it yourself');
            }
        });
    }
}
// All NPM package installations commands are issued from here
let terminal;
function sendToTerminal(cmd) {
    if (!terminal) {
        terminal = vscode.window.createTerminal(`WebView Terminal`);
    }
    terminal.show(true); // reveal the terminal
    terminal.sendText(cmd);
}
// let db: DbParams = {}
export async function activate(context) {
    vscode.window.showInformationMessage(`CRUD TEST-EXT -- activated`);
    const workspaceFolders = vscode.workspace.workspaceFolders;
    // console.log(vscode.workspace.workspaceFolders)
    context.subscriptions.push(vscode.commands.registerCommand('test-ext.crudTest', () => {
        // NOTE: in order for vscode.workspace.workspaceFolders to be defined
        // set "path": "/home/mili/Ext/test-ext", in test-ext.code-workspace
        // and set  "name": "webview-ui" in webview-ui/package.json for debugger
        // const folder = vscode.workspace.workspaceFolders?.[0]
        const folders = vscode.workspace.workspaceFolders;
        if (!folders || folders.length === 0) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }
        const rootPath = folders[0].uri.fsPath;
        // if (vscode.workspace.workspaceFolders?.[0].uri.fsPath) {
        //   rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath
        // } else {
        //   rootPath = homedir() // fallback to home directory if workspace folder is not found
        //   if (rootPath !== '/home/mili/Ext/test-ext') {
        //     rootPath = '/home/mili/Ext/test-ext' // override with specific path if home directory is not correct
        //   }
        // }
        log(`rootPath is ${rootPath}`);
        paths = {
            root: rootPath,
            env: path.join(rootPath, '.env'),
            pending: path.join(rootPath, 'prisma/installORMPartTwoPending.txt'),
            schema: path.join(rootPath, 'prisma/schema.prisma'),
            components: path.join(rootPath, 'src', 'lib', 'components'),
        };
        // create a customizable user interface that appears as a distinct editor tab
        // within extension's activation logic
        panel = vscode.window.createWebviewPanel('crCrudSupport', // Identifies the type of the webview internally
        'CRUD Support', // Title displayed to the user
        vscode.ViewColumn.One, // Editor column to show the panel in
        {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        // If prismaSchemaFound is false start with OrmOne.html page which should return
        // a db_ object and so commence communication between this extension and ORMxxx
        // pages in wizard like steps for installing ORM, creating database and generating
        // SvelteKit CRUD support app pages based on the prisma schema models and some
        // additonal functionality selected by users
        if (!fs.existsSync(paths.schema)) {
            // open OrmOne.html and wait for 'installPrismaPartOne' command from
            // it with db_ object as payload
            displayWebview(context, panel, 'OrmOne');
        }
        else if (fs.existsSync(paths.pending)) {
            displayWebview(context, panel, 'OrmTwo');
        }
        else {
            displayWebview(context, panel, 'OrmThree');
        }
        panel.webview.onDidReceiveMessage(async (msg) => {
            switch (msg.command) {
                // OrmOne.html sends this command with db_ object as payload when
                // user clicks 'Install Prisma ORM'
                case 'installPrismaPartOne':
                    log('installPrismaPartOne comand request from OrmOne.html 1');
                    db = JSON.parse(msg.payload);
                    db.adminPwd = sudoName_;
                    let result = await installPrismaPartOne(db, paths);
                    log(`after call to installPrismaPartOne success is ${result.success.toString()}`);
                    displayWebview(context, panel, 'OrmTwo');
                    break;
                case 'installPrismaPartTwo':
                    log('installPrismaPartTwo command request from OrmTwo.html');
                    const cmd = installPrismaPartTwo(paths); //FIX: needs build db models from schema
                    sendToTerminal(`cd ${paths.root}`);
                    sendToTerminal(cmd);
                    deletePendingFile();
                    log('pending file deleted');
                    console.log('installPrismaPartTwo done');
                    // if (result.success) {
                    // wait until prisma migrations folder is created
                    const migrateFolder = path.join(paths.root, 'prisma/migrations');
                    for (let i = 0; i < 10; i++) {
                        await sleep(1000);
                        if (fs.existsSync(migrateFolder)) {
                            break;
                        }
                    }
                    await sleep(3000);
                    // }
                    //   // Create Uri for the schema file
                    //   let uri = vscode.Uri.file(paths.schema)
                    //   // Open schema content in new tab (beside current editor)
                    //   await vscode.window.showTextDocument(uri, {
                    //     viewColumn: vscode.ViewColumn.Beside, // Opens beside active editor
                    //     preview: false, // Optional: Force a new tab (not preview mode)
                    //   })
                    //   log(
                    //     `forming dblink with db params ${JSON.stringify(db)} ${db.owner} ${db.password} ${db.port} ${db.name}`,
                    //   )
                    //   // create Uri for the .env file
                    //   uri = vscode.Uri.file(paths.env)
                    //   await vscode.window.showTextDocument(uri, {
                    //     viewColumn: vscode.ViewColumn.Beside, // Opens beside active editor
                    //     preview: false, // Optional: Force a new tab (not preview mode)
                    //   })
                    // }
                    // log(`installPrismaPartTwo success: ${result.success}`)
                    // console.log('installPrismaPartTwo result', result.success)
                    // // OrmThree needs prisma models; we parse prisma and send stringified models to it
                    console.log('call to open OrmThree');
                    displayWebview(context, panel, 'OrmThree');
                    break;
                case 'ready':
                    // when OrmThree.html is ready it sends 'ready' command and we respond
                    // by sending prisma models and field strips
                    let schema = ''; // NOTE to set it to an empty string after parsing is done
                    try {
                        schema = fs.readFileSync(paths.schema, 'utf-8');
                        if (!schema) {
                            info(`${paths.schema} not found, cannot continue`);
                            panel.dispose();
                        }
                    }
                    catch (err) {
                        const msg = err instanceof Error ? err.message : String(err);
                        console.log('reading schema.prisma', err);
                    }
                    const models = parsePrismaSchema(schema);
                    schema = ''; // free up memory by clearing schema string after parsing
                    panel.webview.postMessage({
                        command: 'sendingModels',
                        payload: models, //JSON.stringify(models),
                    });
                    break;
                case 'CreateCrudSupport':
                    log('createCRUDSupportPage command request from OrmThree.html');
                    console.log(msg.payload);
                    generateParts(context, panel, paths, msg.payload);
                    break;
                case 'close':
                    info('CRUD Support is closing');
                    panel.dispose();
                    break;
                default:
                    log(`Unknown command: ${msg.command}`);
            }
        });
    }));
    // panel?.dispose()
    // Clean up when panel is closed
    panel?.onDidDispose(() => {
        panel = undefined;
    });
}
// This method is called when your extension is deactivated
export function deactivate() { }
//# sourceMappingURL=extension.js.map