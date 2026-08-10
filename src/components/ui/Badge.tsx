import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'mandatory' | 'unread'
  className?: string
}

const variants = {
  default: 'bg-slate-100 text-slate-600',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  danger: 'bg-red-50 text-red-600 border border-red-200/60',
  info: 'bg-brand-blue/10 text-brand-blue border border-brand-blue/15',
  mandatory: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 border border-amber-200/70',
  unread: 'bg-red-50 text-red-600 border border-red-200/60',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide',
      variants[variant],
      className,
    )}>
      {children}
    </span>
  )
}
