import { useMemo, useState } from 'react'
import type { Course, LearningObjective } from '../types/course'
import { getObjectiveCoverage } from '../lib/coverage'
import { StatusChip } from './StatusChip'

interface ObjectivePickerProps {
  course: Course
  excludeIds?: string[]
  onSelect: (objectiveIds: string[]) => void
  onClose: () => void
  title?: string
}

export function ObjectivePicker({
  course,
  excludeIds = [],
  onSelect,
  onClose,
  title = 'Link objectives',
}: ObjectivePickerProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const availableObjectives = useMemo(() => {
    const exclude = new Set(excludeIds)
    return course.learningObjectives
      .filter((lo) => !exclude.has(lo.id))
      .filter((lo) => lo.text.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.order - b.order)
  }, [course.learningObjectives, excludeIds, search])

  function toggleSelection(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function handleConfirm() {
    onSelect(Array.from(selected))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-xl">
        <div className="border-b border-toolbar-border px-5 py-4">
          <h3 className="text-lg font-semibold text-body-color">{title}</h3>
          <input
            type="search"
            placeholder="Search objectives..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-3 w-full rounded-lg border border-toolbar-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {availableObjectives.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-gray-500">
              No objectives match your search.
            </p>
          ) : (
            <ul className="space-y-1">
              {availableObjectives.map((objective) => (
                <ObjectiveRow
                  key={objective.id}
                  objective={objective}
                  course={course}
                  selected={selected.has(objective.id)}
                  onToggle={() => toggleSelection(objective.id)}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-toolbar-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selected.size === 0}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Link {selected.size > 0 ? `(${selected.size})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

function ObjectiveRow({
  objective,
  course,
  selected,
  onToggle,
}: {
  objective: LearningObjective
  course: Course
  selected: boolean
  onToggle: () => void
}) {
  const coverage = getObjectiveCoverage(objective, course)
  const unit = course.units.find((u) => u.id === objective.unitId)

  return (
    <li>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 hover:bg-gray-50">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-body-color">{objective.text}</p>
          <div className="mt-1 flex items-center gap-2">
            <StatusChip status={coverage.status} size="sm" />
            {unit && <span className="text-xs text-gray-400">{unit.title}</span>}
          </div>
        </div>
      </label>
    </li>
  )
}
