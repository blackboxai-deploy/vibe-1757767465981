'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { QRCodeGenerator, QRCodeModal } from '@/components/QRCodeGenerator'

interface Project {
  id: string
  name: string
  type: string
  status: 'running' | 'stopped' | 'building' | 'error'
  lastAccessed: string
  url?: string
  port?: number
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'E-commerce Frontend',
      type: 'Next.js',
      status: 'running',
      lastAccessed: '2 minutes ago',
      url: `${typeof window !== 'undefined' ? window.location.origin : ''}/preview/1`,
      port: 3001
    },
    {
      id: '2', 
      name: 'API Server',
      type: 'Node.js',
      status: 'stopped',
      lastAccessed: '1 hour ago',
      port: 8000
    },
    {
      id: '3',
      name: 'Mobile App',
      type: 'React Native',
      status: 'building',
      lastAccessed: '30 minutes ago'
    }
  ])

  const [systemStats] = useState({
    cpu: 45,
    memory: 62,
    storage: 38,
    activeProjects: 1
  })

  const [newProject, setNewProject] = useState({
    name: '',
    type: 'next-js',
    template: 'blank'
  })

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'running': return 'bg-green-500'
      case 'stopped': return 'bg-gray-500'
      case 'building': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'running': return 'Running'
      case 'stopped': return 'Stopped'
      case 'building': return 'Building'
      case 'error': return 'Error'
      default: return 'Unknown'
    }
  }

  const handleProjectAction = async (projectId: string, action: 'start' | 'stop' | 'restart' | 'delete') => {
    try {
      const response = await fetch('/api/projects/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, action })
      })
      
      if (response.ok) {
        toast.success(`Project ${action}ed successfully`)
        // Update project status
        setProjects(prev => prev.map(p => 
          p.id === projectId 
            ? { ...p, status: action === 'start' ? 'running' : action === 'stop' ? 'stopped' : p.status }
            : p
        ))
      } else {
        throw new Error(`Failed to ${action} project`)
      }
    } catch (error) {
      toast.error(`Failed to ${action} project`)
    }
  }

  const createProject = async () => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      })
      
      if (response.ok) {
        const project = await response.json()
        setProjects(prev => [...prev, project])
        setNewProject({ name: '', type: 'next-js', template: 'blank' })
        toast.success('Project created successfully')
      } else {
        throw new Error('Failed to create project')
      }
    } catch (error) {
      toast.error('Failed to create project')
    }
  }

  const openEditor = (projectId: string) => {
    window.open(`/editor?project=${projectId}`, '_blank')
  }

  const openTerminal = (projectId: string) => {
    window.open(`/terminal?project=${projectId}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Remote Dev Environment</h1>
              <p className="text-muted-foreground">Access your development projects from anywhere</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                Online
              </Badge>
              <QRCodeModal url={typeof window !== 'undefined' ? window.location.origin : 'https://sb-b60klb88n9ks.vercel.run'} />
              <Dialog>
                <DialogTrigger asChild>
                  <Button>New Project</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Set up a new development project in your remote environment
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Project Name</Label>
                      <Input
                        id="name"
                        value={newProject.name}
                        onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="my-awesome-project"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type">Project Type</Label>
                      <Select value={newProject.type} onValueChange={(value) => setNewProject(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="next-js">Next.js</SelectItem>
                          <SelectItem value="react">React</SelectItem>
                          <SelectItem value="node-js">Node.js</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="vue">Vue.js</SelectItem>
                          <SelectItem value="angular">Angular</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="template">Template</Label>
                      <Select value={newProject.template} onValueChange={(value) => setNewProject(prev => ({ ...prev, template: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blank">Blank Project</SelectItem>
                          <SelectItem value="starter">Starter Template</SelectItem>
                          <SelectItem value="full-stack">Full Stack</SelectItem>
                          <SelectItem value="api">API Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setNewProject({ name: '', type: 'next-js', template: 'blank' })}>
                      Cancel
                    </Button>
                    <Button onClick={createProject} disabled={!newProject.name}>
                      Create Project
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            {/* QR Code Access */}
            <QRCodeGenerator 
              url={typeof window !== 'undefined' ? window.location.origin : 'https://sb-b60klb88n9ks.vercel.run'}
              title="📱 Instant Phone Access"
              description="Scan with your phone camera to access your remote dev environment from anywhere!"
            />
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common development tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded"></div>
                    <span>Clone Repo</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded"></div>
                    <span>Import Project</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <div className="w-8 h-8 bg-purple-500 rounded"></div>
                    <span>Global Terminal</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <div className="w-8 h-8 bg-orange-500 rounded"></div>
                    <span>File Manager</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <CardDescription>{project.type}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}></div>
                        <Badge variant="secondary" className="text-xs">
                          {getStatusText(project.status)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Last accessed: {project.lastAccessed}
                    </div>
                    
                    {project.url && project.status === 'running' && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm font-medium">Live Preview</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {project.url}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => openEditor(project.id)}
                        className="flex-1"
                      >
                        Open Editor
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openTerminal(project.id)}
                      >
                        Terminal
                      </Button>
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                      {project.status === 'stopped' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleProjectAction(project.id, 'start')}
                          className="flex-1"
                        >
                          Start
                        </Button>
                      )}
                      {project.status === 'running' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleProjectAction(project.id, 'stop')}
                            className="flex-1"
                          >
                            Stop
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleProjectAction(project.id, 'restart')}
                            className="flex-1"
                          >
                            Restart
                          </Button>
                        </>
                      )}
                      {project.url && project.status === 'running' && (
                        <Button
                          size="sm"
                          onClick={() => window.open(project.url, '_blank')}
                          className="flex-1"
                        >
                          Preview
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Resources</CardTitle>
                  <CardDescription>Current usage of your remote environment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span>{systemStats.cpu}%</span>
                    </div>
                    <Progress value={systemStats.cpu} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Memory Usage</span>
                      <span>{systemStats.memory}%</span>
                    </div>
                    <Progress value={systemStats.memory} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Storage Usage</span>
                      <span>{systemStats.storage}%</span>
                    </div>
                    <Progress value={systemStats.storage} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Environment Status</CardTitle>
                  <CardDescription>Current state of your development environment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Projects</span>
                    <Badge>{systemStats.activeProjects}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Connection Status</span>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Connected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Backup</span>
                    <span className="text-sm text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uptime</span>
                    <span className="text-sm text-muted-foreground">4 days, 12 hours</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Environment Settings</CardTitle>
                <CardDescription>Configure your remote development environment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auto-save</div>
                      <div className="text-sm text-muted-foreground">Automatically save file changes</div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Backup Schedule</div>
                      <div className="text-sm text-muted-foreground">Automatic project backups</div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Resource Limits</div>
                      <div className="text-sm text-muted-foreground">CPU and memory allocation</div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Access Control</div>
                      <div className="text-sm text-muted-foreground">Manage remote access permissions</div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}