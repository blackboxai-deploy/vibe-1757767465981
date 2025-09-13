import { NextRequest, NextResponse } from 'next/server'

// POST /api/terminal/execute - Execute terminal commands
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { command, project } = body

    if (!command) {
      return NextResponse.json(
        { error: 'Command is required' },
        { status: 400 }
      )
    }

    // Security: Basic command validation and sanitization
    const allowedCommands = [
      'ls', 'pwd', 'cat', 'echo', 'mkdir', 'rmdir', 'touch',
      'node', 'npm', 'npx', 'pnpm', 'yarn',
      'git', 'curl', 'wget',
      'python', 'pip',
      'java', 'javac',
      'docker', 'docker-compose'
    ]

    const commandParts = command.trim().split(' ')
    const baseCommand = commandParts[0]

    // Check if base command is allowed
    if (!allowedCommands.some(allowed => baseCommand.startsWith(allowed))) {
      return NextResponse.json(
        { error: 'Command not allowed for security reasons' },
        { status: 403 }
      )
    }

    // Prevent dangerous operations
    const dangerousPatterns = [
      'rm -rf /',
      'sudo',
      '&&',
      '||',
      ';',
      '|',
      '>',
      '>>',
      '<',
      'eval',
      'exec'
    ]

    if (dangerousPatterns.some(pattern => command.includes(pattern))) {
      return NextResponse.json(
        { error: 'Potentially dangerous command detected' },
        { status: 403 }
      )
    }

    try {
      // Mock command execution for demonstration
      // In a real implementation, you would use proper command execution
      let mockOutput = ''
      let status = 'success'
      if (command === 'pwd') {
        mockOutput = `/projects/${project || 'default'}`
      } else if (command === 'ls' || command === 'ls -la') {
        mockOutput = `total 24
drwxr-xr-x  8 dev dev  256 Jan 15 10:30 .
drwxr-xr-x 12 dev dev  384 Jan 15 09:45 ..
-rw-r--r--  1 dev dev   21 Jan 15 10:30 .env.local
-rw-r--r--  1 dev dev  157 Jan 15 10:25 .gitignore
-rw-r--r--  1 dev dev 2847 Jan 15 10:30 next.config.js
drwxr-xr-x  2 dev dev   64 Jan 15 10:28 node_modules
-rw-r--r--  1 dev dev 1245 Jan 15 10:30 package.json
-rw-r--r--  1 dev dev 1982 Jan 15 10:28 README.md
drwxr-xr-x  4 dev dev  128 Jan 15 10:30 src
-rw-r--r--  1 dev dev  653 Jan 15 10:25 tsconfig.json`
      } else if (command === 'node --version') {
        mockOutput = 'v18.17.0'
      } else if (command === 'npm --version') {
        mockOutput = '9.6.7'
      } else if (command === 'git --version') {
        mockOutput = 'git version 2.34.1'
      } else if (command.startsWith('npm install') || command.startsWith('pnpm install')) {
        mockOutput = `Installing dependencies...
added 324 packages in 12.4s

✅ Installation completed successfully`
      } else if (command.startsWith('npm run build') || command.startsWith('pnpm run build')) {
        mockOutput = `> build
> next build

✓ Linting and checking validity of types
✓ Creating an optimized production build
✓ Compiled successfully

Route (app)                              Size     First Load JS
┌ ○ /                                    5.02 kB        87.5 kB
└ ○ /_not-found                          871 B          83.4 kB
+ First Load JS shared by all            82.5 kB
  ├ chunks/23-c4f262fd85ec7023.js        29.4 kB
  ├ chunks/fd9d1056-2821b0f0cabcd8bd.js  50.6 kB
  └ other shared chunks (total)          2.49 kB

✅ Build completed successfully`
      } else if (command.startsWith('npm start') || command.startsWith('pnpm start')) {
        mockOutput = `> start
> next start

Ready - started server on 0.0.0.0:3000, url: http://localhost:3000`
      } else if (command.startsWith('git status')) {
        mockOutput = `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   src/app/page.tsx
        modified:   src/components/Header.tsx

no changes added to commit (use "git add" or "git commit -a")`
      }

      return NextResponse.json({
        output: mockOutput,
        status,
        command,
        timestamp: new Date().toISOString(),
        duration: Math.random() * 2000 + 500, // Mock duration between 500ms-2.5s
        exitCode: status === 'success' ? 0 : 1
      })

    } catch (execError: any) {
      // Handle execution errors
      return NextResponse.json({
        output: execError.message || 'Command execution failed',
        status: 'error',
        command,
        timestamp: new Date().toISOString(),
        exitCode: 1
      })
    }

  } catch (error) {
    console.error('Terminal execute error:', error)
    return NextResponse.json(
      { error: 'Failed to execute command' },
      { status: 500 }
    )
  }
}