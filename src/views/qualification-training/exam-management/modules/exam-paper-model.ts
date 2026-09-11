import type { SmisExamPaperPayload, SmisExamQuestionSelection, SmisExamRecord } from '@smis/api'

export const createExamPaperPayload = (): SmisExamPaperPayload => ({
  paperTitle: '',
  paperNo: '',
  assemblyMode: 'fixed',
  randomRule: [{ categoryId: null, questionType: null, count: 5, score: 2 }],
  passingScore: 60,
  timeLimitMinutes: 60,
  allowRetake: false,
  maxAttempts: 1,
  openAt: null,
  closeAt: null,
  remark: '',
  questions: [],
  employeeIds: []
})

export const getExamResultStatus = (record: SmisExamRecord) =>
  record.attemptStatus === 'in_progress' ? 'in_progress' : record.passed ? 'passed' : 'failed'

export const calculateExamTotalScore = (questions: SmisExamQuestionSelection[]) =>
  questions.reduce((sum, item) => sum + Number(item.score || 0), 0)

export const isExamDateRangeInvalid = (
  openAt: string | null | undefined,
  closeAt: string | null | undefined
) =>
  Boolean(openAt) && Boolean(closeAt) && new Date(closeAt!).getTime() <= new Date(openAt!).getTime()

export const toExamQuestionPayload = (questions: SmisExamQuestionSelection[]) =>
  questions.map((item) => ({
    questionId: item.questionId,
    score: Number(item.score)
  }))
