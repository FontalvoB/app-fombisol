import { cn } from '@/lib/utils'

interface FilterChipProps {
  label: string
  active?: boolean
  onClick?: () => void
  count?: number
}

export function FilterChip({ label, active, onClick, count }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'chip flex-shrink-0',
        active && 'chip-active',
      )}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className={cn(
          'ml-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold inline-flex items-center justify-center',
          active ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600',
        )}>
          {count}
        </span>
      )}
    </button>
  )
}
