import { StepProgress } from "./Progress"

export const SimulationForm = () => {
  return (
    <>
      <StepProgress currentStep={1} totalSteps={6} />
    </>
  )
}