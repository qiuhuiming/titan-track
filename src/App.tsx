import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState('')

  const handleIncrement = () => {
    setCount(c => c + 1)
    setMessage('Incremented!')
    setTimeout(() => setMessage(''), 1000)
  }

  const handleDecrement = () => {
    setCount(c => c - 1)
    setMessage('Decremented!')
    setTimeout(() => setMessage(''), 1000)
  }

  const handleReset = () => {
    setCount(0)
    setMessage('Reset!')
    setTimeout(() => setMessage(''), 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          Hello World
        </h1>
        <p className="text-xl text-white/80 mb-8">
          Tauri v2 + React + Tailwind CSS
        </p>

        <div className="bg-white/20 backdrop-blur rounded-2xl p-6 mb-6">
          <p className="text-white/60 text-sm mb-2">Counter</p>
          <p className="text-6xl font-bold text-white mb-4" accessibilityLabel="count-display">{count}</p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleDecrement}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold rounded-xl transition-all"
              accessibilityLabel="decrement-button"
            >
              - Minus
            </button>
            <button
              onClick={handleIncrement}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-bold rounded-xl transition-all"
              accessibilityLabel="increment-button"
            >
              + Plus
            </button>
          </div>

          <button
            onClick={handleReset}
            className="mt-4 px-6 py-2 bg-white/30 hover:bg-white/40 active:scale-95 text-white font-medium rounded-lg transition-all"
            accessibilityLabel="reset-button"
          >
            Reset
          </button>
        </div>

        {message && (
          <div className="text-white/90 text-lg font-medium animate-pulse">
            {message}
          </div>
        )}

        <div className="mt-4 px-6 py-3 bg-white/20 backdrop-blur rounded-lg text-white">
          iOS App Demo
        </div>
      </div>
    </div>
  )
}

export default App
