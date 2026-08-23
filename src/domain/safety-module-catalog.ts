import { safetyModuleFieldOverrides } from './safety-module-fields'

export type SafetyWorkspaceKind =
  | 'tree'
  | 'ledger'
  | 'inspection'
  | 'qualification'
  | 'plan'
  | 'record'
  | 'report'
  | 'standard'
  | 'workflow'
  | 'dictionary'

export interface SafetyFieldOption {
  label: string
  value: string
}

export interface SafetyFieldDefinition {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'select' | 'employee'
  required?: boolean
  options?: SafetyFieldOption[]
  placeholder?: string
  table?: boolean
}

export interface SafetyModuleDefinition {
  code: string
  title: string
  section: string
  description: string
  kind: SafetyWorkspaceKind
  icon: string
  recordNoun: string
  fields: SafetyFieldDefinition[]
}

type CatalogSeed = readonly [
  code: string,
  title: string,
  section: string,
  description: string,
  kind: SafetyWorkspaceKind
]

const statusOptions: SafetyFieldOption[] = [
  { label: '草稿', value: 'draft' },
  { label: '待审核', value: 'pending' },
  { label: '有效', value: 'active' },
  { label: '已完成', value: 'completed' },
  { label: '已停用', value: 'disabled' }
]

const resultOptions: SafetyFieldOption[] = [
  { label: '合格', value: 'qualified' },
  { label: '限期整改', value: 'rectification' },
  { label: '不合格', value: 'unqualified' }
]

