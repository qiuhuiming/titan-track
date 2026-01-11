import { GoogleGenAI } from '@google/genai'
import { WorkoutEntry, Exercise, Language } from '../types'

export const geminiService = {
  analyzePerformance: async (
    logs: WorkoutEntry[],
    exercises: Exercise[],
    lang: Language = 'zh'
  ): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' })

    const contextData = logs.map((log) => {
      const exercise = exercises.find((e) => e.id === log.exerciseId)
      return {
        date: log.date,
        exercise: exercise?.name,
        type: log.workoutType,
        sets: log.sets.map((s) => ({
          weight: s.weight,
          reps: s.reps,
          rpe: s.rpe,
          dist: s.distance,
          time: s.timeMinutes,
        })),
      }
    })

    const langInstruction = lang === 'zh' ? '请用中文回答。' : 'Please respond in English.'

    const prompt = `
      As a world-class performance coach, analyze the following fitness training data:
      ${JSON.stringify(contextData)}
      
      Please provide:
      1. A summary of recent progress.
      2. Identification of any plateaus or concerns.
      3. Specific, actionable advice for the next week of training.
      4. A motivational insight based on the consistency of the user.
      
      Format the response in clear Markdown. Keep it professional but encouraging.
      ${langInstruction}
    `

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      })
      return (
        response.text ||
        (lang === 'zh' ? '目前无法生成分析。' : "I couldn't generate an analysis at this time.")
      )
    } catch (error) {
      console.error('Gemini Analysis Error:', error)
      return lang === 'zh'
        ? '分析时出错，请检查 API 配置。'
        : 'An error occurred while analyzing your data. Please check your API configuration.'
    }
  },

  getWorkoutAdvice: async (
    query: string,
    logs: WorkoutEntry[],
    exercises: Exercise[],
    lang: Language = 'zh'
  ): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' })

    const summary = `Total workouts: ${logs.length}. Common exercises: ${exercises
      .slice(0, 3)
      .map((e) => e.name)
      .join(', ')}.`
    const langInstruction = lang === 'zh' ? '请用中文简短地回答。' : 'Respond concisely in English.'

    const prompt = `
      User Query: ${query}
      User Training Summary: ${summary}
      
      Respond as a fitness expert. Give concise, science-based advice.
      ${langInstruction}
    `

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      })
      return response.text || (lang === 'zh' ? '未找到建议。' : 'No advice found.')
    } catch (error) {
      return lang === 'zh' ? '连接 AI 教练出错。' : 'Error connecting to AI coach.'
    }
  },
}
