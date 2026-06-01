import { useMemo, useState } from 'react'
import type { Course } from '../types/course'
import {
  contentTypeLabel,
  getLinkedObjectives,
  getObjectiveCoverage,
} from '../lib/coverage'
import { ObjectivePicker } from './ObjectivePicker'
import { StatusChip } from './StatusChip'

interface ContentDetailProps {
  course: Course
  contentId: string
  onAddLinks: (loIds: string[]) => void
  onRemoveLink: (loId: string) => void
  onSelectObjective: (loId: string) => void
}

export function ContentDetail({
  course,
  contentId,
  onAddLinks,
  onRemoveLink,
  onSelectObjective,
}: ContentDetailProps) {
  const [showPicker, setShowPicker] = useState(false)

  const content = course.contentItems.find((item) => item.id === contentId)
  const linkedObjectives = useMemo(
    () => (content ? getLinkedObjectives(content.id, course) : []),
    [content, course],
  )

  if (!content) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
        <p className="text-sm text-gray-500">Content not found.</p>
      </div>
    )
  }

  const unit = course.units.find((u) => u.id === content.unitId)
  const existingLoIds = linkedObjectives.map((lo) => lo.id)
  const isOrphan = linkedObjectives.length === 0

  return (
    <div className="space-y-6 rounded-xl bg-lesson-page p-6">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
          {unit && <span>{unit.title}</span>}
          <span>·</span>
          <span className="capitalize">{contentTypeLabel(content.type)}</span>
        </div>
        <h2 className="mt-2 text-xl font-semibold text-body-color">{content.title}</h2>
      </div>

      {isOrphan && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
          This content isn&apos;t aligned to any learning objective. Link objectives so
          learners and authors understand its purpose in the course.
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Linked objectives
          </h3>
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-hover"
          >
            Link objectives
          </button>
        </div>

        {linkedObjectives.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white/60 px-6 py-10 text-center">
            <p className="text-sm font-medium text-body-color">No objectives linked</p>
            <p className="mt-1 text-sm text-gray-500">
              Select the learning objectives this content helps learners achieve.
            </p>
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="mt-4 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
            >
              Link objectives
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-toolbar-border overflow-hidden rounded-lg border border-toolbar-border bg-white">
            {linkedObjectives.map((objective) => {
              const coverage = getObjectiveCoverage(objective, course)
              return (
                <li
                  key={objective.id}
                  className="flex items-start justify-between gap-4 px-4 py-3"
                >
                  <button
                    type="button"
                    onClick={() => onSelectObjective(objective.id)}
                    className="min-w-0 flex-1 text-left hover:opacity-80"
                  >
                    <p className="text-sm font-medium text-body-color">{objective.text}</p>
                    <div className="mt-1">
                      <StatusChip status={coverage.status} size="sm" />
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveLink(objective.id)}
                    className="shrink-0 text-sm text-gray-400 hover:text-red-500"
                  >
                    Remove
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {showPicker && (
        <ObjectivePicker
          course={course}
          excludeIds={existingLoIds}
          onSelect={onAddLinks}
          onClose={() => setShowPicker(false)}
          title="Link objectives to content"
        />
      )}
    </div>
  )
}
