'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface TerminalHistory {
  id: string
  command: string
  output: string
  timestamp: string
  status: 'success' | 'error' | 'running'
}

interface SystemInfo {
  os: string
  node: string
  npm: string
  git: string
  pwd: string
}

export default function Terminal() {
  const [projectId, setProjectId] = useState<string>('')
  const [projectName, setProjectName] = useState<string>('')
  const [currentCommand, setCurrentCommand] = useState<string>('')
  const [history, setHistory] = useState<TerminalHistory[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isCommandRunning, setIsCommandRunning] = useState(false)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // Get project ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const projectIdParam = urlParams.get('project')
    if (projectIdParam) {
      setProjectId(projectIdParam)
      loadProject(projectIdParam)
      connectWebSocket(projectIdParam)
    }

    // Focus input on mount
    inputRef.current?.focus()

    // Cleanup WebSocket on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    // Scroll to bottom when new history is added
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const loadProject = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`)
      if (response.ok) {
        const project = await response.json()
        setProjectName(project.name)
      }
    } catch (error) {
      console.error('Error loading project:', error)
    }
  }

  const connectWebSocket = (projectId: string) => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/api/terminal/ws?project=${projectId}`
      
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        toast.success('Terminal connected')
        
        // Get initial system info
        executeCommand('echo "=== SYSTEM INFO ==="')
        executeCommand('pwd')
        executeCommand('node --version')
        executeCommand('npm --version')
        executeCommand('git --version')
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        handleWebSocketMessage(data)
      }

      ws.onclose = () => {
        setIsConnected(false)
        setIsCommandRunning(false)
        toast.error('Terminal disconnected')
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
        setIsCommandRunning(false)
        toast.error('Terminal connection error')
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      toast.error('Failed to connect to terminal')
    }
  }

  const handleWebSocketMessage = (data: any) => {
    const { type, command, output, status, timestamp } = data

    if (type === 'command_result') {
      setHistory(prev => prev.map(item => 
        item.command === command && item.status === 'running'
          ? { ...item, output, status, timestamp }
          : item
      ))
      setIsCommandRunning(false)
      
      // Extract system info from initial commands
      if (command.includes('pwd') && status === 'success') {
        setSystemInfo(prev => ({ ...prev, pwd: output.trim() } as SystemInfo))
      }
    }
  }

  const executeCommand = async (command: string) => {
    if (!command.trim() || !isConnected || isCommandRunning) return

    const historyItem: TerminalHistory = {
      id: `${Date.now()}-${Math.random()}`,
      command,
      output: '',
      timestamp: new Date().toISOString(),
      status: 'running'
    }

    setHistory(prev => [...prev, historyItem])
    setIsCommandRunning(true)

    // Add to command history
    setCommandHistory(prev => {
      const newHistory = prev.filter(cmd => cmd !== command)
      return [command, ...newHistory].slice(0, 50) // Keep last 50 commands
    })

    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'execute_command',
          command,
          project: projectId
        }))
      } else {
        // Fallback to HTTP if WebSocket not available
        const response = await fetch('/api/terminal/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command, project: projectId })
        })

        if (response.ok) {
          const result = await response.json()
          setHistory(prev => prev.map(item => 
            item.id === historyItem.id
              ? { ...item, output: result.output, status: result.status }
              : item
          ))
        } else {
          throw new Error('Command execution failed')
        }
        setIsCommandRunning(false)
      }
    } catch (error) {
      setHistory(prev => prev.map(item => 
        item.id === historyItem.id
          ? { ...item, output: 'Error: Failed to execute command', status: 'error' }
          : item
      ))
      setIsCommandRunning(false)
      console.error('Command execution error:', error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentCommand.trim()) {
      executeCommand(currentCommand)
      setCurrentCommand('')
      setHistoryIndex(-1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCurrentCommand('')
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // Basic tab completion for common commands
      const commonCommands = ['ls', 'cd', 'pwd', 'npm', 'node', 'git', 'mkdir', 'rm', 'cp', 'mv']
      const matches = commonCommands.filter(cmd => cmd.startsWith(currentCommand))
      if (matches.length === 1) {
        setCurrentCommand(matches[0] + ' ')
      }
    }
  }

  const clearTerminal = () => {
    setHistory([])
    toast.success('Terminal cleared')
  }

  const getPrompt = () => {
    const user = 'dev'
    const host = 'remote'
    const dir = systemInfo?.pwd ? systemInfo.pwd.split('/').pop() || '~' : '~'
    return `${user}@${host}:${dir}$`
  }

  const formatOutput = (output: string) => {
    return output.split('\n').map((line, index) => (
      <div key={index} className="text-sm">
        {line || <br />}
      </div>
    ))
  }

  const getStatusColor = (status: TerminalHistory['status']) => {
    switch (status) {
      case 'success': return 'text-green-400'
      case 'error': return 'text-red-400'
      case 'running': return 'text-yellow-400'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.close()}
            >
              ← Back to Dashboard
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="font-semibold">Terminal - {projectName || 'Remote Environment'}</h1>
              <p className="text-xs text-muted-foreground">Project ID: {projectId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${isConnected 
                ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                : 'bg-red-500/10 text-red-500 border-red-500/20'
              }`}
            >
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            <Button size="sm" variant="outline" onClick={clearTerminal}>
              Clear
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Terminal */}
        <div className="flex-1 flex flex-col bg-black text-green-400 font-mono">
          {/* Terminal Output */}
          <div 
            ref={terminalRef}
            className="flex-1 p-4 overflow-y-auto space-y-2"
            style={{ maxHeight: 'calc(100vh - 140px)' }}
          >
            {/* Welcome Message */}
            <div className="text-green-300 text-sm mb-4">
              <div>Welcome to Remote Development Environment Terminal</div>
              <div>Type commands to interact with your project</div>
              <div className="text-gray-500">Use ↑↓ arrows to navigate command history</div>
            </div>

            {/* Command History */}
            {history.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">{getPrompt()}</span>
                  <span className="text-white">{item.command}</span>
                  {item.status === 'running' && (
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  )}
                </div>
                {item.output && (
                  <div className={`pl-4 ${getStatusColor(item.status)}`}>
                    {formatOutput(item.output)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Command Input */}
          <div className="border-t border-gray-800 p-4">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <span className="text-blue-400 whitespace-nowrap">{getPrompt()}</span>
              <Input
                ref={inputRef}
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none text-white focus:ring-0 focus:outline-none p-0"
                placeholder={isConnected ? "Enter command..." : "Connecting..."}
                disabled={!isConnected || isCommandRunning}
                autoComplete="off"
              />
              {isCommandRunning && (
                <div className="text-yellow-400 text-sm">Running...</div>
              )}
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l bg-muted/5">
          <div className="p-4 space-y-4">
            {/* System Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">System Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {systemInfo ? (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Working Dir:</span>
                      <span className="font-mono">{systemInfo.pwd || 'Loading...'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Node.js:</span>
                      <span className="font-mono">{systemInfo.node || 'Loading...'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">NPM:</span>
                      <span className="font-mono">{systemInfo.npm || 'Loading...'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Git:</span>
                      <span className="font-mono">{systemInfo.git || 'Loading...'}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-muted-foreground">Loading system info...</div>
                )}
              </CardContent>
            </Card>

            {/* Quick Commands */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Commands</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() => executeCommand('ls -la')}
                  disabled={!isConnected || isCommandRunning}
                >
                  ls -la
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() => executeCommand('npm install')}
                  disabled={!isConnected || isCommandRunning}
                >
                  npm install
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() => executeCommand('npm run build --no-lint')}
                  disabled={!isConnected || isCommandRunning}
                >
                  npm run build
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() => executeCommand('npm start')}
                  disabled={!isConnected || isCommandRunning}
                >
                  npm start
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() => executeCommand('git status')}
                  disabled={!isConnected || isCommandRunning}
                >
                  git status
                </Button>
              </CardContent>
            </Card>

            {/* Command History */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Recent Commands</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {commandHistory.slice(0, 10).map((cmd, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs h-6 p-2 font-mono"
                      onClick={() => setCurrentCommand(cmd)}
                    >
                      {cmd}
                    </Button>
                  ))}
                  {commandHistory.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-2">
                      No recent commands
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}