export interface SafetyDetailField {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'select'
  required?: boolean
  width?: number
  options?: readonly string[]
}

export interface SafetyDetailSchema {
  title: string
  description: string
  emptyText: string
  fields: readonly SafetyDetailField[]
}

const field = (
  key: string,
  label: string,
  type: SafetyDetailField['type'] = 'text',
  options?: readonly string[]
): SafetyDetailField => ({ key, label, type, options })

const equipmentLifecycle: SafetyDetailSchema = {
  title: '设备全生命周期记录',
  description: '检验、维保、附件与处置记录随设备主档统一留存。',
  emptyText: '暂无生命周期记录',
  fields: [
    field('type', '记录类型', 'select', [
      '外部检验',
      '内部检验',
      '年度检验',
      '定期检验',
      '维保',
      '附件'
    ]),
    field('recordNo', '记录 / 报告编号'),
    field('occurredAt', '发生日期', 'date'),
    field('result', '结论', 'select', ['合格', '限期整改', '不合格', '不适用']),
    field('nextDate', '下次日期', 'date'),
    field('remark', '说明')
  ]
}

const certificateDetails: SafetyDetailSchema = {
  title: '人员证件明细',
  description: '人员主档来自 HR；一个人员可维护多本证书与复审记录。',
  emptyText: '暂无证件明细',
  fields: [
    field('certificateType', '证书 / 作业类别'),
    field('certificateNo', '证书编号'),
    field('issuingAuthority', '发证机关'),
    field('issueDate', '发证日期', 'date'),
    field('expiryDate', '有效期至', 'date'),
    field('reviewStatus', '复审状态', 'select', ['有效', '临期', '过期', '已复审'])
  ]
}

const participantDetails: SafetyDetailSchema = {
  title: '参与人与课程安排',
  description: '维护计划参与人、课程、学时、签到和考核结果。',
  emptyText: '暂无参与人或课程安排',
  fields: [
    field('rowType', '明细类型', 'select', ['参与人', '课程', '讲师']),
    field('name', '姓名 / 课程名称'),
    field('organization', '部门 / 组织'),
    field('hours', '计划学时', 'number'),
    field('attendance', '签到状态', 'select', ['待签到', '已签到', '缺席']),
    field('result', '考核结果', 'select', ['待考核', '通过', '未通过'])
  ]
}

const examPaperDetails: SafetyDetailSchema = {
  title: '试卷题目与分值',
  description: '固定组卷直接维护题目；随机组卷按题型、难度和数量形成抽题规则。',
  emptyText: '暂无试卷题目',
  fields: [
    field('questionNo', '题号 / 规则号'),
    field('questionType', '题型', 'select', ['单选题', '多选题', '判断题']),
    field('questionContent', '题干 / 抽题规则'),
    field('optionContent', '选项（A.内容；B.内容）'),
    field('correctAnswer', '正确答案'),
    field('score', '分值', 'number')
  ]
}

const questionOptionDetails: SafetyDetailSchema = {
  title: '题目选项',
  description: '维护选项编码、内容及是否为正确答案；判断题可使用“正确 / 错误”。',
  emptyText: '暂无题目选项',
  fields: [
    field('optionCode', '选项编码'),
    field('optionContent', '选项内容'),
    field('isCorrect', '是否正确', 'select', ['是', '否']),
    field('sort', '排序', 'number'),
    field('remark', '解析说明')
  ]
}

const issueDetails = (noun: string): SafetyDetailSchema => ({
  title: `${noun}明细`,
  description: `按岗位或人员维护${noun}名称、规格、周期和数量。`,
  emptyText: `暂无${noun}明细`,
  fields: [
    field('itemCode', `${noun}编码`),
    field('itemName', `${noun}名称`),
    field('specification', '规格型号'),
    field('quantity', '数量', 'number'),
    field('cycle', '发放 / 借用周期'),
    field('status', '状态', 'select', ['待发放', '已发放', '已归还', '损坏', '遗失'])
  ]
})

const inspectionDetails: SafetyDetailSchema = {
  title: '检查项目明细',
  description: '逐项维护检查内容、标准、结果、责任人和整改要求。',
  emptyText: '暂无检查项目',
  fields: [
    field('itemNo', '项目编号'),
    field('itemName', '检查项目'),
    field('standard', '检查标准'),
    field('result', '检查结果', 'select', ['符合', '不符合', '不适用']),
    field('responsiblePerson', '责任人'),
    field('deadline', '整改期限', 'date')
  ]
}

