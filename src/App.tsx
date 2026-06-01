import { useCallback, useState } from 'react'
import type { Alignment, AlignmentStrength, Course } from './types/course'
import { mockCourse } from './data/mockCourse'
import { AppShell, type MainView, type SidebarTab } from './components/AppShell'
import { CoverageDashboard } from './components/CoverageDashboard'
import { LODetail } from './components/LODetail'
import { ContentDetail } from './components/ContentDetail'

function createInitialCourse(): Course {
  return {
    ...mockCourse,
    alignments: mockCourse.alignments.map((a) => ({ ...a })),
  }
}

export default function App() {
  const [course, setCourse] = useState<Course>(createInitialCourse)
  const [mainView, setMainView] = useState<MainView>('dashboard')
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('outline')
  const [selectedLoId, setSelectedLoId] = useState<string | null>(null)
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null)

  const updateAlignments = useCallback(
    (updater: (alignments: Alignment[]) => Alignment[]) => {
      setCourse((prev) => ({
        ...prev,
        alignments: updater(prev.alignments),
      }))
    },
    [],
  )

  const handleSelectObjective = useCallback((loId: string) => {
    setSelectedLoId(loId)
    setMainView('lo-detail')
    setSidebarTab('objectives')
  }, [])

  const handleSelectContent = useCallback((contentId: string) => {
    setSelectedContentId(contentId)
    setMainView('content-detail')
    setSidebarTab('outline')
  }, [])

  const handleAddLoContentLinks = useCallback(
    (contentIds: string[]) => {
      if (!selectedLoId) return
      updateAlignments((alignments) => [
        ...alignments,
        ...contentIds.map((contentId) => ({
          loId: selectedLoId,
          contentId,
          strength: 'primary' as AlignmentStrength,
        })),
      ])
    },
    [selectedLoId, updateAlignments],
  )

  const handleRemoveLoContentLink = useCallback(
    (contentId: string) => {
      if (!selectedLoId) return
      updateAlignments((alignments) =>
        alignments.filter((a) => !(a.loId === selectedLoId && a.contentId === contentId)),
      )
    },
    [selectedLoId, updateAlignments],
  )

  const handleUpdateLinkStrength = useCallback(
    (contentId: string, strength: AlignmentStrength) => {
      if (!selectedLoId) return
      updateAlignments((alignments) =>
        alignments.map((a) =>
          a.loId === selectedLoId && a.contentId === contentId ? { ...a, strength } : a,
        ),
      )
    },
    [selectedLoId, updateAlignments],
  )

  const handleAddContentLoLinks = useCallback(
    (loIds: string[]) => {
      if (!selectedContentId) return
      updateAlignments((alignments) => [
        ...alignments,
        ...loIds.map((loId) => ({
          loId,
          contentId: selectedContentId,
          strength: 'primary' as AlignmentStrength,
        })),
      ])
    },
    [selectedContentId, updateAlignments],
  )

  const handleRemoveContentLoLink = useCallback(
    (loId: string) => {
      if (!selectedContentId) return
      updateAlignments((alignments) =>
        alignments.filter((a) => !(a.loId === loId && a.contentId === selectedContentId)),
      )
    },
    [selectedContentId, updateAlignments],
  )

  const handleViewChange = useCallback(
    (view: MainView) => {
      setMainView(view)
      if (view === 'dashboard') {
        setSelectedLoId(null)
        setSelectedContentId(null)
      }
    },
    [],
  )

  return (
    <AppShell
      course={course}
      mainView={mainView}
      sidebarTab={sidebarTab}
      selectedLoId={selectedLoId}
      selectedContentId={selectedContentId}
      onSidebarTabChange={setSidebarTab}
      onViewChange={handleViewChange}
      onSelectObjective={handleSelectObjective}
      onSelectContent={handleSelectContent}
    >
      {mainView === 'dashboard' && (
        <CoverageDashboard
          course={course}
          onSelectObjective={handleSelectObjective}
          onSelectContent={handleSelectContent}
        />
      )}

      {mainView === 'lo-detail' && selectedLoId && (
        <LODetail
          course={course}
          loId={selectedLoId}
          onAddLinks={handleAddLoContentLinks}
          onRemoveLink={handleRemoveLoContentLink}
          onUpdateStrength={handleUpdateLinkStrength}
        />
      )}

      {mainView === 'content-detail' && selectedContentId && (
        <ContentDetail
          course={course}
          contentId={selectedContentId}
          onAddLinks={handleAddContentLoLinks}
          onRemoveLink={handleRemoveContentLoLink}
          onSelectObjective={handleSelectObjective}
        />
      )}
    </AppShell>
  )
}
