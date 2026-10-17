import { Minus, Plus } from 'lucide-react'

type QtyStepperProps = {
  value: number
  onChange: (value: number) => void
  min?: number
  label: string
  compact?: boolean
}

export function QtyStepper({ value, onChange, min = 0, label, compact = false }: QtyStepperProps) {
  return <div className={`qty-stepper${compact ? ' compact' : ''}`} role="group" aria-label={label}>
    <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Decrease quantity"><Minus size={16} /></button>
    <output aria-live="polite">{value}</output>
    <button onClick={() => onChange(value + 1)} aria-label="Increase quantity"><Plus size={16} /></button>
  </div>
}
