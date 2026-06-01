import type {
  Alignment,
  ContentItem,
  ContentType,
  Course,
  CoverageStatus,
  CoverageSummary,
  LearningObjective,
  ObjectiveCoverage,
  UnitCoverage,
} from '../types/course'

export function getAlignmentsForLO(
  loId: string,
  alignments: Alignment[],
): Alignment[] {
  return alignments.filter((a) => a.loId === loId)
}

export function getAlignmentsForContent(
  contentId: string,
  alignments: Alignment[],
): Alignment[] {
  return alignments.filter((a) => a.contentId === contentId)
}

export function getLinkedContent(
  loId: string,
  course: Pick<Course, 'contentItems' | 'alignments'>,
): ContentItem[] {
  const contentIds = new Set(
    getAlignmentsForLO(loId, course.alignments).map((a) => a.contentId),
  )
  return course.contentItems
    .filter((item) => contentIds.has(item.id))
    .sort((a, b) => a.order - b.order)
}

export function getLinkedObjectives(
  contentId: string,
  course: Pick<Course, 'learningObjectives' | 'alignments'>,
): LearningObjective[] {
  const loIds = new Set(
    getAlignmentsForContent(contentId, course.alignments).map((a) => a.loId),
  )
  return course.learningObjectives
    .filter((lo) => loIds.has(lo.id))
    .sort((a, b) => a.order - b.order)
}

function hasAssessmentLink(
  loId: string,
  alignments: Alignment[],
  contentItems: ContentItem[],
): boolean {
  const linkedIds = getAlignmentsForLO(loId, alignments).map((a) => a.contentId)
  return contentItems.some(
    (item) => linkedIds.includes(item.id) && item.type === 'assessment',
  )
}

export function getCoverageStatus(
  loId: string,
  alignments: Alignment[],
  contentItems: ContentItem[],
): CoverageStatus {
  const links = getAlignmentsForLO(loId, alignments)

  if (links.length === 0) {
    return 'gap'
  }

  const onlySupporting = links.every((link) => link.strength === 'supporting')
  const hasAssessment = hasAssessmentLink(loId, alignments, contentItems)
  const linkedTypes = new Set(
    links
      .map((link) => contentItems.find((item) => item.id === link.contentId)?.type)
      .filter(Boolean),
  )

  if (onlySupporting || (links.length === 1 && !hasAssessment) || !linkedTypes.has('assessment')) {
    const hasLessonOrActivity = linkedTypes.has('lesson') || linkedTypes.has('activity')
    if (hasLessonOrActivity && !hasAssessment) {
      return 'weak'
    }
    if (onlySupporting) {
      return 'weak'
    }
  }

  return 'covered'
}

export function getObjectiveCoverage(
  objective: LearningObjective,
  course: Pick<Course, 'alignments' | 'contentItems'>,
): ObjectiveCoverage {
  const links = getAlignmentsForLO(objective.id, course.alignments)
  return {
    objective,
    status: getCoverageStatus(objective.id, course.alignments, course.contentItems),
    linkedContentIds: links.map((link) => link.contentId),
    primaryCount: links.filter((link) => link.strength !== 'supporting').length,
    supportingCount: links.filter((link) => link.strength === 'supporting').length,
  }
}

export function computeCoverageSummary(course: Course): CoverageSummary {
  const objectiveCoverages = course.learningObjectives.map((lo) =>
    getObjectiveCoverage(lo, course),
  )

  const linkedContentIds = new Set(course.alignments.map((a) => a.contentId))
  const orphanCount = course.contentItems.filter(
    (item) => !linkedContentIds.has(item.id),
  ).length

  return {
    totalObjectives: course.learningObjectives.length,
    coveredCount: objectiveCoverages.filter((oc) => oc.status === 'covered').length,
    gapCount: objectiveCoverages.filter((oc) => oc.status === 'gap').length,
    weakCount: objectiveCoverages.filter((oc) => oc.status === 'weak').length,
    orphanCount,
  }
}

export function getUnitCoverage(course: Course): UnitCoverage[] {
  return course.units
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((unit) => {
      const unitObjectives = course.learningObjectives.filter(
        (lo) => lo.unitId === unit.id,
      )
      const coveredCount = unitObjectives.filter(
        (lo) => getCoverageStatus(lo.id, course.alignments, course.contentItems) === 'covered',
      ).length

      return {
        unitId: unit.id,
        unitTitle: unit.title,
        coveredCount,
        totalCount: unitObjectives.length,
        percent:
          unitObjectives.length === 0
            ? 0
            : Math.round((coveredCount / unitObjectives.length) * 100),
      }
    })
}

export function getOrphanContent(course: Course): ContentItem[] {
  const linkedContentIds = new Set(course.alignments.map((a) => a.contentId))
  return course.contentItems
    .filter((item) => !linkedContentIds.has(item.id))
    .sort((a, b) => a.order - b.order)
}

export function getRevisionPrompts(
  loId: string,
  course: Pick<Course, 'alignments' | 'contentItems'>,
): string[] {
  const links = getAlignmentsForLO(loId, course.alignments)
  const prompts: string[] = []

  if (links.length === 0) {
    prompts.push('No content is linked to this objective. Add lessons, activities, or assessments that address it.')
    return prompts
  }

  const linkedContent = links
    .map((link) => course.contentItems.find((item) => item.id === link.contentId))
    .filter((item): item is ContentItem => Boolean(item))

  const types = new Set(linkedContent.map((item) => item.type))

  if (!types.has('assessment')) {
    prompts.push('No assessment linked — consider adding one to measure whether learners meet this objective.')
  }

  if (!types.has('lesson') && !types.has('activity')) {
    prompts.push('Only assessments are linked — consider adding instructional content that teaches this objective.')
  }

  if (links.every((link) => link.strength === 'supporting')) {
    prompts.push('All links are marked as supporting — consider marking at least one as primary.')
  }

  if (links.length === 1) {
    prompts.push('Only one content item addresses this objective — consider adding supporting material for reinforcement.')
  }

  return prompts
}

export function groupContentByType(
  items: ContentItem[],
): Record<ContentType, ContentItem[]> {
  return {
    lesson: items.filter((item) => item.type === 'lesson'),
    activity: items.filter((item) => item.type === 'activity'),
    assessment: items.filter((item) => item.type === 'assessment'),
  }
}

export function contentTypeLabel(type: ContentType): string {
  switch (type) {
    case 'lesson':
      return 'Lesson'
    case 'activity':
      return 'Activity'
    case 'assessment':
      return 'Assessment'
  }
}

export function bloomLevelLabel(level: LearningObjective['bloomLevel']): string {
  if (!level) return ''
  return level.charAt(0).toUpperCase() + level.slice(1)
}
