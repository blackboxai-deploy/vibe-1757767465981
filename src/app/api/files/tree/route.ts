import { NextRequest, NextResponse } from 'next/server'

interface FileNode {
  name: string
  type: 'file' | 'folder'
  path: string
  children?: FileNode[]
}

// Mock file tree structure for different project types
const getFileTree = (projectId: string): FileNode[] => {
  const trees: { [key: string]: FileNode[] } = {
    '1': [
      {
        name: 'src',
        type: 'folder',
        path: 'src',
        children: [
          {
            name: 'app',
            type: 'folder',
            path: 'src/app',
            children: [
              { name: 'layout.tsx', type: 'file', path: 'src/app/layout.tsx' },
              { name: 'page.tsx', type: 'file', path: 'src/app/page.tsx' },
              { name: 'globals.css', type: 'file', path: 'src/app/globals.css' },
              {
                name: 'products',
                type: 'folder',
                path: 'src/app/products',
                children: [
                  { name: 'page.tsx', type: 'file', path: 'src/app/products/page.tsx' },
                  { name: 'loading.tsx', type: 'file', path: 'src/app/products/loading.tsx' }
                ]
              }
            ]
          },
          {
            name: 'components',
            type: 'folder',
            path: 'src/components',
            children: [
              { name: 'Header.tsx', type: 'file', path: 'src/components/Header.tsx' },
              { name: 'Footer.tsx', type: 'file', path: 'src/components/Footer.tsx' },
              { name: 'ProductCard.tsx', type: 'file', path: 'src/components/ProductCard.tsx' },
              {
                name: 'ui',
                type: 'folder',
                path: 'src/components/ui',
                children: [
                  { name: 'button.tsx', type: 'file', path: 'src/components/ui/button.tsx' },
                  { name: 'card.tsx', type: 'file', path: 'src/components/ui/card.tsx' }
                ]
              }
            ]
          },
          {
            name: 'lib',
            type: 'folder',
            path: 'src/lib',
            children: [
              { name: 'utils.ts', type: 'file', path: 'src/lib/utils.ts' },
              { name: 'api.ts', type: 'file', path: 'src/lib/api.ts' }
            ]
          }
        ]
      },
      { name: 'package.json', type: 'file', path: 'package.json' },
      { name: 'next.config.js', type: 'file', path: 'next.config.js' },
      { name: 'tailwind.config.js', type: 'file', path: 'tailwind.config.js' },
      { name: 'tsconfig.json', type: 'file', path: 'tsconfig.json' },
      { name: 'README.md', type: 'file', path: 'README.md' },
      { name: '.env.local', type: 'file', path: '.env.local' },
      { name: '.gitignore', type: 'file', path: '.gitignore' }
    ],
    
    '2': [
      {
        name: 'src',
        type: 'folder',
        path: 'src',
        children: [
          { name: 'server.js', type: 'file', path: 'src/server.js' },
          { name: 'app.js', type: 'file', path: 'src/app.js' },
          {
            name: 'routes',
            type: 'folder',
            path: 'src/routes',
            children: [
              { name: 'index.js', type: 'file', path: 'src/routes/index.js' },
              { name: 'api.js', type: 'file', path: 'src/routes/api.js' },
              { name: 'auth.js', type: 'file', path: 'src/routes/auth.js' }
            ]
          },
          {
            name: 'middleware',
            type: 'folder',
            path: 'src/middleware',
            children: [
              { name: 'auth.js', type: 'file', path: 'src/middleware/auth.js' },
              { name: 'cors.js', type: 'file', path: 'src/middleware/cors.js' }
            ]
          },
          {
            name: 'models',
            type: 'folder',
            path: 'src/models',
            children: [
              { name: 'User.js', type: 'file', path: 'src/models/User.js' },
              { name: 'Product.js', type: 'file', path: 'src/models/Product.js' }
            ]
          }
        ]
      },
      { name: 'package.json', type: 'file', path: 'package.json' },
      { name: '.env', type: 'file', path: '.env' },
      { name: '.gitignore', type: 'file', path: '.gitignore' },
      { name: 'README.md', type: 'file', path: 'README.md' }
    ],
    
    '3': [
      {
        name: 'src',
        type: 'folder',
        path: 'src',
        children: [
          { name: 'App.tsx', type: 'file', path: 'src/App.tsx' },
          { name: 'index.js', type: 'file', path: 'src/index.js' },
          {
            name: 'components',
            type: 'folder',
            path: 'src/components',
            children: [
              { name: 'Button.tsx', type: 'file', path: 'src/components/Button.tsx' },
              { name: 'Input.tsx', type: 'file', path: 'src/components/Input.tsx' }
            ]
          },
          {
            name: 'screens',
            type: 'folder',
            path: 'src/screens',
            children: [
              { name: 'Home.tsx', type: 'file', path: 'src/screens/Home.tsx' },
              { name: 'Profile.tsx', type: 'file', path: 'src/screens/Profile.tsx' }
            ]
          }
        ]
      },
      { name: 'package.json', type: 'file', path: 'package.json' },
      { name: 'metro.config.js', type: 'file', path: 'metro.config.js' },
      { name: 'babel.config.js', type: 'file', path: 'babel.config.js' },
      { name: 'README.md', type: 'file', path: 'README.md' }
    ]
  }

  return trees[projectId] || []
}

// GET /api/files/tree - Get project file tree
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    const fileTree = getFileTree(projectId)
    
    if (fileTree.length === 0) {
      return NextResponse.json(
        { error: 'Project not found or empty' },
        { status: 404 }
      )
    }

    // In a real implementation, you would:
    // 1. Read the actual file system for the project
    // 2. Filter out ignored files (.git, node_modules, etc.)
    // 3. Apply user-specific file permissions
    // 4. Cache the file tree for performance
    // 5. Watch for file system changes

    return NextResponse.json(fileTree)

  } catch (error) {
    console.error('Error fetching file tree:', error)
    return NextResponse.json(
      { error: 'Failed to fetch file tree' },
      { status: 500 }
    )
  }
}