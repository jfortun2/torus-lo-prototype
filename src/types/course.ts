export type ContentType = 'lesson' | 'activity' | 'assessment'

export type AlignmentStrength = 'primary' | 'supporting'

export type BloomLevel =
  | 'remember'
  | 'understand'
  | 'apply'
  | 'analyze'
  | 'evaluate'
  | 'create'

export type CoverageStatus = 'covered' | 'gap' | 'weak'

export interface Unit {
  id: string
  title: string
  order: number
}

export interface LearningObjective {
  id: string
  text: string
  bloomLevel?: BloomLevel
  unitId: string
  order: number
}

export interface ContentItem {
  id: string
  title: string
  type: ContentType
  unitId: string
  order: number
}

export interface Alignment {
  loId: string
  contentId: string
  strength?: AlignmentStrength
}

export interface Course {
  title: string
  units: Unit[]
  learningObjectives: LearningObjective[]
  contentItems: ContentItem[]
  alignments: Alignment[]
}

export interface CoverageSummary {
  totalObjectives: number
  coveredCount: number
  gapCount: number
  weakCount: number
  orphanCount: number
}

export interface UnitCoverage {
  unitId: string
  unitTitle: string
  coveredCount: number
  totalCount: number
  percent: number
}

export interface ObjectiveCoverage {
  objective: LearningObjective
  status: CoverageStatus
  linkedContentIds: string[]
  primaryCount: number
  supportingCount: number
}

export type DashboardFilter = 'all' | 'gaps' | 'weak' | 'orphans'
