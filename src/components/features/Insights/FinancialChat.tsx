import { Bot, Send, UserRound } from 'lucide-react'
import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react'

import type { ConversationMessage, SimulationRecord } from '@/data/simulation'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'
import { getEducatorAnswer } from '@/services/aiService'

interface FinancialChatProps {
  simulationId: string
}

const buildChatPrompt = (
  simulation: SimulationRecord,
  conversation: ConversationMessage[],
  question: string,
) => {
  const history = conversation
    .slice(-12)
    .map(
      (message) =>
        `${message.role === 'user' ? 'Usuário' : 'Educador'}: ${message.content}`,
    )
    .join('\n')

  return `Você é um educador financeiro brasileiro. Responda à pergunta do usuário sobre a simulação abaixo com clareza, objetividade e empatia. Use português do Brasil, valores em reais quando relevante e no máximo 3 parágrafos curtos ou uma lista breve. Não use markdown, não invente dados e deixe claro quando algo depender de mais informações. Sua resposta é educacional, não uma recomendação financeira individualizada.

Dados da simulação:
- Renda mensal: ${simulation.income}
- Custos fixos: ${simulation.expenses}
- Dívidas: ${simulation.debts}
- Meta: ${simulation.goalName}
- Valor da meta: ${simulation.goalAmount}
- Prazo: ${simulation.goalDeadline} meses

Histórico da conversa:
${history || 'Ainda não há mensagens.'}

Pergunta atual: ${question}`
}

export function FinancialChat({ simulationId }: FinancialChatProps) {
  const { getFormData, updateSimulation } = useSimulationStorage()
  const [messages, setMessages] = useState<ConversationMessage[]>(() => {
    return getFormData(simulationId)?.conversation ?? []
  })
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endOfChatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isLoading, error])

  const askQuestion = async () => {
    const trimmedQuestion = question.trim()
    const simulation = getFormData(simulationId)

    if (!trimmedQuestion || !simulation || isLoading) return

    const userMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmedQuestion,
      createdAt: new Date().toISOString(),
    }
    const conversationWithQuestion = [...messages, userMessage]

    setMessages(conversationWithQuestion)
    setQuestion('')
    setError(null)
    setIsLoading(true)
    updateSimulation(simulationId, {
      ...simulation,
      conversation: conversationWithQuestion,
    })

    try {
      const answer = await getEducatorAnswer(
        buildChatPrompt(simulation, messages, trimmedQuestion),
      )
      const assistantMessage: ConversationMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: answer,
        createdAt: new Date().toISOString(),
      }
      const updatedConversation = [
        ...conversationWithQuestion,
        assistantMessage,
      ]

      setMessages(updatedConversation)
      updateSimulation(simulationId, {
        ...simulation,
        conversation: updatedConversation,
      })
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Não foi possível responder agora. Tente novamente.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void askQuestion()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void askQuestion()
    }
  }

  return (
    <section className="border-border mt-7 border-t pt-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="bg-muted-primary text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
          <Bot size={18} />
        </div>
        <div>
          <h2 className="font-semibold">
            Converse com seu educador financeiro
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Tire dúvidas sobre esta simulação sempre que precisar.
          </p>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="bg-background mb-4 max-h-96 space-y-3 overflow-y-auto rounded-xl p-3 sm:p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === 'user'
                  ? 'flex justify-end'
                  : 'flex justify-start'
              }
            >
              <div
                className={
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground max-w-[88%] rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed'
                    : 'bg-secondary-button text-foreground max-w-[88%] rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed'
                }
              >
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold opacity-75">
                  {message.role === 'user' ? (
                    <UserRound size={13} />
                  ) : (
                    <Bot size={13} />
                  )}
                  {message.role === 'user' ? 'Você' : 'Educador financeiro'}
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary-button rounded-2xl rounded-bl-md px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <Bot size={15} className="text-primary" />
                  <span className="text-muted-foreground">
                    Preparando uma resposta…
                  </span>
                </div>
              </div>
            </div>
          )}
          {error && <p className="px-1 text-sm text-red-500">⚠️ {error}</p>}
          <div ref={endOfChatRef} />
        </div>
      )}

      {messages.length === 0 && error && (
        <p className="mb-3 text-sm text-red-500">⚠️ {error}</p>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <label className="sr-only" htmlFor={`question-${simulationId}`}>
          Pergunte ao educador financeiro
        </label>
        <textarea
          id={`question-${simulationId}`}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={2}
          maxLength={500}
          placeholder="Ex.: Como posso reduzir o prazo da minha meta?"
          className="bg-input border-border placeholder:text-muted-foreground focus:border-primary min-h-12 flex-1 resize-none rounded-xl border px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!question.trim() || isLoading}
          className="bg-primary text-primary-foreground flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Enviar pergunta"
        >
          <Send size={19} />
        </button>
      </form>
      <p className="text-muted-foreground mt-2 text-xs">
        Pressione Enter para enviar e Shift + Enter para quebrar linha.
      </p>
    </section>
  )
}
