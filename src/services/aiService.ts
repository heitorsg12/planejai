interface GeminiResponse {
  candidates?: {
    content: {
      parts: { text: string }[]
    }
  }[]
  error?: {
    message?: string
  }
}

export interface InsightData {
  feasibility: {
    status: 'viable' | 'needs_adjustment' | 'unfeasible'
    content: string
  }
  diagnosis: {
    content: string
  }
  suggestions: {
    items: string[]
  }
  extraIncome: {
    items: string[]
  }
  investment: {
    items: string[]
  }
  motivation: {
    content: string
  }
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim()
const MODEL_NAME = 'gemini-2.5-flash'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`

const callGeminiAPI = async (prompt: string, responseMimeType?: string) => {
  if (!API_KEY) {
    throw new Error('A chave da API Gemini não foi configurada.')
  }

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: responseMimeType ? { responseMimeType } : undefined,
    }),
  })

  if (!response.ok) {
    const error = (await response
      .json()
      .catch(() => null)) as GeminiResponse | null
    throw new Error(
      error?.error?.message ||
        `Erro na requisição ao Gemini (${response.status}).`,
    )
  }

  return (await response.json()) as GeminiResponse
}

export const getInsight = async (prompt: string) => {
  const response = await callGeminiAPI(prompt, 'application/json')
  const text = response.candidates?.[0]?.content?.parts
    .map((part) => part.text)
    .join('')

  if (!text) {
    throw new Error('O Gemini não retornou um diagnóstico. Tente novamente.')
  }

  try {
    return JSON.parse(text) as InsightData
  } catch {
    throw new Error('O Gemini retornou um diagnóstico em formato inválido.')
  }
}

export const getEducatorAnswer = async (prompt: string) => {
  const response = await callGeminiAPI(prompt)
  const text = response.candidates?.[0]?.content?.parts
    .map((part) => part.text)
    .join('')
    .trim()

  if (!text) {
    throw new Error('O educador financeiro não retornou uma resposta.')
  }

  return text
}
