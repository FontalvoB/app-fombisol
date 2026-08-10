import { cn } from '@/lib/utils'

interface FabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string
  label?: string
}

export function Fab({ icon = 'add', label, className, ...props }: FabProps) {
  return (
    <button
      className={cn('fab', label && 'fab-extended', className)}
      aria-label={label || 'Acción principal'}
      {...props}
    >
      <span className="fab-icon material-symbols-outlined">{icon}</span>
      {label && <span className="fab-label">{label}</span>}
    </button>
  )
}
