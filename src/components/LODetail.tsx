import { useMemo, useState } from 'react'
import type { AlignmentStrength, Course } from '../types/course'
import {
  bloomLevelLabel,
  contentTypeLabel,
  getLinkedContent,
  getObjectiveCoverage,
  getRevisionPrompts,
  groupContentByType,
} from '../lib/coverage'
import { ContentPicker } from './ContentPicker'
import { StatusChip } from './StatusChip'

interface LODetailProps {
  course: Course
  loId: string
  onAddLinks: (contentIds: string[]) => void
  onRemoveLink: (contentId: string) => void
  onUpdateStrength: (contentId: string, strength: AlignmentStrength) => void
}

export function LODetail({
  course,
  loId,
  onAddLinks,
  onRemoveLink,
  onUpdateStrength,
}: LODetailProps) {
  const [showPicker, setShowPicker] = useState(false)

  const objective = course.learningObjectives.find((lo) => lo.id === loId)
  const coverage = useMemo(() => {
    if (!objective) return null
    return getObjectiveCoverage(objective, course)
  }, [objective, course])

  const linkedContent = useMemo(
    () => (objective ? getLinkedContent(objective.id, course) : []),
    [objective, course],
  )

  const grouped = useMemo(() => groupContentByType(linkedContent), [linkedContent])
  const revisionPrompts = useMemo(
    () => (objective ? getRevisionPrompts(objective.id, course) : []),
    [objective, course],
  )

  if (!objective || !coverage) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
        <p className="text-sm text-gray-500">Objective not found.</p>
      </div>
    )
  }

  const unit = course.units.find((u) => u.id === objective.unitId)
  const existingContentIds = linkedContent.map((item) => item.id)

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusChip status={coverage.status} />
          {objective.bloomLevel && (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
              {bloomLevelLabel(objective.bloomLevel)}
            </span>
          )}
          {unit && <span className="text-sm text-gray-400">{unit.title}</span>}
        </div>
        <h2 className="mt-3 text-xl font-semibold text-body-color">{objective.text}</h2>
        <p className="mt-2 text-sm text-gray-500">
          {coverage.primaryCount} primary · {coverage.supportingCount} supporting links
        </p>
      </div>

      {revisionPrompts.length > 0 && (
        <div className="space-y-2">
          {revisionPrompts.map((prompt) => (
            <div
              key={prompt}
              className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-900"
            >
              {prompt}
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Linked content
          </h3>
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-hover"
          >
            Add link
          </button>
        </div>

        {linkedContent.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
            <p className="text-sm font-medium text-body-color">No content linked yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Link lessons, activities, or assessments that address this objective.
            </p>
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="mt-4 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
            >
              Link content
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {(['lesson', 'activity', 'assessment'] as const).map((type) => {
              const items = grouped[type]
              if (items.length === 0) return null
              return (
                <div key={type}>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {contentTypeLabel(type)}s
                  </h4>
                  <ul className="divide-y divide-toolbar-border overflow-hidden rounded-lg border border-toolbar-border bg-white">
                    {items.map((item) => {
                      const alignment = course.alignments.find(
                        (a) => a.loId === loId && a.contentId === item.id,
                      )
                      return (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-4 px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-body-color">{item.title}</p>
                            <select
                              value={alignment?.strength ?? 'primary'}
                              onChange={(e) =>
                                onUpdateStrength(item.id, e.target.value as AlignmentStrength)
                              }
                              className="mt-1 rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-600"
                            >
                              <option value="primary">Primary</option>
                              <option value="supporting">Supporting</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveLink(item.id)}
                            className="text-sm text-gray-400 hover:text-red-500"
                          >
                            Remove
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showPicker && (
        <ContentPicker
          course={course}
          excludeIds={existingContentIds}
          onSelect={onAddLinks}
          onClose={() => setShowPicker(false)}
          title="Link content to objective"
        />
      )}
    </div>
  )
}
