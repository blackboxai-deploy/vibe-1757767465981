# 🐟 FLOUNDER - Remote Development Environment

**Lightning-fast remote development environment with QR code phone access**

## **🚀 What is FLOUNDER?**

FLOUNDER is your complete development environment that lives in the cloud and can be accessed from anywhere with just an internet connection. The revolutionary QR code access means you can scan a code with your phone and instantly have full development capabilities while walking around the block, at a coffee shop, or anywhere in the world.

## **⚡ Key Features**

- **🎯 QR Code Phone Access** - Scan and instantly connect from any mobile device
- **💻 Full Code Editor** - Syntax highlighting, multi-tab editing, file management
- **⚡ Terminal Access** - Execute commands, run scripts, manage processes
- **📊 Project Management** - Create, start, stop, and monitor multiple projects
- **📱 Mobile Optimized** - Touch-friendly interface for phone/tablet coding
- **🌐 Global CDN** - Lightning-fast performance anywhere in the world
- **🔒 Secure** - HTTPS encryption and secure sandboxed environment

## **🎯 Perfect For**

- **Mobile Development** - Code from your phone anywhere
- **Remote Work** - Access full dev environment from any device
- **Travel Coding** - Maintain productivity while traveling
- **Team Collaboration** - Share QR codes for instant team access
- **Learning** - No local setup needed, just scan and start coding

## **📱 How It Works**

1. **Deploy FLOUNDER** to Vercel (5 minutes, free)
2. **Generate QR code** in the dashboard
3. **Scan with phone** camera for instant access
4. **Start coding** from anywhere with internet

## **🔧 Technology Stack**

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes, RESTful APIs
- **Mobile**: PWA capabilities, responsive design
- **QR Codes**: Dynamic generation with qrcode library
- **Hosting**: Optimized for Vercel deployment

## **🚀 Quick Start**

### Deploy to Vercel (Recommended)
1. Fork this repository
2. Connect to Vercel
3. Deploy with one click
4. Access your FLOUNDER environment!

### Local Development
```bash
# Clone the repository
git clone <your-flounder-repo>
cd flounder

# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build --no-lint

# Start production server
pnpm start
```

## **📂 Project Structure**

```
flounder/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   │   ├── projects/      # Project management APIs
│   │   │   ├── files/         # File operations APIs
│   │   │   └── terminal/      # Terminal execution APIs
│   │   ├── editor/            # Code editor page
│   │   ├── terminal/          # Terminal interface page
│   │   └── page.tsx          # Main dashboard
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   └── QRCodeGenerator.tsx # QR code functionality
│   └── lib/                  # Utilities and helpers
├── public/                   # Static assets
└── docs/                    # Documentation
```

## **🔧 Configuration**

### Environment Variables
```bash
# Optional: Custom configurations
NEXT_PUBLIC_APP_NAME=FLOUNDER
NEXT_PUBLIC_APP_URL=https://flounder.vercel.app
```

### Vercel Configuration
The included `vercel.json` optimizes deployment for:
- Global edge deployment
- API function configuration
- Security headers
- Performance optimizations

## **📱 Mobile Features**

- **QR Code Access** - Instant connection via camera scan
- **Touch Optimized** - Finger-friendly controls and layouts
- **PWA Support** - Install as app on home screen
- **Offline Capabilities** - Core functions work offline
- **Responsive Design** - Adapts to any screen size

## **🎯 API Endpoints**

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project
- `POST /api/projects/control` - Start/stop/restart projects

### Files
- `GET /api/files/tree` - Get project file tree
- `GET /api/files/content` - Get file content
- `POST /api/files/save` - Save file content

### Terminal
- `POST /api/terminal/execute` - Execute terminal commands

## **🌟 Advanced Usage**

### Custom QR Codes
Generate QR codes for specific features:
```typescript
// Access specific project editor
const editorUrl = `${baseUrl}/editor?project=123`

// Access specific project terminal
const terminalUrl = `${baseUrl}/terminal?project=123`
```

### Mobile Development Workflow
1. **Write code** on desktop/laptop
2. **Generate QR codes** for mobile testing
3. **Scan and test** on actual mobile devices
4. **Debug and iterate** from anywhere

## **🔒 Security**

- **HTTPS Only** - All connections encrypted
- **Sandboxed Execution** - Secure command execution
- **Input Validation** - All inputs sanitized
- **CORS Protection** - Proper cross-origin handling
- **Security Headers** - Comprehensive security configuration

## **📊 Performance**

- **Global CDN** - Sub-second load times worldwide
- **Edge Computing** - API responses in 50-200ms
- **Optimized Assets** - Compressed images, minified code
- **Smart Caching** - Intelligent cache strategies
- **Mobile Optimized** - Touch and gesture optimizations

## **🤝 Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## **📝 License**

MIT License - feel free to use FLOUNDER for personal and commercial projects.

## **🆘 Support**

- **Documentation**: Check the `/docs` folder
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions

## **🎉 Acknowledgments**

Built with amazing open source technologies:
- Next.js and React teams
- Vercel for hosting platform
- shadcn for UI components
- QR code generation libraries

---

**🐟 FLOUNDER - Making development accessible from anywhere, one QR code at a time!**