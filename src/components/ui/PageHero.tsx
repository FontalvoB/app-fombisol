import { cn } from '@/lib/utils'

interface Stat {
  value: string | number
  label: string
}

interface PageHeroProps {
  eyebrow: string
  title: string
  subtitle?: string
  stats?: Stat[]
  action?: React.ReactNode
  className?: string
}

export function PageHero({ eyebrow, title, subtitle, stats, action, className }: PageHeroProps) {
  return (
    <div className={cn('page-hero', className)}>
      <div className="page-hero-glow" />
      <div className="page-hero-content">
        <div className="page-hero-top">
          <div className="min-w-0 flex-1">
            <p className="page-hero-eyebrow">{eyebrow}</p>
            <p className="page-hero-title">{title}</p>
            {subtitle && <p className="page-hero-subtitle">{subtitle}</p>}
          </div>
        </div>

        {stats && stats.length > 0 && (
          <div className="page-hero-stats">
            {stats.map(stat => (
              <div key={stat.label} className="page-hero-stat">
                <span className="page-hero-stat-value">{stat.value}</span>
                <span className="page-hero-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        )}

        {action && <div className="page-hero-action">{action}</div>}
      </div>
    </div>
  )
}
