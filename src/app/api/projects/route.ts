import { NextRequest, NextResponse } from 'next/server'

// Mock database for projects
let projects = [
  {
    id: '1',
    name: 'E-commerce Frontend',
    type: 'Next.js',
    status: 'running',
    lastAccessed: new Date().toISOString(),
    port: 3001,
    createdAt: new Date().toISOString(),
    template: 'starter'
  },
  {
    id: '2',
    name: 'API Server',
    type: 'Node.js',
    status: 'stopped',
    lastAccessed: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    port: 8000,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    template: 'api'
  },
  {
    id: '3',
    name: 'Mobile App',
    type: 'React Native',
    status: 'building',
    lastAccessed: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    template: 'mobile'
  }
]

// GET /api/projects - List all projects
export async function GET() {
  try {
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, template } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      )
    }

    // Generate new project
    const newProject = {
      id: String(Date.now()),
      name,
      type,
      template: template || 'blank',
      status: 'stopped' as const,
      lastAccessed: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      port: 3000 + projects.length + 1
    }

    projects.push(newProject)

    // In a real implementation, you would:
    // 1. Create project directory
    // 2. Initialize with chosen template
    // 3. Set up development environment
    // 4. Configure project settings

    return NextResponse.json(newProject, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects - Delete project
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('id')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    const projectIndex = projects.findIndex(p => p.id === projectId)
    if (projectIndex === -1) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Remove project from array
    projects.splice(projectIndex, 1)

    // In a real implementation, you would:
    // 1. Stop any running processes
    // 2. Delete project files
    // 3. Clean up resources
    // 4. Update database

    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}