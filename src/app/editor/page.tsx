'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface FileNode {
  name: string
  type: 'file' | 'folder'
  path: string
  children?: FileNode[]
  content?: string
}

interface EditorTab {
  id: string
  name: string
  path: string
  content: string
  modified: boolean
}

export default function CodeEditor() {
  const [projectId, setProjectId] = useState<string>('')
  const [projectName, setProjectName] = useState<string>('')
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [openTabs, setOpenTabs] = useState<EditorTab[]>([])
  const [activeTab, setActiveTab] = useState<string>('')
  const [currentContent, setCurrentContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const editorRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Get project ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const projectIdParam = urlParams.get('project')
    if (projectIdParam) {
      setProjectId(projectIdParam)
      loadProject(projectIdParam)
    }
  }, [])

  const loadProject = async (id: string) => {
    try {
      setIsLoading(true)
      
      // Load project details
      const projectResponse = await fetch(`/api/projects/${id}`)
      if (projectResponse.ok) {
        const project = await projectResponse.json()
        setProjectName(project.name)
      }

      // Load file tree
      const filesResponse = await fetch(`/api/files/tree?project=${id}`)
      if (filesResponse.ok) {
        const tree = await filesResponse.json()
        setFileTree(tree)
        
        // Auto-open main file if available
        const mainFile = findMainFile(tree)
        if (mainFile) {
          await openFile(mainFile)
        }
      }
    } catch (error) {
      toast.error('Failed to load project')
      console.error('Error loading project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const findMainFile = (tree: FileNode[]): FileNode | null => {
    // Look for common entry files
    const entryFiles = ['page.tsx', 'index.tsx', 'index.js', 'app.tsx', 'app.js', 'main.tsx', 'main.js']
    
    const searchTree = (nodes: FileNode[]): FileNode | null => {
      for (const node of nodes) {
        if (node.type === 'file' && entryFiles.includes(node.name)) {
          return node
        }
        if (node.children) {
          const found = searchTree(node.children)
          if (found) return found
        }
      }
      return null
    }
    
    return searchTree(tree)
  }

  const openFile = async (file: FileNode) => {
    try {
      // Check if file is already open
      const existingTab = openTabs.find(tab => tab.path === file.path)
      if (existingTab) {
        setActiveTab(existingTab.id)
        setCurrentContent(existingTab.content)
        return
      }

      // Load file content
      const response = await fetch(`/api/files/content?project=${projectId}&path=${encodeURIComponent(file.path)}`)
      if (response.ok) {
        const content = await response.text()
        
        // Create new tab
        const newTab: EditorTab = {
          id: `${Date.now()}-${file.path}`,
          name: file.name,
          path: file.path,
          content,
          modified: false
        }
        
        setOpenTabs(prev => [...prev, newTab])
        setActiveTab(newTab.id)
        setCurrentContent(content)
        
        toast.success(`Opened ${file.name}`)
      } else {
        throw new Error('Failed to load file content')
      }
    } catch (error) {
      toast.error('Failed to open file')
      console.error('Error opening file:', error)
    }
  }

  const saveFile = async (tabId: string) => {
    const tab = openTabs.find(t => t.id === tabId)
    if (!tab) return

    try {
      const response = await fetch('/api/files/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: projectId,
          path: tab.path,
          content: tab.content
        })
      })

      if (response.ok) {
        setOpenTabs(prev => prev.map(t => 
          t.id === tabId ? { ...t, modified: false } : t
        ))
        toast.success('File saved')
      } else {
        throw new Error('Failed to save file')
      }
    } catch (error) {
      toast.error('Failed to save file')
      console.error('Error saving file:', error)
    }
  }

  const closeTab = (tabId: string) => {
    const tab = openTabs.find(t => t.id === tabId)
    if (tab && tab.modified) {
      if (!confirm('File has unsaved changes. Close anyway?')) {
        return
      }
    }

    setOpenTabs(prev => prev.filter(t => t.id !== tabId))
    
    // Switch to another tab if closing active tab
    if (activeTab === tabId) {
      const remainingTabs = openTabs.filter(t => t.id !== tabId)
      if (remainingTabs.length > 0) {
        const nextTab = remainingTabs[remainingTabs.length - 1]
        setActiveTab(nextTab.id)
        setCurrentContent(nextTab.content)
      } else {
        setActiveTab('')
        setCurrentContent('')
      }
    }
  }

  const handleContentChange = (value: string) => {
    setCurrentContent(value)
    
    // Mark current tab as modified
    if (activeTab) {
      setOpenTabs(prev => prev.map(tab => 
        tab.id === activeTab 
          ? { ...tab, content: value, modified: tab.content !== value }
          : tab
      ))
    }
  }

  const renderFileTree = (nodes: FileNode[], depth = 0): React.ReactNode[] => {
    return nodes.map(node => (
      <div key={node.path} style={{ marginLeft: depth * 16 }}>
        <div
          className={`flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer ${
            node.type === 'folder' ? 'font-medium' : ''
          }`}
          onClick={() => node.type === 'file' ? openFile(node) : null}
        >
          <div className={`w-4 h-4 ${
            node.type === 'folder' 
              ? 'bg-blue-500 rounded' 
              : 'bg-gray-500 rounded-sm'
          }`}></div>
          <span className="text-sm truncate">{node.name}</span>
        </div>
        {node.children && renderFileTree(node.children, depth + 1)}
      </div>
    ))
  }

  const filteredFileTree = fileTree.filter(node => 
    searchTerm === '' || node.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getLanguageFromFilename = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    const langMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c'
    }
    return langMap[ext] || 'text'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded animate-pulse mb-4 mx-auto"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
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
              <h1 className="font-semibold">{projectName || 'Code Editor'}</h1>
              <p className="text-xs text-muted-foreground">Project ID: {projectId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              Connected
            </Badge>
            <Button 
              size="sm"
              onClick={() => activeTab && saveFile(activeTab)}
              disabled={!activeTab || !openTabs.find(t => t.id === activeTab)?.modified}
            >
              Save
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* File Explorer Sidebar */}
        <div className="w-64 border-r bg-muted/5 flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-3">Explorer</h2>
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="flex-1 p-2 overflow-y-auto">
            {filteredFileTree.length > 0 ? (
              renderFileTree(filteredFileTree)
            ) : (
              <div className="text-center text-muted-foreground text-sm mt-8">
                {searchTerm ? 'No files found' : 'No files in project'}
              </div>
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          {openTabs.length > 0 && (
            <div className="border-b bg-muted/5">
              <div className="flex overflow-x-auto">
                {openTabs.map(tab => (
                  <div
                    key={tab.id}
                    className={`flex items-center gap-2 px-4 py-2 border-r cursor-pointer min-w-0 ${
                      activeTab === tab.id ? 'bg-background' : 'hover:bg-muted/10'
                    }`}
                    onClick={() => {
                      setActiveTab(tab.id)
                      setCurrentContent(tab.content)
                    }}
                  >
                    <span className="truncate text-sm">{tab.name}</span>
                    {tab.modified && <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        closeTab(tab.id)
                      }}
                      className="text-muted-foreground hover:text-foreground flex-shrink-0 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 relative">
            {activeTab ? (
              <div className="absolute inset-0 flex flex-col">
                <div className="flex-1 p-4">
                  <textarea
                    ref={editorRef}
                    value={currentContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="w-full h-full bg-background border rounded p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                    spellCheck={false}
                    style={{
                      lineHeight: '1.5',
                      tabSize: 2
                    }}
                  />
                </div>
                
                {/* Status Bar */}
                <div className="border-t bg-muted/5 px-4 py-2 text-xs text-muted-foreground flex justify-between">
                  <div className="flex items-center gap-4">
                    <span>
                      Language: {getLanguageFromFilename(openTabs.find(t => t.id === activeTab)?.name || '')}
                    </span>
                    <span>
                      Lines: {currentContent.split('\n').length}
                    </span>
                    <span>
                      Characters: {currentContent.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {openTabs.find(t => t.id === activeTab)?.modified && (
                      <span className="text-orange-500">Unsaved changes</span>
                    )}
                    <span>UTF-8</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="w-16 h-16 bg-muted rounded-lg mb-4 mx-auto"></div>
                  <h3 className="font-medium mb-2">No file open</h3>
                  <p className="text-sm">Select a file from the explorer to start editing</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}