import {
  type SimulationFormData,
  type SimulationRecord,
} from '@/data/simulation'

const LOCAL_STORAGE_KEY = 'simulation-data'

const getSavedSimulations = (): SimulationRecord[] => {
  const storage = localStorage.getItem(LOCAL_STORAGE_KEY)

  if (!storage) return []

  try {
    const data = JSON.parse(storage) as unknown
    return Array.isArray(data) ? (data as SimulationRecord[]) : []
  } catch {
    return []
  }
}

export const useSimulationStorage = () => {
  const saveFormData = (formData: SimulationFormData) => {
    const id = crypto.randomUUID()
    const record: SimulationRecord = {
      ...formData,
      id,
      createdAt: new Date().toISOString(),
    }
    const savedData = getSavedSimulations()

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify([...savedData, record]),
    )

    return id
  }

  const getFormData = (id: string) => {
    const savedData = getSavedSimulations()
    return savedData.find((record) => record.id === id) || null
  }

  const updateSimulation = (id: string, data: SimulationRecord) => {
    const savedData = getSavedSimulations()

    const updated = savedData.map((record) =>
      record.id === id ? { ...data } : record,
    )

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
  }

  const getSimulations = () =>
    getSavedSimulations().sort((first, second) => {
      const firstDate = first.createdAt ? Date.parse(first.createdAt) : 0
      const secondDate = second.createdAt ? Date.parse(second.createdAt) : 0
      return secondDate - firstDate
    })

  const deleteSimulation = (id: string) => {
    const updated = getSavedSimulations().filter((record) => record.id !== id)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
  }

  return {
    saveFormData,
    getFormData,
    updateSimulation,
    getSimulations,
    deleteSimulation,
  }
}
