import { NextRequest, NextResponse } from 'next/server'

// Mock database for projects (same as in main route)
const projects = [
  {
    id: '1',
    name: 'E-commerce Frontend',
    type: 'Next.js',
    status: 'running',
    lastAccessed: new Date().toISOString(),
    port: 3001,
    createdAt: new Date().toISOString(),
    template: 'starter',
    description: 'A modern e-commerce frontend built with Next.js',
    dependencies: ['react', 'next', 'tailwindcss', 'shadcn/ui'],
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint'
    }
  },
  {
    id: '2',
    name: 'API Server',
    type: 'Node.js',
    status: 'stopped',
    lastAccessed: new Date(Date.now() - 3600000).toISOString(),
    port: 8000,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    template: 'api',
    description: 'RESTful API server built with Node.js and Express',
    dependencies: ['express', 'cors', 'helmet', 'dotenv'],
    scripts: {
      dev: 'nodemon server.js',
      start: 'node server.js',
      test: 'jest'
    }
  },
  {
    id: '3',
    name: 'Mobile App',
    type: 'React Native',
    status: 'building',
    lastAccessed: new Date(Date.now() - 1800000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    template: 'mobile',
    description: 'Cross-platform mobile app built with React Native',
    dependencies: ['react-native', 'react-navigation', 'react-native-vector-icons'],
    scripts: {
      android: 'react-native run-android',
      ios: 'react-native run-ios',
      start: 'react-native start'
    }
  }
]

// GET /api/projects/[id] - Get project details
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const project = projects.find(p => p.id === id)
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const projectIndex = projects.findIndex(p => p.id === id)
    if (projectIndex === -1) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Update project with provided fields
    const updatedProject = {
      ...projects[projectIndex],
      ...body,
      lastAccessed: new Date().toISOString()
    }

    projects[projectIndex] = updatedProject

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id] - Delete specific project
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const projectIndex = projects.findIndex(p => p.id === id)
    if (projectIndex === -1) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Remove project from array
    const deletedProject = projects.splice(projectIndex, 1)[0]

    // In a real implementation, you would:
    // 1. Stop any running processes for this project
    // 2. Delete project files and directories
    // 3. Clean up associated resources
    // 4. Remove from database

    return NextResponse.json({ 
      message: 'Project deleted successfully',
      project: deletedProject
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}