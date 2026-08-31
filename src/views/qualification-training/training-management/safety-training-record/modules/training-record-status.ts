import type { SmisSafetyTrainingRecordStatus } from '@smis/api'

const statusPresentation: Record<
  SmisSafetyTrainingRecordStatus,
  { label: string; tagType: Api.Common.TagType }
> = {
  draft: { label: '草稿', tagType: 'warning' },
  submitted: { label: '已归档', tagType: 'success' }
}

export const trainingRecordStatusItem = (
  value: SmisSafetyTrainingRecordStatus
): Api.DataCenter.DictListItem => {
  const presentation = statusPresentation[value]
  return {
    name: presentation.label,
    code: value,
    status: 'enabled',
    label: presentation.label,
    value,
    tagType: presentation.tagType
  }
}

export const trainingRecordStatusOptions = (
  Object.keys(statusPresentation) as SmisSafetyTrainingRecordStatus[]
).map((value) => ({ label: statusPresentation[value].label, value }))

export const trainingRecordStatusLabel = (value: SmisSafetyTrainingRecordStatus): string =>
  statusPresentation[value].label
