"use client"
import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { checkHealth } from "@/lib/api"
import { Wifi, WifiOff, AlertCircle } from "lucide-react"

export function BackendStatus() {
  const [status, setStatus] = React.useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking')
  const [details, setDetails] = React.useState<string>('')

  React.useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        setStatus('checking')
        const health = await checkHealth()
        
        if (health.status === 'healthy') {
          setStatus('connected')
          setDetails(`MongoDB: ${health.mongodb}, GEMINI_AI: ${health.genai}`)
        } else {
          setStatus('error')
          setDetails('Backend unhealthy')
        }
      } catch (error) {
        setStatus('disconnected')
        setDetails('Cannot connect to backend')
      }
    }

    // Check immediately
    checkBackendStatus()

    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          variant: 'default' as const,
          icon: Wifi,
          text: 'Connected',
          className: 'bg-green-500 hover:bg-green-600'
        }
      case 'disconnected':
        return {
          variant: 'destructive' as const,
          icon: WifiOff,
          text: 'Disconnected',
          className: 'bg-red-500 hover:bg-red-600'
        }
      case 'error':
        return {
          variant: 'destructive' as const,
          icon: AlertCircle,
          text: 'Error',
          className: 'bg-yellow-500 hover:bg-yellow-600'
        }
      default:
        return {
          variant: 'secondary' as const,
          icon: Wifi,
          text: 'Checking...',
          className: 'bg-gray-500 hover:bg-gray-600'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={config.variant} 
        className={config.className}
        title={details}
      >
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    </div>
  )
}
