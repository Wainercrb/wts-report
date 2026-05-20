import { spawn } from 'child_process';

/**
 * Execute a shell command and return output as a promise
 * @param command - Command to execute (e.g., 'git', 'cmd.exe')
 * @param args - Arguments array for the command
 * @param cwd - Current working directory (optional)
 * @returns Promise with stdout output, or error message on failure
 */
export async function executeCommand(
  command: string,
  args: string[],
  cwd?: string
): Promise<string> {
  return new Promise((resolve) => {
    const cp = spawn(command, args, { 
      cwd, 
      windowsHide: true 
    });

    let output = '';
    let errorOutput = '';

    cp.stdout.on('data', (data: Buffer) => {
      output += data.toString();
    });

    cp.stderr.on('data', (data: Buffer) => {
      errorOutput += data.toString();
    });

    cp.on('close', (code: number) => {
      if (code !== 0 && errorOutput) {
        resolve(errorOutput);
      } else {
        resolve(output);
      }
    });

    cp.on('error', (error: Error) => {
      resolve(error.message);
    });
  });
}

/**
 * Execute a directory listing command
 * @returns Promise with directory listing output
 */
export async function listDirectory(): Promise<string> {
  const isWindows = process.platform === 'win32';
  const cmd = isWindows ? (process.env.comspec || 'cmd.exe') : 'ls';
  const args = isWindows ? ['/c', 'dir'] : ['-la'];
  
  return executeCommand(cmd, args);
}