import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glass' | 'gradient' | 'elevated'
  glow?: boolean
}

export function Card({ className, variant = 'default', glow, children, ...props }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'rounded-2xl overflow-hidden',
        variant === 'default' && 'bg-white border border-slate-100/90 shadow-card',
        variant === 'glass' && 'card-glass',
        variant === 'gradient' && 'gradient-brand text-white shadow-brand',
        variant === 'elevated' && 'bg-white border border-slate-100 shadow-elevated',
        glow && 'ring-1 ring-brand-blue/10',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('px-5 pt-5 pb-3', className)}>{children}</div>
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('px-5 pb-5', className)}>{children}</div>
}