const fieldsByKind: Record<SafetyWorkspaceKind, SafetyFieldDefinition[]> = {
  tree: [
    { key: 'code', label: '分类编码', type: 'text', required: true, table: true },
    { key: 'name', label: '分类名称', type: 'text', required: true, table: true },
    { key: 'parentName', label: '上级分类', type: 'text', table: true },
    { key: 'responsiblePerson', label: '责任人', type: 'employee', table: true },
    { key: 'sort', label: '排序', type: 'number' },
    { key: 'remark', label: '说明', type: 'textarea' }
  ],
  ledger: [
    { key: 'recordNo', label: '档案编号', type: 'text', required: true, table: true },
    { key: 'name', label: '档案名称', type: 'text', required: true, table: true },
    { key: 'category', label: '类别', type: 'text', table: true },
    { key: 'responsiblePerson', label: '责任人', type: 'employee', table: true },
    { key: 'effectiveDate', label: '生效日期', type: 'date', table: true },
    { key: 'status', label: '状态', type: 'select', options: statusOptions, table: true },
    { key: 'remark', label: '备注', type: 'textarea' }
  ],
  inspection: [
    { key: 'recordNo', label: '检验编号', type: 'text', required: true, table: true },
    { key: 'subjectName', label: '检验对象', type: 'text', required: true, table: true },
    { key: 'inspectionOrganization', label: '检验机构/部门', type: 'text', table: true },
    { key: 'inspectionDate', label: '检验日期', type: 'date', required: true, table: true },
    { key: 'nextInspectionDate', label: '下次检验', type: 'date', table: true },
    { key: 'result', label: '检验结果', type: 'select', options: resultOptions, table: true },
    { key: 'issueDescription', label: '问题与整改要求', type: 'textarea' }
  ],
  qualification: [
    { key: 'certificateNo', label: '证书编号', type: 'text', required: true, table: true },
    { key: 'employeeName', label: '持证人员', type: 'employee', required: true, table: true },
    { key: 'certificateType', label: '证书/作业类别', type: 'text', table: true },
    { key: 'issuingAuthority', label: '发证机关', type: 'text', table: true },
    { key: 'issueDate', label: '发证日期', type: 'date' },
    { key: 'expiryDate', label: '有效期至', type: 'date', table: true },
    { key: 'status', label: '证件状态', type: 'select', options: statusOptions, table: true },
    { key: 'remark', label: '备注', type: 'textarea' }
  ],
  plan: [
    { key: 'recordNo', label: '计划编号', type: 'text', required: true, table: true },
    { key: 'name', label: '计划名称', type: 'text', required: true, table: true },
    { key: 'ownerName', label: '负责人', type: 'employee', table: true },
    { key: 'startDate', label: '开始日期', type: 'date', table: true },
    { key: 'endDate', label: '结束日期', type: 'date', table: true },
    { key: 'status', label: '执行状态', type: 'select', options: statusOptions, table: true },
    { key: 'content', label: '计划内容', type: 'textarea' }
  ],
  record: [
    { key: 'recordNo', label: '记录编号', type: 'text', required: true, table: true },
    { key: 'name', label: '事项名称', type: 'text', required: true, table: true },
    { key: 'employeeName', label: '相关人员', type: 'employee', table: true },
    { key: 'occurredAt', label: '发生时间', type: 'datetime', table: true },
    { key: 'location', label: '地点', type: 'text', table: true },
    { key: 'status', label: '处理状态', type: 'select', options: statusOptions, table: true },
    { key: 'content', label: '记录内容', type: 'textarea' }
  ],
  report: [
    { key: 'reportPeriod', label: '统计周期', type: 'text', required: true, table: true },
    { key: 'name', label: '报表名称', type: 'text', required: true, table: true },
    { key: 'organizationName', label: '责任部门', type: 'text', table: true },
    { key: 'totalCount', label: '统计数量', type: 'number', table: true },
    { key: 'generatedAt', label: '生成时间', type: 'datetime', table: true },
    { key: 'summary', label: '分析结论', type: 'textarea' }
  ],
  standard: [
    { key: 'standardNo', label: '标准编号', type: 'text', required: true, table: true },
    { key: 'name', label: '标准名称', type: 'text', required: true, table: true },
    { key: 'category', label: '适用类别', type: 'text', table: true },
    { key: 'cycle', label: '周期/频次', type: 'text', table: true },
    { key: 'quantity', label: '标准数量', type: 'number', table: true },
    { key: 'status', label: '状态', type: 'select', options: statusOptions, table: true },
    { key: 'content', label: '标准要求', type: 'textarea' }
  ],
  workflow: [
    { key: 'applicationNo', label: '作业票编号', type: 'text', required: true, table: true },
    { key: 'name', label: '作业名称', type: 'text', required: true, table: true },
    { key: 'applicantName', label: '申请人', type: 'employee', table: true },
    { key: 'workLocation', label: '作业地点', type: 'text', table: true },
    { key: 'startAt', label: '计划开始', type: 'datetime', table: true },
    { key: 'endAt', label: '计划结束', type: 'datetime' },
    { key: 'status', label: '审批状态', type: 'select', options: statusOptions, table: true },
    { key: 'safetyMeasures', label: '安全措施', type: 'textarea' }
  ],
  dictionary: [
    { key: 'code', label: '编码', type: 'text', required: true, table: true },
    { key: 'name', label: '名称', type: 'text', required: true, table: true },
    { key: 'category', label: '所属类别', type: 'text', table: true },
    { key: 'status', label: '状态', type: 'select', options: statusOptions, table: true },
    { key: 'sort', label: '排序', type: 'number' },
    { key: 'remark', label: '说明', type: 'textarea' }
  ]
}

