import { Eye, EyeOff, Settings, X, Loader2, CheckCircle, XCircle } from 'lucide-react'
import type { ChangeEvent, FC, FormEvent } from 'react'
import { useState, useEffect } from 'react'
import { testAIConnection } from '../services/aiService'
import { translations } from '../translations'
import type { AISettings, AIProvider, Language } from '../types'
import { AI_MODELS, DEFAULT_MODELS } from '../types'

interface AISettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: AISettings | null
  onSave: (settings: AISettings) => void
  language: Language
}

const PROVIDERS: { value: AIProvider; label: string }[] = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'deepseek', label: 'DeepSeek' },
]

type ConnectionStatus = 'not_tested' | 'testing' | 'success' | 'failed'

const AISettingsModal: FC<AISettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  language,
}) => {
  const t = translations[language]
  const initialProvider = settings?.provider || 'openai'
  const [provider, setProvider] = useState<AIProvider>(initialProvider)
  const [apiKey, setApiKey] = useState(settings?.apiKey || '')
  const [model, setModel] = useState(settings?.model || DEFAULT_MODELS[initialProvider])
  const [showKey, setShowKey] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('not_tested')

  // Reset form state when modal opens with new settings
  const settingsKey = settings ? `${settings.provider}-${settings.apiKey}` : 'none'
  useEffect(() => {
    // Only reset when modal opens, not on every settings change
    if (isOpen && settings) {
      setProvider(settings.provider)
      setApiKey(settings.apiKey)
      setModel(settings.model || DEFAULT_MODELS[settings.provider])
      setConnectionStatus('not_tested')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, settingsKey])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleProviderChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newProvider = event.target.value as AIProvider
    setProvider(newProvider)
    setModel(DEFAULT_MODELS[newProvider])
    setConnectionStatus('not_tested')
  }

  const handleApiKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value)
    setConnectionStatus('not_tested')
  }

  const handleModelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setModel(event.target.value)
  }

  const handleTestConnection = async () => {
    if (!apiKey) return

    setConnectionStatus('testing')
    const success = await testAIConnection({ provider, apiKey, model })
    setConnectionStatus(success ? 'success' : 'failed')
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!apiKey) return

    onSave({ provider, apiKey, model })
    onClose()
  }

  const getStatusIndicator = () => {
    switch (connectionStatus) {
      case 'testing':
        return (
          <span className="flex items-center gap-1 text-sm text-slate-500">
            <Loader2 size={14} className="animate-spin" />
            {t.processing}
          </span>
        )
      case 'success':
        return (
          <span className="flex items-center gap-1 text-sm text-emerald-600">
            <CheckCircle size={14} />
            {t.connection_success}
          </span>
        )
      case 'failed':
        return (
          <span className="flex items-center gap-1 text-sm text-rose-600">
            <XCircle size={14} />
            {t.connection_failed}
          </span>
        )
      default:
        return <span className="text-sm text-slate-400">{t.connection_not_tested}</span>
    }
  }

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="animate-in zoom-in-95 fade-in relative w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl duration-300 md:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={24} />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t.ai_settings}</h2>
            <p className="text-sm text-slate-500">{t.ai_settings_desc}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="provider-select"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              {t.provider}
            </label>
            <select
              id="provider-select"
              value={provider}
              onChange={handleProviderChange}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="api-key-input"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              {t.api_key}
            </label>
            <div className="relative">
              <input
                id="api-key-input"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="sk-..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 pr-12 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => {
                  setShowKey(!showKey)
                }}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="model-select"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              {t.model}
            </label>
            <select
              id="model-select"
              value={model}
              onChange={handleModelChange}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {AI_MODELS[provider].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
            <button
              type="button"
              onClick={() => {
                void handleTestConnection()
              }}
              disabled={!apiKey || connectionStatus === 'testing'}
              className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t.test_connection}
            </button>
            {getStatusIndicator()}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-slate-100 px-4 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-200"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={!apiKey}
              className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white shadow-lg shadow-indigo-100 transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t.save_settings}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AISettingsModal
