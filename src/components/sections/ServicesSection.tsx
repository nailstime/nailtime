'use client'
import { StaggerParent, StaggerChild } from '@/components/ui/Reveal'

type Service = {
  id: string
  name: string
  description: string | null
  duration: number
  price: number | null
}

function handleBook(serviceId: string) {
  window.dispatchEvent(new CustomEvent('select-service', { detail: { id: serviceId } }))
  document.getElementById('book')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function handleMoreServices() {
  window.dispatchEvent(new CustomEvent('open-services-panel'))
  document.getElementById('book')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

export function ServicesSection({ services }: { services: Service[] }) {
  const shown = services.slice(0, 5)
  const hasMore = services.length > 5

  return (
    <StaggerParent className="flex flex-col divide-y divide-sand/20">
      {shown.map(s => (
        <StaggerChild key={s.id}>
          <div className="flex items-start justify-between py-4 gap-4 group hover:px-2 transition-all duration-300">
            <div className="min-w-0">
              <div className="flex items-baseline gap-3 flex-wrap">
                <strong className="text-sm font-semibold text-site-dark group-hover:text-sand transition-colors duration-300">
                  {s.name}
                </strong>
                {s.price !== null && (
                  <span className="text-xs font-semibold text-sand whitespace-nowrap">
                    {s.price.toLocaleString()} บาท
                  </span>
                )}
              </div>
              {s.description && (
                <p className="text-xs text-site-gray mt-0.5">{s.description}</p>
              )}
            </div>
            <button
              onClick={() => handleBook(s.id)}
              className="text-xs font-semibold text-white bg-sand hover:bg-sand-deep active:scale-95 transition-all rounded-full px-3 py-1 whitespace-nowrap shrink-0 mt-0.5"
            >
              จอง →
            </button>
          </div>
        </StaggerChild>
      ))}
      {hasMore && (
        <StaggerChild>
          <div className="flex items-center justify-between py-4 gap-4 group hover:px-2 transition-all duration-300">
            <strong className="text-sm font-semibold text-site-dark group-hover:text-sand transition-colors duration-300">
              บริการอื่นๆ
            </strong>
            <button
              onClick={handleMoreServices}
              className="text-xs font-semibold text-white bg-sand hover:bg-sand-deep active:scale-95 transition-all rounded-full px-3 py-1 whitespace-nowrap shrink-0"
            >
              จองบริการอื่นๆ →
            </button>
          </div>
        </StaggerChild>
      )}
    </StaggerParent>
  )
}