const catalogSeeds: CatalogSeed[] = [
  [
    'equipment-category',
    '设备分类',
    '设备台账',
    '维护设备类别树及各类别适用的外部、内部、年度、定期与在线检验规则。',
    'tree'
  ],
  [
    'storage-location',
    '存放位置',
    '设备台账',
    '按厂区、车间和具体位置维护设备存放位置树。',
    'tree'
  ],
  [
    'equipment-depreciation',
    '设备折旧',
    '设备台账',
    '维护设备原值、残值、使用年限以及直线法、双倍余额递减法或年数总和法折旧结果。',
    'ledger'
  ],
  [
    'equipment-ledger',
    '设备台账',
    '设备台账',
    '建立设备全生命周期主档、二维码、供应商、资产与维保信息。',
    'ledger'
  ],
  [
    'equipment-attachment',
    '设备档案附件',
    '设备台账',
    '集中维护设备图纸、说明书、合格证和其他可预览附件。',
    'ledger'
  ],
  [
    'external-inspection',
    '外部检验',
    '设备台账',
    '登记法定或第三方机构出具的设备检验记录和报告。',
    'inspection'
  ],
  [
    'internal-inspection',
    '内部检验',
    '设备台账',
    '登记企业内部点检、检验结果与整改要求。',
    'inspection'
  ],
  [
    'annual-inspection',
    '年度检验',
    '设备台账',
    '维护设备年度检验计划、结论和下次检验日期。',
    'inspection'
  ],
  [
    'periodic-inspection',
    '定期检验',
    '设备台账',
    '按设备类别周期规则维护定期检验记录。',
    'inspection'
  ],
  [
    'special-equipment-personnel',
    '特种设备人员证件台账',
    '培训资质 / 安全资质管理',
    '维护特种设备相关管理与作业人员证件档案。',
    'qualification'
  ],
  [
    'special-equipment-operator',
    '特种设备作业人员证件台账',
    '培训资质 / 安全资质管理',
    '按人员和设备类别维护特种设备作业资格。',
    'qualification'
  ],
  [
    'special-operation-category',
    '特种作业类别',
    '培训资质 / 安全资质管理',
    '维护特种作业类别、复审周期和适用岗位。',
    'dictionary'
  ],
  [
    'special-operation-certificate',
    '特种作业操作证',
    '培训资质 / 安全资质管理',
    '维护特种作业操作证、发证机关、有效期和复审提醒。',
    'qualification'
  ],
  [
    'safety-manager-certificate',
    '安全管理人员证',
    '培训资质 / 安全资质管理',
    '维护主要负责人和安全管理人员证件台账。',
    'qualification'
  ],
  [
    'registered-safety-engineer',
    '注册安全工程师台账',
    '培训资质 / 安全资质管理',
    '维护注册安全工程师专业、注册单位和有效期。',
    'qualification'
  ],
  [
    'qualification-analysis',
    '安全资质报表分析',
    '培训资质 / 安全资质管理',
    '汇总证件持有、临期、过期和人员覆盖情况。',
    'report'
  ],
  [
    'training-plan',
    '安全培训计划',
    '培训资质 / 培训管理',
    '制定年度、月度和专项安全培训计划。',
    'plan'
  ],
  [
    'training-record',
    '安全培训记录',
    '培训资质 / 培训管理',
    '关联培训计划维护课程、讲师、签到与考核结果。',
    'record'
  ],
  [
    'training-analysis',
    '培训统计报表',
    '培训资质 / 培训管理',
    '分析培训覆盖率、完成率、学时和考试通过率。',
    'report'
  ],
  [
    'course-management',
    '课程管理',
    '培训资质',
    '维护课程分类、课件、学时、讲师和适用岗位。',
    'ledger'
  ],
  [
    'exam-management',
    '考试管理',
    '培训资质',
    '配置考试范围、时长、合格分数、参考人员与成绩。',
    'plan'
  ],
  ['question-bank', '题库管理', '培训资质', '维护单选、多选、判断等题目与答案解析。', 'ledger'],
  [
    'major-hazard-ledger',
    '重大危险源台账',
    '安全生产 / 应急救援',
    '维护重大危险源等级、介质、监测措施和责任人。',
    'ledger'
  ],
  [
    'emergency-plan',
    '应急救援预案',
    '安全生产 / 应急救援',
    '维护综合、专项和现场处置预案及版本附件。',
    'plan'
  ],
  [
    'emergency-drill-plan',
    '应急预案演练计划',
    '安全生产 / 应急救援',
    '制定演练目标、场景、组织人员和时间计划。',
    'plan'
  ],
  [
    'emergency-drill-record',
    '应急预案演练记录',
    '安全生产 / 应急救援',
    '记录演练过程、参与人员、问题和改进措施。',
    'record'
  ],
  [
    'emergency-drill-analysis',
    '应急演练报表',
    '安全生产 / 应急救援',
    '统计演练完成率、覆盖范围和问题闭环情况。',
    'report'
  ],
  [
    'casualty-quick-report',
    '伤亡事故快报',
    '安全生产 / 安全事故',
    '快速登记事故时间、地点、伤亡和初步原因。',
    'record'
  ],
  [
    'work-injury-declaration',
    '工伤申报',
    '安全生产 / 安全事故',
    '维护工伤申报材料、认定进度与处理结果。',
    'workflow'
  ],
  [
    'accident-analysis',
    '事故管理分析',
    '安全生产 / 安全事故',
    '按事故类型、等级、部门和原因进行趋势分析。',
    'report'
  ],
  [
    'work-injury-document',
    '工伤证件信息',
    '安全生产 / 安全事故',
    '维护工伤认定书、劳动能力鉴定和相关证件。',
    'qualification'
  ],
  [
    'historical-accident-case',
    '历史事故案例',
    '安全生产 / 安全事故',
    '沉淀历史事故经过、原因、教训和防范措施。',
    'ledger'
  ],
  [
    'safety-accident-statistics',
    '安全事故统计',
    '安全生产 / 安全事故',
    '统计事故数量、伤亡、损失和闭环指标。',
    'report'
  ],
  [
    'ppe-category',
    '防护用品类别',
    '安全生产 / 防护用品管理',
    '维护劳动防护用品类别、使用周期和预警规则。',
    'tree'
  ],
  [
    'ppe-issue-standard',
    '防护用品发放标准',
    '安全生产 / 防护用品管理',
    '按岗位和工种配置防护用品发放标准。',
    'standard'
  ],
  [
    'ppe-personal-standard',
    '防护用品个人标准',
    '安全生产 / 防护用品管理',
    '维护个人适用的防护用品和数量标准。',
    'standard'
  ],
  [
    'ppe-issue-record',
    '防护用品发放记录',
    '安全生产 / 防护用品管理',
    '登记用品批次、数量、领用人和签收情况。',
    'record'
  ],
  [
    'ppe-personal-claim',
    '个人领用',
    '安全生产 / 防护用品管理',
    '由个人标准生成领用申请并联动发放记录。',
    'workflow'
  ],
  [
    'tool-category',
    '工器具类别',
    '安全生产 / 工器具领用',
    '维护工器具类别、计量属性和检验周期。',
    'tree'
  ],
  [
    'tool-issue-standard',
    '工器具发放标准',
    '安全生产 / 工器具领用',
    '按岗位配置工器具发放与借用标准。',
    'standard'
  ],
  [
    'tool-personal-standard',
    '工器具个人标准',
    '安全生产 / 工器具领用',
    '维护员工个人工器具配置标准。',
    'standard'
  ],
  [
    'tool-issue-record',
    '工器具发放记录',
    '安全生产 / 工器具领用',
    '登记工器具发放批次、数量和签收。',
    'record'
  ],
  [
    'tool-personal-claim',
    '工器具个人领用',
    '安全生产 / 工器具领用',
    '按个人标准申请和领取工器具。',
    'workflow'
  ],
  [
    'tool-return',
    '工器具领用归还',
    '安全生产 / 工器具领用',
    '跟踪借用、归还、损坏和遗失状态。',
    'workflow'
  ],
  [
    'violation-education',
    '三违人员教育信息',
    '安全生产 / 反违章管理',
    '关联 HR 人员登记违章事实、教育过程、照片和考试结果。',
    'record'
  ],
  [
    'violation-category',
    '违章分类',
    '安全生产 / 反违章管理',
    '维护违章类别、级别、扣分和处罚规则。',
    'tree'
  ],
  [
    'anti-violation-standard',
    '反违章标准库',
    '安全生产 / 反违章管理',
    '维护违章判定依据、教育内容和关联题目。',
    'standard'
  ],
  [
    'violation-record',
    '违章记录',
    '安全生产 / 反违章管理',
    '登记违章人员、现场照片、处理意见和整改结果。',
    'record'
  ],
  [
    'safety-knowledge',
    '应知应会',
    '安全生产 / 安全制度',
    '沉淀岗位安全知识、操作规程和学习材料。',
    'ledger'
  ],
  [
    'safety-regulation',
    '安全管理制度',
    '安全生产 / 安全制度',
    '维护安全制度版本、适用范围、发布和修订记录。',
    'ledger'
  ],
  [
    'hazard-factor-category',
    '危害因素类别',
    '双控体系 / 风险管控',
    '维护危险有害因素分类及事故类型映射。',
    'tree'
  ],
  [
    'risk-level-control',
    '风险分级管控',
    '双控体系 / 风险管控',
    '按风险等级维护责任层级、管控周期与措施。',
    'standard'
  ],
  [
    'risk-inspection-task',
    '风险巡查任务',
    '双控体系 / 风险管控',
    '下发风险巡查任务并跟踪执行和异常上报。',
    'workflow'
  ],
  [
    'risk-assessment-standard',
    '风险评估标准设置',
    '双控体系 / 风险管控',
    '配置 LEC、LS 等评价方法的分值和风险矩阵。',
    'standard'
  ],
  [
    'risk-four-color-map',
    '风险四色图',
    '双控体系 / 风险管控',
    '按场所和区域展示红橙黄蓝四色风险分布。',
    'report'
  ],
  [
    'quantitative-risk-control',
    '风险定量评价及管控',
    '双控体系 / 风险管控',
    '汇总定量评价结果并形成分级管控清单。',
    'report'
  ],
  [
    'inspection-plan',
    '隐患排查计划',
    '双控体系 / 风险管控',
    '按周期制定隐患排查计划并自动生成任务。',
    'plan'
  ],
  [
    'inspection-task',
    '隐患排查任务',
    '双控体系 / 风险管控',
    '执行、转交或取消排查任务并记录现场结果。',
    'workflow'
  ],
  [
    'danger-governance',
    '隐患治理跟踪',
    '双控体系 / 风险管控',
    '覆盖隐患登记、审核、整改、复查与销号闭环。',
    'workflow'
  ],
  [
    'inspection-form',
    '排查表',
    '双控体系 / 风险管控',
    '维护按风险点和岗位配置的排查项目模板。',
    'standard'
  ],
  [
    'safety-inspection',
    '安全检查',
    '双控体系 / 风险管控',
    '组织综合、专项、季节和节假日安全检查。',
    'record'
  ],
  [
    'inspection-rectification',
    '安全检查落实整改',
    '双控体系 / 风险管控',
    '跟踪检查问题的责任人、期限、整改和验收。',
    'workflow'
  ],
  [
    'inspection-type',
    '排查类型定义',
    '双控体系 / 隐患治理',
    '维护日常、专项、综合等排查类型及规则。',
    'dictionary'
  ],
  [
    'snapshot-report',
    '随手拍',
    '双控体系 / 隐患治理',
    '移动端快速上报现场隐患、位置和图片证据。',
    'record'
  ],
  [
    'public-danger-report',
    '公众举报隐患',
    '双控体系 / 隐患治理',
    '受理公众隐患举报并记录核实与处置结果。',
    'workflow'
  ],
  [
    'danger-statistics',
    '统计报表',
    '双控体系 / 隐患治理',
    '统计隐患来源、等级、整改率、逾期率和趋势。',
    'report'
  ],
  [
    'special-work-management',
    '特殊作业管理',
    '特殊作业',
    '统一查询特殊作业票、审批进度、有效期和现场状态。',
    'workflow'
  ],
  ['hot-work', '动火作业申请', '特殊作业', '申请动火作业并确认分析、监护和防火措施。', 'workflow'],
  [
    'work-at-height',
    '高处作业申请',
    '特殊作业',
    '申请高处作业并确认坠落防护和监护措施。',
    'workflow'
  ],
  [
    'lifting-work',
    '吊装作业申请',
    '特殊作业',
    '申请吊装作业并确认设备、指挥和警戒措施。',
    'workflow'
  ],
  [
    'confined-space-work',
    '受限空间作业申请',
    '特殊作业',
    '申请受限空间作业并确认气体分析、通风和救援措施。',
    'workflow'
  ],
  [
    'temporary-electricity',
    '临时用电作业申请',
    '特殊作业',
    '申请临时用电并确认配电、接地和漏保措施。',
    'workflow'
  ],
  [
    'road-breaking-work',
    '断路作业申请',
    '特殊作业',
    '申请断路作业并确认交通组织和警示措施。',
    'workflow'
  ],
  [
    'blind-plate-work',
    '盲板抽堵申请',
    '特殊作业',
    '申请盲板抽堵并确认介质隔离、编号和监护措施。',
    'workflow'
  ],
  [
    'hazardous-work',
    '危险作业申请',
    '特殊作业',
    '受理其他危险作业并配置对应安全措施和审批。',
    'workflow'
  ],
  [
    'hazardous-waste-inbound',
    '危废入库',
    '危废管理',
    '登记危废来源、类别、重量、包装和贮存位置。',
    'record'
  ],
  [
    'hazardous-waste-outbound',
    '危废出库',
    '危废管理',
    '登记危废转移联单、接收单位、运输和出库重量。',
    'record'
  ],
  [
    'hazardous-waste-catalog',
    '危废名录',
    '危废管理',
    '维护国家危废代码、危险特性、处置方式和贮存要求。',
    'dictionary'
  ]
]

