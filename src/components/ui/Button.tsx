import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'amber' | 'success' | 'danger' | 'ghost' | 'outline-light'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  iconRight?: string
  fullWidth?: boolean
  pill?: boolean
  showArrow?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth,
  pill = true,
  showArrow,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const useArrow = showArrow ?? Boolean(fullWidth && !iconRight)

  return (
    <button
      type={type}
      className={cn(
        'app-btn',
        `app-btn--${variant}`,
        `app-btn--${size}`,
        pill ? 'app-btn--pill' : 'app-btn--rounded',
        fullWidth && 'app-btn--full',
        useArrow && 'app-btn--cta',
        className,
      )}
      disabled={disabled}
      {...props}
    >
      <span className="app-btn__inner">
        {icon && (
          <span className={cn('app-btn__icon material-symbols-outlined', `app-btn__icon--${size}`)}>
            {icon}
          </span>
        )}
        <span className="app-btn__label">{children}</span>
      </span>

      {useArrow ? (
        <span className={cn('app-btn__arrow', `app-btn__arrow--${variant}`)}>
          <span className="material-symbols-outlined app-btn__arrow-icon">arrow_forward</span>
        </span>
      ) : iconRight ? (
        <span className={cn('app-btn__icon material-symbols-outlined', `app-btn__icon--${size}`)}>
          {iconRight}
        </span>
      ) : null}
    </button>
  )
}
