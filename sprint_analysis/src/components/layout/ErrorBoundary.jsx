import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Errore nel rendering</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            Si è verificato un errore nel caricamento di questa pagina.
            Prova a navigare su un'altra pagina o ricarica i dati.
          </p>
          <pre className="text-xs text-red-400 bg-muted/50 rounded-lg p-4 max-w-lg overflow-auto mb-4">
            {this.state.error?.message || 'Unknown error'}
          </pre>
          <button
            className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Riprova
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