const iconBySection: Record<string, string> = {
  设备台账: 'ri:archive-stack-line',
  培训资质: 'ri:graduation-cap-line',
  '培训资质 / 安全资质管理': 'ri:verified-badge-line',
  '培训资质 / 培训管理': 'ri:presentation-line',
  '安全生产 / 应急救援': 'ri:first-aid-kit-line',
  '安全生产 / 安全事故': 'ri:alarm-warning-line',
  '安全生产 / 防护用品管理': 'ri:shield-check-line',
  '安全生产 / 工器具领用': 'ri:tools-line',
  '安全生产 / 反违章管理': 'ri:forbid-2-line',
  '安全生产 / 安全制度': 'ri:file-shield-2-line',
  '双控体系 / 风险管控': 'ri:radar-line',
  '双控体系 / 隐患治理': 'ri:checkbox-multiple-line',
  特殊作业: 'ri:fire-line',
  危废管理: 'ri:recycle-line'
}

const recordNounByKind: Record<SafetyWorkspaceKind, string> = {
  tree: '分类',
  ledger: '档案',
  inspection: '检验记录',
  qualification: '证件',
  plan: '计划',
  record: '记录',
  report: '报表',
  standard: '标准',
  workflow: '业务单',
  dictionary: '条目'
}

export const safetyModuleCatalog: SafetyModuleDefinition[] = catalogSeeds.map(
  ([code, title, section, description, kind]) => ({
    code,
    title,
    section,
    description,
    kind,
    icon: iconBySection[section] ?? 'ri:shield-check-line',
    recordNoun: recordNounByKind[kind],
    fields: (safetyModuleFieldOverrides[code] ?? fieldsByKind[kind]).map((field) => ({ ...field }))
  })
)

const catalogMap = new Map(safetyModuleCatalog.map((definition) => [definition.code, definition]))

export function getSafetyModuleDefinition(code: string | undefined): SafetyModuleDefinition {
  return catalogMap.get(code ?? '') ?? safetyModuleCatalog[0]!
}
