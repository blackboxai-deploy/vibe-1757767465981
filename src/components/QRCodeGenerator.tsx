'use client'

import { useState } from 'react'
import * as QRCode from 'qrcode'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface QRCodeGeneratorProps {
  url: string
  title?: string
  description?: string
}

export function QRCodeGenerator({ url, title = "Remote Dev Environment", description = "Scan to access from any device" }: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateQRCode = async () => {
    try {
      setIsGenerating(true)
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })
      setQrCodeUrl(qrDataUrl)
      toast.success('QR Code generated successfully!')
    } catch (error) {
      console.error('Error generating QR code:', error)
      toast.error('Failed to generate QR code')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('URL copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy URL')
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeUrl) return
    
    const link = document.createElement('a')
    link.download = 'remote-dev-environment-qr.png'
    link.href = qrCodeUrl
    link.click()
    toast.success('QR code downloaded!')
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-dashed border-blue-300 dark:border-blue-700">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded"></div>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* URL Display */}
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-xs font-medium text-muted-foreground mb-1">Access URL:</div>
          <div className="text-sm font-mono break-all">{url}</div>
        </div>

        {/* QR Code Display */}
        <div className="text-center">
          {qrCodeUrl ? (
            <div className="space-y-4">
              <div className="inline-block p-4 bg-white rounded-lg shadow-lg">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code for Remote Dev Environment"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <div className="flex justify-center gap-2">
                <Button size="sm" variant="outline" onClick={downloadQRCode}>
                  Download QR
                </Button>
                <Button size="sm" variant="outline" onClick={copyToClipboard}>
                  Copy URL
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-lg mb-4 mx-auto"></div>
                  <div className="text-sm text-muted-foreground">
                    Click below to generate QR code
                  </div>
                </div>
              </div>
              <Button 
                onClick={generateQRCode} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Generating QR Code...' : 'Generate QR Code'}
              </Button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <div className="font-semibold text-sm">📱 How to use:</div>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div>1. Generate QR code above</div>
            <div>2. Open camera on your phone</div>
            <div>3. Point camera at QR code</div>
            <div>4. Tap the notification/link that appears</div>
            <div>5. Your remote dev environment opens instantly!</div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            📱 Mobile Ready
          </Badge>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            🔗 Instant Access
          </Badge>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
            🌐 Any Device
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

// QR Code Modal Component for easy access
export function QRCodeModal({ url }: { url: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <div className="w-4 h-4 bg-white rounded"></div>
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>📱 Instant Phone Access</DialogTitle>
          <DialogDescription>
            Scan this QR code with your phone to instantly access your remote development environment
          </DialogDescription>
        </DialogHeader>
        <QRCodeGenerator url={url} />
      </DialogContent>
    </Dialog>
  )
}