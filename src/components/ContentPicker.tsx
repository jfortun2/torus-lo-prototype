import { useMemo, useState } from 'react'
import type { ContentItem, Course } from '../types/course'
import { contentTypeLabel } from '../lib/coverage'

interface ContentPickerProps {
  course: Course
  excludeIds?: string[]
  onSelect: (contentIds: string[]) => void
  onClose: () => void
  title?: string
}

export function ContentPicker({
  course,
  excludeIds = [],
  onSelect,
  onClose,
  title = 'Link content',
}: ContentPickerProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const availableContent = useMemo(() => {
    const exclude = new Set(excludeIds)
    return course.contentItems
      .filter((item) => !exclude.has(item.id))
      .filter((item) => item.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.order - b.order)
  }, [course.contentItems, excludeIds, search])

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
            placeholder="Search content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-3 w-full rounded-lg border border-toolbar-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {availableContent.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-gray-500">
              No content matches your search.
            </p>
          ) : (
            <ul className="space-y-1">
              {availableContent.map((item) => (
                <ContentRow
                  key={item.id}
                  item={item}
                  course={course}
                  selected={selected.has(item.id)}
                  onToggle={() => toggleSelection(item.id)}
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

function ContentRow({
  item,
  course,
  selected,
  onToggle,
}: {
  item: ContentItem
  course: Course
  selected: boolean
  onToggle: () => void
}) {
  const unit = course.units.find((u) => u.id === item.unitId)

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
          <p className="text-sm text-body-color">{item.title}</p>
          <p className="mt-0.5 text-xs text-gray-400">
            {contentTypeLabel(item.type)}
            {unit ? ` · ${unit.title}` : ''}
          </p>
        </div>
      </label>
    </li>
  )
}
