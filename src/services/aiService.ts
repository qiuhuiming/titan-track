import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenAI } from '@google/genai'
import OpenAI from 'openai'
import type { AISettings, AIRequestMessage } from '../types'

export interface AIService {
  generateText(systemPrompt: string, messages: AIRequestMessage[]): Promise<string>
  testConnection(): Promise<boolean>
}

class OpenAIService implements AIService {
  private client: OpenAI
  private model: string

  constructor(apiKey: string, model?: string) {
    this.client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
    this.model = model || 'gpt-4o-mini'
  }

  async generateText(systemPrompt: string, messages: AIRequestMessage[]): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    })
    return response.choices[0]?.message?.content || ''
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.models.list()
      return true
    } catch {
      return false
    }
  }
}

class AnthropicService implements AIService {
  private client: Anthropic
  private model: string

  constructor(apiKey: string, model?: string) {
    this.client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
    this.model = model || 'claude-3-5-haiku-20241022'
  }

  async generateText(systemPrompt: string, messages: AIRequestMessage[]): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    })
    const content = response.content[0]
    return content.type === 'text' ? content.text : ''
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.generateText('You are a test assistant.', [{ role: 'user', content: 'Hello' }])
      return true
    } catch {
      return false
    }
  }
}

class GeminiService implements AIService {
  private client: GoogleGenAI
  private model: string

  constructor(apiKey: string, model?: string) {
    this.client = new GoogleGenAI({ apiKey })
    this.model = model || 'gemini-2.0-flash'
  }

  async generateText(systemPrompt: string, messages: AIRequestMessage[]): Promise<string> {
    // Gemini uses 'model' instead of 'assistant' for AI responses
    const contents = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: contents,
      config: { systemInstruction: systemPrompt },
    })
    return response.text || ''
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.generateText('You are a test assistant.', [{ role: 'user', content: 'Hello' }])
      return true
    } catch {
      return false
    }
  }
}

class DeepSeekService implements AIService {
  private client: OpenAI
  private model: string

  constructor(apiKey: string, model?: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com',
      dangerouslyAllowBrowser: true,
    })
    this.model = model || 'deepseek-chat'
  }

  async generateText(systemPrompt: string, messages: AIRequestMessage[]): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    })
    return response.choices[0]?.message?.content || ''
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.generateText('You are a test assistant.', [{ role: 'user', content: 'Hello' }])
      return true
    } catch {
      return false
    }
  }
}

export function createAIService(settings: AISettings): AIService {
  switch (settings.provider) {
    case 'openai':
      return new OpenAIService(settings.apiKey, settings.model)
    case 'anthropic':
      return new AnthropicService(settings.apiKey, settings.model)
    case 'gemini':
      return new GeminiService(settings.apiKey, settings.model)
    case 'deepseek':
      return new DeepSeekService(settings.apiKey, settings.model)
    default:
      throw new Error(`Unknown provider: ${settings.provider as string}`)
  }
}

// Helper function for AI Coach with context
export async function getAIResponse(
  settings: AISettings,
  systemPrompt: string,
  messages: AIRequestMessage[]
): Promise<string> {
  try {
    const service = createAIService(settings)
    return await service.generateText(systemPrompt, messages)
  } catch (error) {
    console.error('AI Service Error:', error)
    throw error
  }
}

// Test connection helper
export async function testAIConnection(settings: AISettings): Promise<boolean> {
  try {
    const service = createAIService(settings)
    return await service.testConnection()
  } catch (error) {
    console.error('AI Connection Test Error:', error)
    return false
  }
}
