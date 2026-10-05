import { cn } from '@/lib/utils'

interface FabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string
  label?: string
}

export function Fab({ icon = 'add', label, className, type = 'button', ...props }: FabProps) {
  return (
    <button
      type={type}
      className={cn('app-fab', label && 'app-fab--extended', className)}
      aria-label={label || 'Acción principal'}
      {...props}
    >
      <span className="app-fab__icon material-symbols-outlined">{icon}</span>
      {label && <span className="app-fab__label">{label}</span>}
    </button>
  )
}
