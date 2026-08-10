import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'amber' | 'success' | 'danger' | 'ghost' | 'outline-light'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  iconRight?: string
  fullWidth?: boolean
  pill?: boolean
}

const base =
  'relative inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 ease-out disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 active:scale-[0.97] overflow-hidden'

const variants = {
  primary: [
    'text-white',
    'bg-gradient-to-br from-[#0569a8] via-[#045C94] to-[#213053]',
    'shadow-[0_4px_14px_rgba(4,92,148,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]',
    'hover:shadow-[0_8px_22px_rgba(4,92,148,0.42)] hover:-translate-y-px',
  ].join(' '),
  secondary: [
    'bg-white text-brand-dark',
    'border border-slate-200/90',
    'shadow-[0_2px_8px_rgba(33,48,83,0.06)]',
    'hover:border-brand-blue/25 hover:bg-slate-50/90 hover:-translate-y-px',
  ].join(' '),
  amber: [
    'text-[#3d2e00]',
    'bg-gradient-to-br from-[#ffd057] via-[#FFB71B] to-[#f5a623]',
    'shadow-[0_4px_14px_rgba(255,183,27,0.4),inset_0_1px_0_rgba(255,255,255,0.35)]',
    'hover:shadow-[0_8px_20px_rgba(255,183,27,0.48)] hover:-translate-y-px',
  ].join(' '),
  success: [
    'text-white',
    'bg-gradient-to-br from-emerald-500 to-emerald-600',
    'shadow-[0_4px_14px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]',
    'hover:shadow-[0_8px_20px_rgba(16,185,129,0.42)] hover:-translate-y-px',
  ].join(' '),
  danger: [
    'bg-red-50/90 text-red-600',
    'border border-red-100',
    'hover:bg-red-100/80',
  ].join(' '),
  ghost: 'bg-transparent text-brand-blue hover:bg-brand-blue/[0.06]',
  'outline-light': [
    'text-white/90 bg-white/10 backdrop-blur-sm',
    'border border-white/25',
    'hover:bg-white/18 hover:border-white/40',
  ].join(' '),
}

const sizes = {
  sm: 'px-3.5 py-2 text-[11px] tracking-wide',
  md: 'px-5 py-2.5 text-[13px]',
  lg: 'px-6 py-3.5 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth,
  pill = true,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        base,
        variants[variant],
        sizes[size],
        pill ? 'rounded-full' : 'rounded-2xl',
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {icon && (
        <span className={cn(
          'material-symbols-outlined',
          size === 'sm' ? 'text-[16px]' : 'text-[18px]',
          variant === 'primary' || variant === 'success' ? 'opacity-95' : '',
        )}>
          {icon}
        </span>
      )}
      <span className="relative z-10">{children}</span>
      {iconRight && (
        <span className="material-symbols-outlined text-[18px] relative z-10">{iconRight}</span>
      )}
    </button>
  )
}
