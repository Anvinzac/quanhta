type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  /** Keep the label for screen readers only. */
  hideLabel?: boolean
}

export function Switch({ checked, onChange, label, hideLabel = false }: SwitchProps) {
  return <button type="button" role="switch" aria-checked={checked} className={`switch${checked ? ' on' : ''}`} onClick={() => onChange(!checked)}>
    <span className="switch-track" aria-hidden="true"><span className="switch-thumb" /></span>
    <span className={hideLabel ? 'visually-hidden' : 'switch-label'}>{label}</span>
  </button>
}
