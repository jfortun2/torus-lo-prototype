import { useMemo, useState } from 'react'
import type { ContentItem, Course, DashboardFilter } from '../types/course'
import {
  computeCoverageSummary,
  getObjectiveCoverage,
  getOrphanContent,
  getUnitCoverage,
} from '../lib/coverage'
import { CoverageBar } from './CoverageBar'
import { StatusChip } from './StatusChip'
import { SummaryStats } from './SummaryStats'

interface CoverageDashboardProps {
  course: Course
  onSelectObjective: (loId: string) => void
  onSelectContent: (contentId: string) => void
}

const filterOptions: { value: DashboardFilter; label: string }[] = [
  { value: 'all', label: 'All objectives' },
  { value: 'gaps', label: 'Gaps only' },
  { value: 'weak', label: 'Weak only' },
  { value: 'orphans', label: 'Orphan content' },
]

export function CoverageDashboard({
  course,
  onSelectObjective,
  onSelectContent,
}: CoverageDashboardProps) {
  const [filter, setFilter] = useState<DashboardFilter>('all')

  const summary = useMemo(() => computeCoverageSummary(course), [course])
  const unitCoverage = useMemo(() => getUnitCoverage(course), [course])
  const orphans = useMemo(() => getOrphanContent(course), [course])

  const objectiveRows = useMemo(() => {
    const rows = course.learningObjectives
      .map((lo) => getObjectiveCoverage(lo, course))
      .sort((a, b) => a.objective.order - b.objective.order)

    if (filter === 'gaps') return rows.filter((row) => row.status === 'gap')
    if (filter === 'weak') return rows.filter((row) => row.status === 'weak')
    return rows
  }, [course, filter])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-body-color">Coverage overview</h2>
        <p className="mt-1 text-sm text-gray-500">
          See how well your course content aligns to learning objectives.
        </p>
      </div>

      <SummaryStats summary={summary} />

      <div className="rounded-lg border border-toolbar-border bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Coverage by unit
        </h3>
        <div className="space-y-4">
          {unitCoverage.map((unit) => (
            <CoverageBar
              key={unit.unitId}
              label={unit.unitTitle}
              sublabel={`${unit.coveredCount}/${unit.totalCount} (${unit.percent}%)`}
              percent={unit.percent}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === option.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filter === 'orphans' ? (
        <OrphanContentList orphans={orphans} onSelectContent={onSelectContent} />
      ) : (
        <ObjectiveList rows={objectiveRows} course={course} onSelectObjective={onSelectObjective} />
      )}
    </div>
  )
}

function ObjectiveList({
  rows,
  course,
  onSelectObjective,
}: {
  rows: ReturnType<typeof getObjectiveCoverage>[]
  course: Course
  onSelectObjective: (loId: string) => void
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
        <p className="text-sm text-gray-500">No objectives match this filter.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-toolbar-border bg-white">
      <ul className="divide-y divide-toolbar-border">
        {rows.map((row) => {
          const unit = course.units.find((u) => u.id === row.objective.unitId)
          return (
            <li key={row.objective.id}>
              <button
                type="button"
                onClick={() => onSelectObjective(row.objective.id)}
                className="flex w-full items-start gap-4 px-5 py-4 text-left hover:bg-gray-50"
              >
                <StatusChip status={row.status} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-body-color">{row.objective.text}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {unit?.title} · {row.linkedContentIds.length} linked item
                    {row.linkedContentIds.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function OrphanContentList({
  orphans,
  onSelectContent,
}: {
  orphans: ContentItem[]
  onSelectContent: (contentId: string) => void
}) {
  if (orphans.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
        <p className="text-sm font-medium text-body-color">No orphan content</p>
        <p className="mt-1 text-sm text-gray-500">
          Every content item is linked to at least one objective.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-toolbar-border bg-white">
      <div className="border-b border-toolbar-border bg-orange-50 px-5 py-3">
        <p className="text-sm text-orange-800">
          These content items aren&apos;t aligned to any learning objective.
        </p>
      </div>
      <ul className="divide-y divide-toolbar-border">
        {orphans.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelectContent(item.id)}
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50"
            >
              <div>
                <p className="text-sm font-medium text-body-color">{item.title}</p>
                <p className="mt-0.5 text-xs capitalize text-gray-400">{item.type}</p>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
