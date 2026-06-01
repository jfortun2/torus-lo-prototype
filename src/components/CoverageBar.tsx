interface CoverageBarProps {
  percent: number
  label?: string
  sublabel?: string
}

export function CoverageBar({ percent, label, sublabel }: CoverageBarProps) {
  const clampedPercent = Math.min(100, Math.max(0, percent))

  return (
    <div className="space-y-1">
      {(label || sublabel) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium text-body-color">{label}</span>}
          {sublabel && <span className="text-gray-500">{sublabel}</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
    </div>
  )
}
