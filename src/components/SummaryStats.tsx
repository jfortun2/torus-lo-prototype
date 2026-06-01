import type { CoverageSummary } from '../types/course'

interface SummaryStatsProps {
  summary: CoverageSummary
}

export function SummaryStats({ summary }: SummaryStatsProps) {
  const stats = [
    {
      label: 'Objectives covered',
      value: `${summary.coveredCount} of ${summary.totalObjectives}`,
      highlight: summary.gapCount === 0,
    },
    {
      label: 'Gaps',
      value: summary.gapCount.toString(),
      highlight: false,
      alert: summary.gapCount > 0,
    },
    {
      label: 'Weak coverage',
      value: summary.weakCount.toString(),
      highlight: false,
      alert: summary.weakCount > 0,
    },
    {
      label: 'Orphan content',
      value: summary.orphanCount.toString(),
      highlight: false,
      alert: summary.orphanCount > 0,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-toolbar-border bg-white p-4"
        >
          <p className="text-sm text-gray-500">{stat.label}</p>
          <p
            className={`mt-1 text-2xl font-semibold ${
              stat.alert ? 'text-orange-600' : stat.highlight ? 'text-green-600' : 'text-body-color'
            }`}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  )
}
