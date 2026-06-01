import type { CoverageStatus } from '../types/course'

const statusConfig: Record<
  CoverageStatus,
  { label: string; className: string }
> = {
  covered: {
    label: 'Covered',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  gap: {
    label: 'Gap',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  weak: {
    label: 'Weak',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
}

interface StatusChipProps {
  status: CoverageStatus
  size?: 'sm' | 'md'
}

export function StatusChip({ status, size = 'md' }: StatusChipProps) {
  const config = statusConfig[status]
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.className} ${sizeClass}`}
    >
      {config.label}
    </span>
  )
}
