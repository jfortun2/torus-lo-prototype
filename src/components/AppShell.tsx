import type { ReactNode } from 'react'
import type { Course } from '../types/course'
import { getObjectiveCoverage } from '../lib/coverage'
import { StatusChip } from './StatusChip'

export type MainView = 'dashboard' | 'lo-detail' | 'content-detail'
export type SidebarTab = 'outline' | 'objectives'

interface AppShellProps {
  course: Course
  mainView: MainView
  sidebarTab: SidebarTab
  selectedLoId: string | null
  selectedContentId: string | null
  onSidebarTabChange: (tab: SidebarTab) => void
  onViewChange: (view: MainView) => void
  onSelectObjective: (loId: string) => void
  onSelectContent: (contentId: string) => void
  children: ReactNode
}

export function AppShell({
  course,
  mainView,
  sidebarTab,
  selectedLoId,
  selectedContentId,
  onSidebarTabChange,
  onViewChange,
  onSelectObjective,
  onSelectContent,
  children,
}: AppShellProps) {
  const sortedUnits = course.units.slice().sort((a, b) => a.order - b.order)
  const sortedObjectives = course.learningObjectives
    .slice()
    .sort((a, b) => a.order - b.order)

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-toolbar-border bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Course author
            </p>
            <h1 className="text-lg font-semibold text-body-color">{course.title}</h1>
          </div>
          <div className="flex rounded-lg border border-toolbar-border bg-gray-50 p-1">
            <ViewTab
              active={mainView === 'dashboard'}
              onClick={() => onViewChange('dashboard')}
              label="Coverage"
            />
            <ViewTab
              active={mainView !== 'dashboard'}
              onClick={() => {
                if (selectedContentId) {
                  onViewChange('content-detail')
                } else if (selectedLoId) {
                  onViewChange('lo-detail')
                } else {
                  onSidebarTabChange('outline')
                }
              }}
              label="Outline"
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-72 shrink-0 flex-col border-r border-toolbar-border bg-workspace-sidebar-bg">
          <div className="flex border-b border-toolbar-border">
            <SidebarTabButton
              active={sidebarTab === 'outline'}
              onClick={() => onSidebarTabChange('outline')}
              label="Outline"
            />
            <SidebarTabButton
              active={sidebarTab === 'objectives'}
              onClick={() => onSidebarTabChange('objectives')}
              label="Objectives"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {sidebarTab === 'outline' ? (
              <div className="space-y-4">
                {sortedUnits.map((unit) => {
                  const unitContent = course.contentItems
                    .filter((item) => item.unitId === unit.id)
                    .sort((a, b) => a.order - b.order)

                  return (
                    <div key={unit.id}>
                      <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {unit.title}
                      </p>
                      <ul className="space-y-0.5">
                        {unitContent.map((item) => (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => onSelectContent(item.id)}
                              className={`w-full rounded-lg px-2 py-2 text-left text-sm ${
                                selectedContentId === item.id && mainView === 'content-detail'
                                  ? 'bg-primary/10 font-medium text-primary'
                                  : 'text-body-color hover:bg-white/60'
                              }`}
                            >
                              <span className="capitalize text-xs text-gray-400">
                                {item.type}
                              </span>
                              <p className="truncate">{item.title}</p>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            ) : (
              <ul className="space-y-0.5">
                {sortedObjectives.map((objective) => {
                  const coverage = getObjectiveCoverage(objective, course)
                  return (
                    <li key={objective.id}>
                      <button
                        type="button"
                        onClick={() => onSelectObjective(objective.id)}
                        className={`w-full rounded-lg px-2 py-2 text-left ${
                          selectedLoId === objective.id && mainView === 'lo-detail'
                            ? 'bg-primary/10'
                            : 'hover:bg-white/60'
                        }`}
                      >
                        <StatusChip status={coverage.status} size="sm" />
                        <p className="mt-1 line-clamp-2 text-sm text-body-color">
                          {objective.text}
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

function ViewTab({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
        active ? 'bg-white text-body-color shadow-sm' : 'text-gray-500 hover:text-body-color'
      }`}
    >
      {label}
    </button>
  )
}

function SidebarTabButton({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2.5 text-sm font-medium ${
        active
          ? 'border-b-2 border-primary text-primary'
          : 'text-gray-500 hover:text-body-color'
      }`}
    >
      {label}
    </button>
  )
}
