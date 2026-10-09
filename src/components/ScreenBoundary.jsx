import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

// Keeps one failing screen from taking the whole application down — a screen
// that needs data this practice does not have yet, or a screen file that could
// not be downloaded. Remount it (with a new key) to try again.
export default class ScreenBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    console.error(error)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="card p-6 max-w-xl">
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-xl bg-warn-50 text-warn-600 grid place-items-center shrink-0"><AlertTriangle size={18} /></span>
          <div className="min-w-0">
            <h1 className="text-[15px] font-bold text-ink">This screen could not be shown</h1>
            <p className="text-[12.5px] text-mute mt-1 leading-relaxed">
              It may need information that has not been stored for this practice yet. The rest of CleanBook still works.
            </p>
            <p className="text-[11.5px] text-faint mt-2 font-mono break-all">{String(this.state.error.message || this.state.error)}</p>
          </div>
        </div>
      </div>
    )
  }
}
