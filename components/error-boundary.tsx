'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{
    error?: Error
    resetError: () => void
  }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

const DefaultErrorFallback = ({ 
  error, 
  resetError 
}: { 
  error?: Error
  resetError: () => void 
}) => (
  <Alert variant="destructive" className="my-4">
    <AlertDescription className="space-y-4">
      <div>
        <strong>Bu bileşen yüklenirken bir hata oluştu</strong>
        {process.env.NODE_ENV === 'development' && error && (
          <p className="text-xs mt-2 text-muted-foreground">
            {error.message}
          </p>
        )}
      </div>
      <Button 
        onClick={resetError} 
        variant="outline" 
        size="sm"
        className="w-full"
      >
        Tekrar Dene
      </Button>
    </AlertDescription>
  </Alert>
)

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent 
          error={this.state.error} 
          resetError={this.resetError} 
        />
      )
    }

    return this.props.children
  }
}