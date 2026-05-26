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

