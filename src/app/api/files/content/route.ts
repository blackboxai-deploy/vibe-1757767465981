import { NextRequest, NextResponse } from 'next/server'

// Mock file contents for demonstration
const getFileContent = (projectId: string, filePath: string): string => {
  const contents: { [key: string]: { [key: string]: string } } = {
    '1': {
      'src/app/page.tsx': `'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductCard } from '@/components/ProductCard'

export default function Home() {
  const products = [
    { id: 1, name: 'Laptop', price: 999, image: '/laptop.jpg' },
    { id: 2, name: 'Phone', price: 699, image: '/phone.jpg' },
    { id: 3, name: 'Tablet', price: 499, image: '/tablet.jpg' }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Our Store</h1>
        <p className="text-lg text-muted-foreground">
          Discover amazing products at great prices
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}`,

      'src/components/ProductCard.tsx': `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Product {
  id: number
  name: string
  price: number
  image: string
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="w-full h-48 bg-muted rounded mb-4"></div>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>
          High-quality {product.name.toLowerCase()} for all your needs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">\${product.price}</span>
          <Button>Add to Cart</Button>
        </div>
      </CardContent>
    </Card>
  )
}`,

      'package.json': `{
  "name": "ecommerce-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18",
    "react-dom": "^18",
    "@radix-ui/react-card": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "tailwindcss": "^3.3.0"
  }
}`
    },

    '2': {
      'src/server.js': `const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 8000

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api', require('./routes/api'))
app.use('/auth', require('./routes/auth'))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`)
})`,

      'src/routes/api.js': `const express = require('express')
const router = express.Router()

// GET /api/products
router.get('/products', (req, res) => {
  const products = [
    { id: 1, name: 'Laptop', price: 999 },
    { id: 2, name: 'Phone', price: 699 },
    { id: 3, name: 'Tablet', price: 499 }
  ]
  res.json(products)
})

// POST /api/products
router.post('/products', (req, res) => {
  const { name, price } = req.body
  
  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' })
  }

  const newProduct = {
    id: Date.now(),
    name,
    price: parseFloat(price)
  }

  res.status(201).json(newProduct)
})

module.exports = router`,

      'package.json': `{
  "name": "api-server",
  "version": "1.0.0",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.0",
    "helmet": "^6.0.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0",
    "jest": "^29.0.0"
  }
}`
    },

    '3': {
      'src/App.tsx': `import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import HomeScreen from './screens/Home'
import ProfileScreen from './screens/Profile'

const Stack = createStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}`,

      'src/screens/Home.tsx': `import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Mobile App</Text>
      <Text style={styles.subtitle}>
        This is a React Native application
      </Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.buttonText}>Go to Profile</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
})`,

      'package.json': `{
  "name": "mobile-app",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "test": "jest"
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-native": "^0.72.0",
    "@react-navigation/native": "^6.0.0",
    "@react-navigation/stack": "^6.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-native": "^0.72.0",
    "jest": "^29.0.0"
  }
}`
    }
  }

  return contents[projectId]?.[filePath] || ''
}

// GET /api/files/content - Get file content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project')
    const filePath = searchParams.get('path')

    if (!projectId || !filePath) {
      return NextResponse.json(
        { error: 'Project ID and file path are required' },
        { status: 400 }
      )
    }

    const content = getFileContent(projectId, filePath)
    
    if (content === '') {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // In a real implementation, you would:
    // 1. Read the actual file from the file system
    // 2. Handle binary files appropriately
    // 3. Apply security checks and permissions
    // 4. Handle large files with streaming
    // 5. Cache frequently accessed files
    // 6. Handle file encoding properly

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    })

  } catch (error) {
    console.error('Error fetching file content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch file content' },
      { status: 500 }
    )
  }
}