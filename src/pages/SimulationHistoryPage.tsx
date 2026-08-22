import { CalendarDays, Eye, Goal, PiggyBank, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { SimulationRecord } from '@/data/simulation'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'
import { calcMonthlySavings } from '@/utils/simulation'

const formatMoney = (value: string) =>
  value.startsWith('R$') ? value : `R$ ${value}`

const formatDate = (date?: string) => {
  if (!date || Number.isNaN(Date.parse(date))) {
    return 'Simulação salva anteriormente'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

interface SimulationSummaryProps {
  simulation: SimulationRecord
  onDelete: (id: string) => void
}

function SimulationSummary({ simulation, onDelete }: SimulationSummaryProps) {
  const navigate = useNavigate()
  const monthlySavings = calcMonthlySavings(simulation)

  return (
    <article className="bg-card border-border rounded-2xl border p-5 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.12)] sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="text-primary mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
            <CalendarDays size={15} />
            {formatDate(simulation.createdAt)}
          </div>
          <h2 className="truncate text-xl font-bold sm:text-2xl">
            {simulation.goalName}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Planejamento para alcançar sua meta financeira.
          </p>
        </div>
        <span
          className={
            simulation.insight
              ? 'bg-muted-primary text-primary w-fit rounded-full px-3 py-1 text-xs font-semibold'
              : 'bg-secondary-button text-muted-foreground w-fit rounded-full px-3 py-1 text-xs font-semibold'
          }
        >
          {simulation.insight ? 'Insights gerados' : 'Aguardando insights'}
        </span>
      </div>

      <div className="border-border my-5 grid grid-cols-1 gap-3 border-y py-5 sm:grid-cols-3">
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Meta
          </p>
          <p className="mt-1 font-semibold">
            {formatMoney(simulation.goalAmount)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Prazo
          </p>
          <p className="mt-1 font-semibold">{simulation.goalDeadline} meses</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Disponível por mês
          </p>
          <p className="mt-1 font-semibold">
            {monthlySavings.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => onDelete(simulation.id)}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10"
          aria-label={`Excluir simulação ${simulation.goalName}`}
        >
          <Trash2 size={18} />
          Excluir
        </button>
        <button
          type="button"
          onClick={() => void navigate(`/resultado/${simulation.id}`)}
          className="bg-primary text-primary-foreground flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-85"
        >
          <Eye size={18} />
          Ver detalhes
        </button>
      </div>
    </article>
  )
}

export function SimulationHistoryPage() {
  const navigate = useNavigate()
  const { getSimulations, deleteSimulation } = useSimulationStorage()
  const [simulations, setSimulations] = useState(() => getSimulations())

  const handleDelete = (id: string) => {
    deleteSimulation(id)
    setSimulations((current) =>
      current.filter((simulation) => simulation.id !== id),
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <div className="mb-8 text-center sm:mb-10">
        <div className="text-primary mb-3 flex items-center justify-center gap-2 text-xs font-semibold tracking-widest uppercase">
          <PiggyBank size={16} />
          Seu planejamento
        </div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          Histórico de simulações
        </h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-xl">
          Revise seus objetivos, acompanhe os insights gerados e retome qualquer
          planejamento quando quiser.
        </p>
      </div>

      {simulations.length > 0 ? (
        <div className="space-y-4">
          {simulations.map((simulation) => (
            <SimulationSummary
              key={simulation.id}
              simulation={simulation}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <section className="bg-card border-border rounded-2xl border border-dashed px-6 py-14 text-center">
          <div className="bg-muted-primary text-primary mx-auto flex h-12 w-12 items-center justify-center rounded-full">
            <Goal size={24} />
          </div>
          <h2 className="mt-5 text-xl font-bold">Nenhuma simulação salva</h2>
          <p className="text-muted-foreground mt-2">
            Crie sua primeira simulação para vê-la por aqui.
          </p>
          <button
            type="button"
            onClick={() => void navigate('/')}
            className="bg-primary text-primary-foreground mt-6 cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-85"
          >
            Criar simulação
          </button>
        </section>
      )}
    </main>
  )
}
