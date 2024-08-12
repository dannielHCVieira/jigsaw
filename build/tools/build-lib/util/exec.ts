import { execSync, ExecSyncOptions } from "child_process";

export function runCommandSync(command: string, args: string[] = [], options: ExecSyncOptions = { stdio: 'inherit' }) {
    try {
        execSync(`${command} ${args.join(' ')}`, options);
        return 0;
    } catch (error) {
        console.error(`Error executing command: ${command} ${args.join(' ')}\n${error.stack.toString()}`);
        process.exit(1);
    }
}


