import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { log } from './extension.js';
const envWhatToDo = `# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

# example is for PostgreSQL, change values wrapped in < >
# <username> is a Role in PostgreSQL
# <password> is username's db password
# <dbName> is database name to connect to
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<dbName>?schema=public"

# see docs for how to use SECRET_API_KEYs
SECRET_APT_KEY="kiki:kiki@localhost:5432
SECRET_APT_ENV=development
SECRET_API_KEY=1234567890`;
let paths = {};
let pm = 'unknown';
let ex = 'unknown';
const pathManager = {
    'pnpm-lock.yaml': 'pnpm',
    'yarn.lock': 'yarn.lock',
    'bun.lockb': 'bun',
    'package-lock.json': 'npm',
};
function detectPackageManager() {
    for (const [p, h] of Object.entries(pathManager)) {
        if (fs.existsSync(path.join(paths.root, p))) {
            return (pm = h);
        }
    }
    return 'unknown';
}
const pex = { npm: 'pnpm', pnpm: 'pnpm dlx', bun: 'bunx', yarn: 'yarn dlx' };
function xPackageManager(pm) {
    for (const [p, ex] of Object.entries(pex)) {
        if (pm === p) {
            return ex;
        }
    }
    return 'unknown';
}
export function installPrismaPartTwo(thePaths) {
    paths = thePaths;
    log('installPrismaPartTwo entry point');
    pm = detectPackageManager();
    if (pm === 'unknown') {
        vscode.window.showInformationMessage('detectPackageManager err:' + pm);
    }
    else {
        ex = xPackageManager(pm);
    }
    let cmd = ' prisma migrate dev --name init;';
    const cmd2 = ' prisma generate';
    if (ex === 'pnpx') {
        cmd = 'pnpm dlx ' + cmd + 'pnpm dlx ' + cmd2;
    }
    else if (ex === 'yarnx') {
        cmd = 'yarn dlx ' + cmd + 'yarn dlx ' + cmd2;
    }
    else {
        cmd = ex + cmd + ex + cmd2;
    }
    return cmd;
}
//# sourceMappingURL=ormTwo.js.map