const riskMatrixDetails: SafetyDetailSchema = {
  title: '评价参数与管控明细',
  description: '维护 LEC / LS 评价参数、分值区间、风险等级和对应管控措施。',
  emptyText: '暂无风险评价参数',
  fields: [
    field('factor', '评价因子 / 风险项'),
    field('range', '取值区间'),
    field('score', '分值', 'number'),
    field('riskLevel', '风险等级', 'select', ['重大', '较大', '一般', '低']),
    field('controlLevel', '管控层级', 'select', ['公司', '部门', '班组', '岗位']),
    field('measure', '管控措施')
  ]
}

const violationDetails: SafetyDetailSchema = {
  title: '违章判定与教育题目',
  description: '将违章事实与判定依据、扣分规则和教育题目关联。',
  emptyText: '暂无判定或题目明细',
  fields: [
    field('standardCode', '标准编码'),
    field('violationDescription', '违章行为'),
    field('level', '违章级别', 'select', ['一般', '较重', '严重']),
    field('deduction', '扣分', 'number'),
    field('question', '教育题目'),
    field('correctAnswer', '正确答案')
  ]
}

const eventDetails: SafetyDetailSchema = {
  title: '业务过程与措施明细',
  description: '按时间记录参与对象、过程节点、发现问题和改进 / 管控措施。',
  emptyText: '暂无过程或措施明细',
  fields: [
    field('occurredAt', '日期', 'date'),
    field('subject', '参与对象 / 风险项'),
    field('stage', '过程阶段'),
    field('finding', '发现问题'),
    field('measure', '改进 / 管控措施'),
    field('responsiblePerson', '责任人')
  ]
}

const catalogDetails: SafetyDetailSchema = {
  title: '分类与适用规则',
  description: '维护子分类及其适用范围、周期和启停状态。',
  emptyText: '暂无子分类或规则',
  fields: [
    field('code', '子项编码'),
    field('name', '子项名称'),
    field('scope', '适用范围'),
    field('cycle', '周期 / 频次'),
    field('status', '状态', 'select', ['启用', '停用']),
    field('remark', '说明')
  ]
}

const specialWorkDetails: SafetyDetailSchema = {
  title: '作业人员、分析与安全措施',
  description: '按作业票逐项维护人员资质、气体分析、安全措施确认及审批节点。',
  emptyText: '暂无作业人员或安全措施明细',
  fields: [
    field('rowType', '明细类型', 'select', ['作业人员', '安全措施', '气体分析', '审批节点']),
    field('name', '人员 / 措施 / 分析项'),
    field('certificateNo', '证书编号 / 标准值'),
    field('result', '确认结果', 'select', ['待确认', '符合', '不符合', '不适用']),
    field('confirmedBy', '确认人'),
    field('confirmedAt', '确认日期', 'date')
  ]
}

const moduleGroups: Array<[readonly string[], SafetyDetailSchema]> = [
  [['equipment-ledger'], equipmentLifecycle],
  [
    ['special-equipment-personnel', 'special-equipment-operator', 'special-operation-certificate'],
    certificateDetails
  ],
  [['training-plan', 'training-record', 'course-management'], participantDetails],
  [['exam-management'], examPaperDetails],
  [['question-bank'], questionOptionDetails],
  [['ppe-issue-standard', 'ppe-personal-standard', 'ppe-issue-record'], issueDetails('防护用品')],
  [
    [
      'tool-issue-standard',
      'tool-personal-standard',
      'tool-issue-record',
      'tool-personal-claim',
      'tool-return'
    ],
    issueDetails('工器具')
  ],
  [
    [
      'inspection-form',
      'safety-inspection',
      'inspection-rectification',
      'risk-inspection-task',
      'inspection-plan'
    ],
    inspectionDetails
  ],
  [
    ['risk-level-control', 'risk-assessment-standard', 'quantitative-risk-control'],
    riskMatrixDetails
  ],
  [['anti-violation-standard', 'violation-record', 'violation-education'], violationDetails],
  [['major-hazard-ledger', 'emergency-drill-record', 'historical-accident-case'], eventDetails],
  [
    [
      'special-work-management',
      'hot-work',
      'work-at-height',
      'lifting-work',
      'confined-space-work',
      'temporary-electricity',
      'blind-plate-work',
      'road-breaking-work',
      'hazardous-work'
    ],
    specialWorkDetails
  ],
  [
    [
      'equipment-category',
      'storage-location',
      'special-operation-category',
      'ppe-category',
      'tool-category',
      'violation-category',
      'hazard-factor-category',
      'inspection-type',
      'hazardous-waste-catalog'
    ],
    catalogDetails
  ]
]

export const safetyModuleDetailSchemaMap: Record<string, SafetyDetailSchema> = Object.fromEntries(
  moduleGroups.flatMap(([codes, schema]) => codes.map((code) => [code, schema]))
)

export function getSafetyModuleDetailSchema(code: string): SafetyDetailSchema | undefined {
  return safetyModuleDetailSchemaMap[code]
}
