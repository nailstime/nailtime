import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'text'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium tracking-widest uppercase transition-all duration-200 cursor-pointer',
        {
          'bg-sand text-white hover:bg-sand-dark hover:-translate-y-0.5 hover:shadow-lg': variant === 'primary',
          'bg-transparent text-site-dark border border-site-dark hover:bg-site-dark hover:text-white': variant === 'outline',
          'bg-transparent text-white border border-white/60 hover:bg-white/15': variant === 'ghost',
          'bg-transparent text-sand p-0 tracking-widest': variant === 'text',
        },
        {
          'text-xs px-5 py-2': size === 'sm',
          'text-xs px-8 py-3.5': size === 'md',
          'text-sm px-10 py-4': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
