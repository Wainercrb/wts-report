import { spawn } from 'child_process';

export async function executeCommand(
  command: string,
  args: string[],
  cwd?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
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
      if (code !== 0) {
        reject(new Error(errorOutput || `Command failed with exit code ${code}`));
      } else {
        resolve(output);
      }
    });

    cp.on('error', reject);
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