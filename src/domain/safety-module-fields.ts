import type { SafetyFieldDefinition, SafetyFieldOption } from './safety-module-catalog'

type FieldOptions = Pick<
  SafetyFieldDefinition,
  | 'required'
  | 'table'
  | 'placeholder'
  | 'readonly'
  | 'dictCode'
  | 'referenceModuleCode'
  | 'section'
  | 'visibleWhen'
>

const field = (
  key: string,
  label: string,
  type: SafetyFieldDefinition['type'] = 'text',
  options: FieldOptions & { choices?: SafetyFieldOption[] } = {}
): SafetyFieldDefinition => ({
  key,
  label,
  type,
  required: options.required,
  table: options.table,
  placeholder: options.placeholder,
  options: options.choices,
  readonly: options.readonly,
  dictCode: options.dictCode,
  referenceModuleCode: options.referenceModuleCode,
  section: options.section,
  visibleWhen: options.visibleWhen
})

const required = { required: true } as const
const table = { table: true } as const
const requiredTable = { required: true, table: true } as const
const choice = (labels: string[]): SafetyFieldOption[] =>
  labels.map((label) => ({ label, value: label }))

const statusChoices = choice(['草稿', '待审核', '有效', '已完成', '已停用'])
const riskChoices = choice(['低风险', '一般风险', '较大风险', '重大风险'])
const resultChoices = choice(['合格', '限期整改', '不合格'])

const categoryFields = (
  noun: string,
  options: { includeInspectionType?: boolean } = {}
): SafetyFieldDefinition[] => [
  field('code', `${noun}编码`, 'text', requiredTable),
  field('name', `${noun}名称`, 'text', requiredTable),
  field('parentName', `上级${noun}`, 'catalog-reference', {
    table: true,
    referenceModuleCode: noun === '设备分类' ? 'equipment-category' : undefined
  }),
  ...(options.includeInspectionType
    ? [
        field('inspectionType', '适用检验类别', 'multi-select', {
          choices: choice(['外部检验', '内部检验', '年度检验', '定期检验', '在线检验'])
        })
      ]
    : []),
  field('sort', '显示顺序', 'number'),
  field('status', '启用状态', 'select', { choices: choice(['启用', '停用']) }),
  field('remark', '说明', 'textarea')
]

const equipmentInspectionFields = (inspectionName: string): SafetyFieldDefinition[] => [
  field('recordNo', `${inspectionName}编号`, 'text', {
    table: true,
    readonly: true,
    placeholder: '保存后按编码规则自动生成'
  }),
  field('recordType', '记录类型', 'select', {
    required: true,
    dictCode: 'smisInspectionRecordType'
  }),
  field('equipmentName', '设备名称', 'equipment-reference', requiredTable),
  field('equipmentNo', '设备编号', 'text', { ...requiredTable, readonly: true }),
  field('inspectionOrganization', '检验机构/部门', 'text', table),
  field('inspectionDate', '检验日期', 'date', required),
  field('needsNextInspection', '是否需要下次检验', 'select', {
    choices: [
      { label: '是', value: true },
      { label: '否', value: false }
    ]
  }),
  field('nextInspectionDate', '下次检验日期', 'date', {
    visibleWhen: { key: 'needsNextInspection', value: true }
  }),
  field('cycle', '检验周期', 'select', { choices: choice(['3个月', '6个月', '12个月']) }),
  field('result', '检验结论', 'select', { required: true, choices: resultChoices }),
  field('certificateNo', '检验报告/证书编号'),
  field('issueDescription', '问题与整改要求', 'textarea'),
  field('attachmentDescription', '检验附件说明', 'textarea')
]

const certificateFields = (
  certificateName: string,
  extra: SafetyFieldDefinition[] = []
): SafetyFieldDefinition[] => [
  field('certificateNo', '证书编号', 'text', requiredTable),
  field('employeeName', '持证人员', 'employee', requiredTable),
  field('certificateType', certificateName, 'text', requiredTable),
  ...extra,
  field('issuingAuthority', '发证机关', 'text', table),
  field('issueDate', '发证日期', 'date'),
  field('expiryDate', '有效期至', 'date', required),
  field('reviewDate', '下次复审日期', 'date'),
  field('status', '证件状态', 'select', { choices: statusChoices }),
  field('attachmentDescription', '证件附件说明', 'textarea'),
  field('remark', '备注', 'textarea')
]

const analysisFields = (subject: string): SafetyFieldDefinition[] => [
  field('reportPeriod', '统计周期', 'text', requiredTable),
  field('name', `${subject}报表`, 'text', requiredTable),
  field('organizationName', '统计组织', 'text', table),
  field('totalCount', '总数', 'number', table),
  field('completedCount', '完成/有效数', 'number'),
  field('warningCount', '临期/待整改数', 'number'),
  field('overdueCount', '过期/逾期数', 'number'),
  field('generatedAt', '生成时间', 'datetime'),
  field('summary', '分析结论', 'textarea')
]

const issueStandardFields = (noun: string): SafetyFieldDefinition[] => [
  field('standardNo', '标准编号', 'text', requiredTable),
  field('name', `${noun}发放标准`, 'text', requiredTable),
  field('jobType', '适用工种/岗位', 'text', requiredTable),
  field('itemName', noun, 'text', requiredTable),
  field('quantity', '发放数量', 'number', required),
  field('cycle', '发放周期', 'select', { choices: choice(['月', '季', '半年', '年']) }),
  field('status', '状态', 'select', { choices: statusChoices }),
  field('remark', '标准说明', 'textarea')
]

const personalStandardFields = (noun: string): SafetyFieldDefinition[] => [
  field('standardNo', '个人标准编号', 'text', requiredTable),
  field('employeeName', '员工', 'employee', requiredTable),
  field('departmentName', '部门/岗位', 'text', table),
  field('itemName', noun, 'text', requiredTable),
  field('quantity', '配置数量', 'number', required),
  field('cycle', '更换周期', 'select', { choices: choice(['月', '季', '半年', '年']) }),
  field('effectiveDate', '生效日期', 'date'),
  field('remark', '说明', 'textarea')
]

const issueRecordFields = (noun: string): SafetyFieldDefinition[] => [
  field('recordNo', '发放单号', 'text', requiredTable),
  field('itemName', noun, 'text', requiredTable),
  field('employeeName', '领用人', 'employee', requiredTable),
  field('departmentName', '部门/岗位', 'text', table),
  field('quantity', '发放数量', 'number', required),
  field('occurredAt', '发放时间', 'datetime', required),
  field('issuerName', '发放人', 'employee'),
  field('signedStatus', '签收状态', 'select', { choices: choice(['待签收', '已签收', '已拒收']) }),
  field('remark', '备注', 'textarea')
]

const claimFields = (noun: string): SafetyFieldDefinition[] => [
  field('applicationNo', '领用单号', 'text', requiredTable),
  field('employeeName', '领用人', 'employee', requiredTable),
  field('itemName', noun, 'text', requiredTable),
  field('quantity', '申请数量', 'number', required),
  field('applyDate', '申请日期', 'date', required),
  field('status', '办理状态', 'select', {
    choices: choice(['待领用', '已发放', '已归还', '已关闭'])
  }),
  field('issuerName', '经办人', 'employee'),
  field('remark', '申请说明', 'textarea')
]

const specialWorkFields = (
  workName: string,
  extras: SafetyFieldDefinition[] = []
): SafetyFieldDefinition[] => [
  field('applicationNo', '作业票编号', 'text', requiredTable),
  field('name', '作业项目', 'text', requiredTable),
  field('workUnit', '作业实施单位', 'text', table),
  field('workLocation', '作业地点及内容', 'textarea', required),
  field('startAt', '计划开始时间', 'datetime', requiredTable),
  field('endAt', '计划结束时间', 'datetime', required),
  field('riskLevel', '作业级别', 'select', {
    choices: choice(workName === '动火作业' ? ['特级', '一级', '二级'] : ['一级', '二级'])
  }),
  ...extras,
  field('applicantName', '申请人', 'employee', requiredTable),
  field('guardianName', '监护人', 'employee'),
  field('approverName', '审批人', 'employee'),
  field('status', '审批状态', 'select', {
    choices: choice(['草稿', '审批中', '已批准', '作业中', '已关闭', '已作废'])
  }),
  field('safetyMeasures', `${workName}安全措施`, 'textarea', required),
  field('attachmentDescription', '分析记录/审批附件说明', 'textarea')
]

export const safetyModuleFieldOverrides: Record<string, SafetyFieldDefinition[]> = {
  'equipment-category': categoryFields('设备分类', { includeInspectionType: true }),
  'storage-location': [
    field('code', '位置编码', 'text', requiredTable),
    field('name', '位置名称', 'text', requiredTable),
    field('parentName', '上级位置', 'catalog-reference', {
      table: true,
      referenceModuleCode: 'storage-location'
    }),
    field('managerName', '位置负责人', 'employee', table),
    field('address', '详细位置', 'text'),
    field('status', '启用状态', 'select', { choices: choice(['启用', '停用']) }),
    field('remark', '说明', 'textarea')
  ],
  'equipment-depreciation': [
    field('recordNo', '折旧单号', 'text', {
      table: true,
      readonly: true,
      placeholder: '保存后按编码规则自动生成'
    }),
    field('equipmentName', '设备名称', 'equipment-reference', requiredTable),
    field('equipmentNo', '设备编号', 'text', { ...requiredTable, readonly: true }),
    field('originalValue', '资产原值', 'number', required),
    field('residualRate', '预计净残值率（%）', 'number'),
    field('serviceLife', '预计使用年限', 'number', required),
    field('depreciationMethod', '折旧方法', 'select', {
      required: true,
      choices: choice(['平均年限法', '双倍余额递减法', '年数总和法'])
    }),
    field('startDate', '折旧开始日期', 'date'),
    field('accumulatedDepreciation', '累计折旧', 'number', table),
    field('netValue', '当前净值', 'number', table),
    field('methodDescription', '折旧方法说明', 'textarea')
  ],
  'equipment-ledger': [
    field('recordNo', '设备编号', 'text', { ...requiredTable, section: '基础信息' }),
    field('name', '设备名称', 'text', { ...requiredTable, section: '基础信息' }),
    field('shortName', '设备简称', 'text', { section: '基础信息' }),
    field('category', '设备分类', 'catalog-reference', {
      ...requiredTable,
      section: '基础信息',
      referenceModuleCode: 'equipment-category'
    }),
    field('storageLocation', '存放位置', 'catalog-reference', {
      ...requiredTable,
      section: '基础信息',
      referenceModuleCode: 'storage-location'
    }),
    field('model', '规格型号', 'text', { ...table, section: '基础信息' }),
    field('internalNo', '内部编号', 'text', { section: '基础信息' }),
    field('registrationCode', '注册代码', 'text', { section: '基础信息' }),
    field('licenseNo', '使用证号', 'text', { section: '基础信息' }),
    field('equipmentLevel', '设备等级', 'text', { section: '基础信息' }),
    field('equipmentType', '设备类型', 'text', { section: '基础信息' }),
    field('measurementUnit', '计量单位', 'text', { section: '基础信息' }),
    field('operationStatus', '运行状态', 'select', {
      choices: choice(['运行', '停用', '检修', '报废']),
      section: '基础信息'
    }),
    field('importanceLevel', '重要级别', 'select', {
      choices: choice(['一般', '重要', '关键']),
      section: '基础信息'
    }),
    field('workshopLine', '车间产线', 'text', { section: '组织与位置' }),
    field('processName', '工序', 'text', { section: '组织与位置' }),
    field('equipmentPositionNo', '设备位号', 'text', { section: '组织与位置' }),
    field('responsiblePerson', '设备责任人', 'employee', {
      ...table,
      section: '组织与位置'
    }),
    field('operationManager', '运行负责人', 'employee', { section: '组织与位置' }),
    field('maintenanceManager', '检修负责人', 'employee', { section: '组织与位置' }),
    field('usingDepartment', '使用部门', 'text', { section: '组织与位置' }),
    field('managementDepartment', '管理部门', 'text', { section: '组织与位置' }),
    field('workCenter', '工作中心', 'text', { section: '组织与位置' }),
    field('teamName', '班组', 'text', { section: '组织与位置' }),
    field('equipmentArea', '设备区域', 'text', { section: '组织与位置' }),
    field('installationLocation', '安装位置', 'text', { section: '组织与位置' }),
    field('supplierName', '供应商', 'supplier-reference', { section: '投产与资产' }),
    field('supplierCode', '供应商编码', 'text', { readonly: true, section: '投产与资产' }),
    field('manufacturer', '制造厂家', 'text', { section: '投产与资产' }),
    field('factoryNo', '出厂编号', 'text', { section: '投产与资产' }),
    field('productionDate', '生产日期', 'date', { section: '投产与资产' }),
    field('factoryDate', '出厂日期', 'date', { section: '投产与资产' }),
    field('entryDate', '进场日期', 'date', { section: '投产与资产' }),
    field('installationDate', '安装日期', 'date', { section: '投产与资产' }),
    field('commissioningDate', '投运日期', 'date', { section: '投产与资产' }),
    field('acceptanceDate', '验收日期', 'date', { section: '投产与资产' }),
    field('maintenanceUnit', '维护单位', 'text', { section: '投产与资产' }),
    field('installationUnit', '安装单位', 'text', { section: '投产与资产' }),
    field('assetStatus', '资产状态', 'select', {
      choices: choice(['在用', '闲置', '处置中', '已报废']),
      section: '投产与资产'
    }),
    field('equipmentStatus', '设备状态', 'text', { section: '投产与资产' }),
    field('usageStatus', '使用状态', 'text', { section: '投产与资产' }),
    field('serviceLifeYears', '设备寿命/年', 'number', { section: '投产与资产' }),
    field('usedYears', '已使用年限', 'number', { section: '投产与资产' }),
    field('assetValue', '设备原值', 'number', { section: '投产与资产' }),
    field('netValue', '净值', 'number', { section: '投产与资产' }),
    field('fixedAssetNo', '固定资产编码', 'text', { section: '投产与资产' }),
    field('erpNo', 'ERP编码', 'text', { section: '投产与资产' }),
    field('mainParameters', '主要参数', 'textarea', { section: '设备参数' }),
    field('totalWeight', '总质量', 'number', { section: '设备参数' }),
    field('motorCount', '电机数量', 'number', { section: '设备参数' }),
    field('appearanceQuality', '外形质量', 'text', { section: '设备参数' }),
    field('motorPower', '电机功率', 'number', { section: '设备参数' }),
    field('electronicTagCode', '电子标签码', 'text', { section: '设备参数' }),
    field('smartThreeColorLight', '智能三色灯', 'text', { section: '设备参数' }),
    field('pulseInterval', '脉冲间隔', 'number', { section: '设备参数' }),
    field('andonBox', '安灯盒子', 'text', { section: '设备参数' }),
    field('standardUtilizationRate', '标准利用率', 'number', { section: '设备参数' }),
    field('ipAddress', 'IP地址', 'text', { section: '设备参数' }),
    field('qrCodeValue', '二维码内容', 'text', { section: '设备参数' }),
    field('equipmentImageUrl', '设备主体图片', 'image', { section: '设备参数' }),
    field('remark', '设备说明', 'textarea', { section: '设备参数' })
  ],
  'equipment-attachment': [
    field('recordNo', '附件编号', 'text', requiredTable),
    field('equipmentName', '关联设备', 'text', requiredTable),
    field('attachmentType', '附件类型', 'select', {
      choices: choice(['设备图纸', '说明书', '合格证', '采购资料', '维保资料', '其他'])
    }),
    field('name', '文件名称', 'text', requiredTable),
    field('version', '版本号', 'text', table),
    field('effectiveDate', '生效日期', 'date'),
    field('attachmentUrl', '资源库文件地址', 'text', required),
    field('remark', '附件说明', 'textarea')
  ],
  'external-inspection': [
    ...equipmentInspectionFields('外部检验'),
    field('waterQualityPreviousInspectionDate', '水质上次检验日期', 'date'),
    field('waterQualityNextInspectionDate', '水质下次检验日期', 'date', {
      visibleWhen: { key: 'needsNextInspection', value: true }
    })
  ],
  'internal-inspection': equipmentInspectionFields('内部检验'),
  'annual-inspection': equipmentInspectionFields('年度检验'),
  'periodic-inspection': equipmentInspectionFields('定期检验'),
  'special-equipment-personnel': certificateFields('人员类别', [
    field('equipmentCategory', '特种设备类别', 'text', table)
  ]),
  'special-equipment-operator': certificateFields('作业项目', [
    field('operationCode', '作业项目代号', 'text'),
    field('employerName', '聘用单位', 'text')
  ]),
  'special-operation-category': [
    field('code', '作业类别编码', 'text', requiredTable),
    field('name', '特种作业类别', 'text', requiredTable),
    field('parentName', '上级类别', 'text', table),
    field('reviewCycle', '复审周期（月）', 'number', table),
    field('applicablePositions', '适用岗位', 'textarea'),
    field('enabledStatus', '启用状态', 'select', { choices: choice(['启用', '停用']) }),
    field('remark', '说明', 'textarea')
  ],
  'special-operation-certificate': certificateFields('特种作业类别'),
  'safety-manager-certificate': certificateFields('证书类别', [
    field('personnelType', '人员类型', 'select', {
      choices: choice(['主要负责人', '安全管理人员'])
    })
  ]),
  'registered-safety-engineer': certificateFields('注册专业', [
    field('registrationUnit', '注册单位', 'text'),
    field('registrationCategory', '注册类别', 'text')
  ]),
  'qualification-analysis': analysisFields('安全资质'),
  'training-plan': [
    field('recordNo', '培训计划编号', 'text', requiredTable),
    field('name', '培训主题', 'text', requiredTable),
    field('trainingType', '培训类型', 'select', {
      choices: choice(['入职培训', '年度培训', '专项培训', '复工培训', '应急培训'])
    }),
    field('organizationName', '培训部门', 'text', table),
    field('ownerName', '负责人', 'employee', table),
    field('startDate', '计划开始', 'date', required),
    field('endDate', '计划结束', 'date', required),
    field('trainingHours', '计划学时', 'number'),
    field('participantScope', '参训范围', 'textarea'),
    field('content', '培训内容与目标', 'textarea', required),
    field('assessmentMethod', '考核方式', 'text'),
    field('status', '计划状态', 'select', { choices: statusChoices })
  ],
  'training-record': [
    field('recordNo', '培训记录编号', 'text', requiredTable),
    field('planName', '关联培训计划', 'text', requiredTable),
    field('name', '培训主题', 'text', requiredTable),
    field('courseName', '培训课程', 'text', table),
    field('trainerName', '讲师', 'employee', table),
    field('occurredAt', '培训时间', 'datetime', required),
    field('location', '培训地点', 'text'),
    field('attendeeCount', '应到人数', 'number'),
    field('checkinCount', '签到人数', 'number'),
    field('qualifiedCount', '考核合格人数', 'number'),
    field('trainingHours', '培训学时', 'number'),
    field('content', '培训内容/签到说明', 'textarea'),
    field('attachmentDescription', '签到表/照片附件说明', 'textarea')
  ],
  'training-analysis': analysisFields('培训'),
  'course-management': [
    field('recordNo', '课程编号', 'text', requiredTable),
    field('name', '课程名称', 'text', requiredTable),
    field('courseCategory', '课程分类', 'text', table),
    field('courseType', '课件类型', 'select', {
      choices: choice(['视频', 'PDF课件', '图文课程', '线下课程'])
    }),
    field('trainingHours', '标准学时', 'number', table),
    field('lecturerName', '讲师', 'employee'),
    field('applicablePositions', '适用岗位', 'textarea'),
    field('coursewareUrl', '课件资源地址', 'text'),
    field('content', '课程简介', 'textarea'),
    field('status', '发布状态', 'select', { choices: choice(['草稿', '已发布', '已下架']) })
  ],
  'exam-management': [
    field('recordNo', '考试编号', 'text', requiredTable),
    field('name', '考试名称', 'text', requiredTable),
    field('examCategory', '考试分类', 'text', table),
    field('paperMode', '组卷方式', 'select', { choices: choice(['固定试卷', '随机组卷']) }),
    field('startDate', '考试开始时间', 'datetime', requiredTable),
    field('endDate', '考试结束时间', 'datetime', required),
    field('durationMinutes', '答题时长（分钟）', 'number'),
    field('totalScore', '试卷总分', 'number'),
    field('passingScore', '合格分数', 'number'),
    field('attemptLimit', '考试次数', 'number'),
    field('participantScope', '参考人员/范围', 'textarea'),
    field('status', '考试状态', 'select', {
      choices: choice(['未开始', '进行中', '已结束', '已发布成绩'])
    })
  ],
  'question-bank': [
    field('recordNo', '题目编号', 'text', requiredTable),
    field('name', '题目摘要', 'text', requiredTable),
    field('questionCategory', '题库分类', 'text', table),
    field('questionType', '题型', 'select', {
      choices: choice(['单选题', '多选题', '判断题'])
    }),
    field('difficulty', '难度', 'select', { choices: choice(['容易', '一般', '困难']) }),
    field('score', '建议分值', 'number'),
    field('questionContent', '题干', 'textarea', required),
    field('optionContent', '选项（每行一项）', 'textarea'),
    field('correctAnswer', '正确答案', 'text', required),
    field('answerAnalysis', '答案解析', 'textarea'),
    field('status', '启用状态', 'select', { choices: choice(['启用', '停用']) })
  ],
  'major-hazard-ledger': [
    field('recordNo', '危险源编号', 'text', requiredTable),
    field('name', '重大危险源名称', 'text', requiredTable),
    field('hazardLevel', '危险源等级', 'select', { choices: riskChoices, table: true }),
    field('location', '所在位置', 'text', requiredTable),
    field('hazardousMedium', '危险介质/物质', 'text'),
    field('criticalQuantity', '临界量', 'number'),
    field('actualQuantity', '实际量', 'number'),
    field('responsiblePerson', '责任人', 'employee', table),
    field('monitoringMeasures', '监测监控措施', 'textarea'),
    field('emergencyMeasures', '应急处置措施', 'textarea'),
    field('attachmentDescription', '备案/现场附件说明', 'textarea')
  ],
  'emergency-plan': [
    field('recordNo', '预案编号', 'text', requiredTable),
    field('name', '预案名称', 'text', requiredTable),
    field('planType', '预案类型', 'select', {
      choices: choice(['综合应急预案', '专项应急预案', '现场处置方案'])
    }),
    field('version', '版本号', 'text', table),
    field('responsibleDepartment', '责任部门', 'text', table),
    field('ownerName', '负责人', 'employee'),
    field('effectiveDate', '生效日期', 'date'),
    field('reviewDate', '下次评审日期', 'date'),
    field('scope', '适用范围', 'textarea'),
    field('attachmentDescription', '预案文件说明', 'textarea'),
    field('status', '预案状态', 'select', { choices: statusChoices })
  ],
  'emergency-drill-plan': [
    field('recordNo', '演练计划编号', 'text', requiredTable),
    field('name', '演练主题', 'text', requiredTable),
    field('planName', '关联应急预案', 'text', table),
    field('drillType', '演练类型', 'select', {
      choices: choice(['综合演练', '专项演练', '桌面推演'])
    }),
    field('ownerName', '组织负责人', 'employee', table),
    field('startDate', '计划日期', 'date', required),
    field('location', '演练地点', 'text'),
    field('participantScope', '参与部门与人员', 'textarea'),
    field('scenario', '演练场景', 'textarea'),
    field('objective', '演练目标', 'textarea'),
    field('status', '计划状态', 'select', { choices: statusChoices })
  ],
  'emergency-drill-record': [
    field('recordNo', '演练记录编号', 'text', requiredTable),
    field('name', '演练主题', 'text', requiredTable),
    field('planName', '关联演练计划', 'text', table),
    field('occurredAt', '实际演练时间', 'datetime', requiredTable),
    field('location', '演练地点', 'text'),
    field('commanderName', '总指挥', 'employee'),
    field('participantCount', '参与人数', 'number'),
    field('processSummary', '演练过程', 'textarea'),
    field('issues', '发现问题', 'textarea'),
    field('improvementMeasures', '改进措施', 'textarea'),
    field('evaluation', '演练评价', 'textarea'),
    field('attachmentDescription', '照片/签到/视频说明', 'textarea')
  ],
  'emergency-drill-analysis': analysisFields('应急演练'),
  'casualty-quick-report': [
    field('recordNo', '事故快报编号', 'text', requiredTable),
    field('name', '事故名称', 'text', requiredTable),
    field('occurredAt', '事故发生时间', 'datetime', requiredTable),
    field('location', '事故地点', 'text', requiredTable),
    field('accidentType', '事故类型', 'text'),
    field('accidentLevel', '事故等级', 'select', { choices: riskChoices }),
    field('injuryCount', '受伤人数', 'number'),
    field('fatalityCount', '死亡人数', 'number'),
    field('directLoss', '直接经济损失', 'number'),
    field('reporterName', '报告人', 'employee'),
    field('initialCause', '初步原因', 'textarea'),
    field('emergencyResponse', '现场处置情况', 'textarea'),
    field('attachmentDescription', '现场附件说明', 'textarea')
  ],
  'work-injury-declaration': [
    field('applicationNo', '工伤申报编号', 'text', requiredTable),
    field('employeeName', '受伤员工', 'employee', requiredTable),
    field('departmentName', '所属部门', 'text', table),
    field('occurredAt', '事故时间', 'datetime', requiredTable),
    field('workInjuryType', '工伤类型', 'text'),
    field('medicalInstitution', '就诊医院', 'text'),
    field('medicalFee', '医疗费用', 'number'),
    field('lostWorkDays', '误工天数', 'number'),
    field('declarationDate', '申报日期', 'date'),
    field('recognitionStatus', '认定状态', 'select', {
      choices: choice(['待申报', '申报中', '已认定', '未认定'])
    }),
    field('injuryDescription', '受伤经过与部位', 'textarea'),
    field('attachmentDescription', '申报材料说明', 'textarea')
  ],
  'accident-analysis': analysisFields('事故管理'),
  'work-injury-document': certificateFields('工伤证件类型', [
    field('injuryRecordNo', '关联工伤申报', 'text'),
    field('disabilityLevel', '伤残等级', 'text')
  ]),
  'historical-accident-case': [
    field('recordNo', '案例编号', 'text', requiredTable),
    field('name', '事故案例名称', 'text', requiredTable),
    field('accidentType', '事故类型', 'text', table),
    field('accidentLevel', '事故等级', 'select', { choices: riskChoices, table: true }),
    field('occurredAt', '发生时间', 'datetime'),
    field('location', '发生地点', 'text'),
    field('accidentProcess', '事故经过', 'textarea'),
    field('causeAnalysis', '原因分析', 'textarea'),
    field('lessons', '事故教训', 'textarea'),
    field('preventiveMeasures', '防范措施', 'textarea'),
    field('attachmentDescription', '案例附件说明', 'textarea')
  ],
  'safety-accident-statistics': analysisFields('安全事故'),
  'ppe-category': categoryFields('防护用品类别'),
  'ppe-issue-standard': issueStandardFields('防护用品'),
  'ppe-personal-standard': personalStandardFields('防护用品'),
  'ppe-issue-record': issueRecordFields('防护用品'),
  'ppe-personal-claim': claimFields('防护用品'),
  'tool-category': categoryFields('工器具类别'),
  'tool-issue-standard': issueStandardFields('工器具'),
  'tool-personal-standard': personalStandardFields('工器具'),
  'tool-issue-record': issueRecordFields('工器具'),
  'tool-personal-claim': claimFields('工器具'),
  'tool-return': [
    ...claimFields('工器具'),
    field('borrowedAt', '借用时间', 'datetime'),
    field('returnedAt', '归还时间', 'datetime'),
    field('returnCondition', '归还状态', 'select', {
      choices: choice(['完好', '损坏', '遗失'])
    }),
    field('damageDescription', '损坏/遗失说明', 'textarea')
  ],
  'violation-education': [
    field('recordNo', '教育记录编号', 'text', requiredTable),
    field('employeeName', '违章人员', 'employee', requiredTable),
    field('departmentName', '所属部门', 'text', table),
    field('violationRecordNo', '关联违章记录', 'text', table),
    field('occurredAt', '教育时间', 'datetime'),
    field('educatorName', '教育人', 'employee'),
    field('educationContent', '教育内容', 'textarea'),
    field('examScore', '教育考试成绩', 'number'),
    field('result', '教育结果', 'select', { choices: resultChoices }),
    field('attachmentDescription', '签到/照片附件说明', 'textarea')
  ],
  'violation-category': [
    field('code', '违章分类编码', 'text', requiredTable),
    field('name', '违章分类名称', 'text', requiredTable),
    field('parentName', '上级分类', 'text', table),
    field('violationLevel', '违章级别', 'select', { choices: choice(['一般', '严重', '重大']) }),
    field('deductionScore', '扣分值', 'number'),
    field('penaltyRule', '处罚规则', 'textarea'),
    field('educationRequirement', '教育要求', 'textarea')
  ],
  'anti-violation-standard': [
    field('standardNo', '标准编号', 'text', requiredTable),
    field('name', '违章行为', 'text', requiredTable),
    field('category', '违章分类', 'text', table),
    field('violationLevel', '违章级别', 'select', {
      choices: choice(['一般', '严重', '重大']),
      table: true
    }),
    field('deductionScore', '扣分值', 'number'),
    field('judgementBasis', '判定依据', 'textarea'),
    field('penaltyMeasures', '处理标准', 'textarea'),
    field('educationContent', '教育内容', 'textarea'),
    field('relatedQuestion', '关联考试题目', 'textarea')
  ],
  'violation-record': [
    field('recordNo', '违章记录编号', 'text', requiredTable),
    field('employeeName', '违章人员', 'employee', requiredTable),
    field('violationStandard', '违章标准', 'text', requiredTable),
    field('occurredAt', '违章时间', 'datetime', requiredTable),
    field('location', '违章地点', 'text'),
    field('discovererName', '发现人', 'employee'),
    field('violationDescription', '违章事实', 'textarea', required),
    field('handlingOpinion', '处理意见', 'textarea'),
    field('rectificationResult', '整改结果', 'textarea'),
    field('attachmentDescription', '现场照片/附件说明', 'textarea')
  ],
  'safety-knowledge': [
    field('recordNo', '知识编号', 'text', requiredTable),
    field('name', '知识主题', 'text', requiredTable),
    field('category', '知识分类', 'text', table),
    field('applicablePositions', '适用岗位', 'text', table),
    field('version', '版本', 'text'),
    field('content', '应知应会内容', 'textarea', required),
    field('attachmentDescription', '学习材料说明', 'textarea'),
    field('status', '发布状态', 'select', { choices: choice(['草稿', '已发布', '已废止']) })
  ],
  'safety-regulation': [
    field('recordNo', '制度编号', 'text', requiredTable),
    field('name', '制度名称', 'text', requiredTable),
    field('category', '制度分类', 'text', table),
    field('version', '版本号', 'text', table),
    field('applicableScope', '适用范围', 'textarea'),
    field('effectiveDate', '生效日期', 'date'),
    field('reviewDate', '复审日期', 'date'),
    field('publisherName', '发布人', 'employee'),
    field('content', '制度摘要', 'textarea'),
    field('attachmentDescription', '制度正文/修订附件说明', 'textarea'),
    field('status', '制度状态', 'select', {
      choices: choice(['草稿', '已发布', '已修订', '已废止'])
    })
  ],
  'hazard-factor-category': categoryFields('危害因素类别'),
  'risk-level-control': [
    field('standardNo', '管控清单编号', 'text', requiredTable),
    field('name', '风险点/危害因素', 'text', requiredTable),
    field('riskLevel', '风险等级', 'select', { choices: riskChoices, table: true }),
    field('controlLevel', '管控层级', 'select', {
      choices: choice(['公司级', '部门级', '班组级', '岗位级'])
    }),
    field('responsiblePerson', '责任人', 'employee', table),
    field('inspectionCycle', '巡查周期', 'text'),
    field('engineeringMeasures', '工程技术措施', 'textarea'),
    field('managementMeasures', '管理措施', 'textarea'),
    field('trainingMeasures', '培训教育措施', 'textarea'),
    field('ppeMeasures', '个体防护措施', 'textarea'),
    field('emergencyMeasures', '应急处置措施', 'textarea')
  ],
  'risk-inspection-task': [
    field('applicationNo', '巡查任务编号', 'text', requiredTable),
    field('name', '巡查任务名称', 'text', requiredTable),
    field('riskPointName', '风险点', 'text', requiredTable),
    field('riskLevel', '风险等级', 'select', { choices: riskChoices }),
    field('applicantName', '执行人', 'employee', table),
    field('startAt', '计划开始', 'datetime'),
    field('endAt', '计划完成', 'datetime'),
    field('inspectionItems', '巡查项目', 'textarea'),
    field('executionResult', '执行结果', 'textarea'),
    field('exceptionDescription', '异常情况', 'textarea'),
    field('status', '任务状态', 'select', {
      choices: choice(['待执行', '执行中', '已完成', '已转交', '已取消'])
    })
  ],
  'risk-assessment-standard': [
    field('standardNo', '标准编号', 'text', requiredTable),
    field('name', '评价标准名称', 'text', requiredTable),
    field('assessmentMethod', '评价方法', 'select', {
      choices: choice(['LEC', 'LS']),
      table: true
    }),
    field('riskLevel', '对应风险等级', 'select', { choices: riskChoices, table: true }),
    field('lowerBound', '分值下限', 'number'),
    field('upperBound', '分值上限', 'number'),
    field('probabilityRule', '可能性/事故发生可能性规则', 'textarea'),
    field('exposureRule', '暴露频次/事件发生频率规则', 'textarea'),
    field('consequenceRule', '后果严重程度规则', 'textarea'),
    field('controlRequirement', '管控要求', 'textarea')
  ],
  'risk-four-color-map': [
    field('reportPeriod', '图版版本', 'text', requiredTable),
    field('name', '场所/区域四色图', 'text', requiredTable),
    field('organizationName', '所属组织', 'text', table),
    field('floorName', '楼层/区域', 'text', table),
    field('criticalCount', '重大风险点数', 'number'),
    field('majorCount', '较大风险点数', 'number'),
    field('generalCount', '一般风险点数', 'number'),
    field('lowCount', '低风险点数', 'number'),
    field('mapResourceUrl', '平面图资源地址', 'text'),
    field('summary', '图版说明', 'textarea')
  ],
  'quantitative-risk-control': analysisFields('风险定量评价与管控'),
  'inspection-plan': [
    field('recordNo', '排查计划编号', 'text', requiredTable),
    field('name', '排查计划名称', 'text', requiredTable),
    field('inspectionType', '排查类型', 'text', table),
    field('organizationName', '执行组织', 'text', table),
    field('ownerName', '负责人', 'employee'),
    field('cycle', '排查周期', 'select', { choices: choice(['日', '周', '月', '季', '年']) }),
    field('startDate', '计划开始日期', 'date'),
    field('endDate', '计划结束日期', 'date'),
    field('inspectionScope', '排查范围', 'textarea'),
    field('inspectionItems', '排查内容', 'textarea'),
    field('status', '计划状态', 'select', { choices: statusChoices })
  ],
  'inspection-task': [
    field('applicationNo', '排查任务编号', 'text', requiredTable),
    field('name', '排查任务名称', 'text', requiredTable),
    field('planName', '关联排查计划', 'text', table),
    field('inspectionType', '排查类型', 'text', table),
    field('applicantName', '排查人', 'employee', table),
    field('startAt', '计划开始', 'datetime'),
    field('endAt', '计划完成', 'datetime'),
    field('inspectionItems', '排查项目', 'textarea'),
    field('resultSummary', '排查结论', 'textarea'),
    field('dangerCount', '发现隐患数', 'number'),
    field('status', '任务状态', 'select', {
      choices: choice(['待执行', '执行中', '已完成', '已转交', '已取消'])
    })
  ],
  'danger-governance': [
    field('applicationNo', '隐患编号', 'text', requiredTable),
    field('name', '隐患描述', 'text', requiredTable),
    field('dangerSource', '隐患来源', 'text', table),
    field('riskLevel', '隐患等级', 'select', { choices: riskChoices, table: true }),
    field('workLocation', '隐患位置', 'text'),
    field('applicantName', '上报人', 'employee'),
    field('responsiblePerson', '整改责任人', 'employee', table),
    field('deadline', '整改期限', 'date'),
    field('rectificationMeasures', '整改措施', 'textarea'),
    field('rectificationResult', '整改结果', 'textarea'),
    field('reviewResult', '复查结论', 'textarea'),
    field('status', '治理状态', 'select', {
      choices: choice(['待审核', '待整改', '整改中', '待复查', '已销号', '已退回'])
    }),
    field('attachmentDescription', '前后对比附件说明', 'textarea')
  ],
  'inspection-form': [
    field('standardNo', '排查表编号', 'text', requiredTable),
    field('name', '排查表名称', 'text', requiredTable),
    field('category', '排查类型', 'text', table),
    field('riskPointName', '适用风险点/岗位', 'text', table),
    field('inspectionItem', '排查项目', 'textarea', required),
    field('inspectionStandard', '排查标准', 'textarea', required),
    field('cycle', '建议频次', 'text'),
    field('status', '启用状态', 'select', { choices: choice(['启用', '停用']) })
  ],
  'safety-inspection': [
    field('recordNo', '安全检查编号', 'text', requiredTable),
    field('name', '检查主题', 'text', requiredTable),
    field('inspectionType', '检查类型', 'select', {
      choices: choice(['综合检查', '专项检查', '季节检查', '节假日检查'])
    }),
    field('occurredAt', '检查时间', 'datetime', requiredTable),
    field('location', '检查区域', 'text'),
    field('leaderName', '检查负责人', 'employee'),
    field('inspectorNames', '检查人员', 'textarea'),
    field('inspectionItems', '检查内容', 'textarea'),
    field('dangerCount', '发现问题数', 'number'),
    field('content', '检查结论', 'textarea'),
    field('attachmentDescription', '检查照片/附件说明', 'textarea')
  ],
  'inspection-rectification': [
    field('applicationNo', '整改任务编号', 'text', requiredTable),
    field('name', '整改问题', 'text', requiredTable),
    field('inspectionRecordNo', '关联安全检查', 'text', table),
    field('riskLevel', '问题等级', 'select', { choices: riskChoices, table: true }),
    field('responsiblePerson', '整改责任人', 'employee', table),
    field('deadline', '整改期限', 'date'),
    field('rectificationRequirements', '整改要求', 'textarea'),
    field('rectificationResult', '整改结果', 'textarea'),
    field('acceptancePerson', '验收人', 'employee'),
    field('acceptanceResult', '验收结论', 'select', { choices: resultChoices }),
    field('status', '整改状态', 'select', {
      choices: choice(['待整改', '整改中', '待验收', '已完成', '已退回'])
    })
  ],
  'inspection-type': [
    field('code', '排查类型编码', 'text', requiredTable),
    field('name', '排查类型名称', 'text', requiredTable),
    field('cycle', '默认周期', 'text', table),
    field('applicableScope', '适用范围', 'textarea'),
    field('enabledStatus', '启用状态', 'select', { choices: choice(['启用', '停用']) }),
    field('remark', '说明', 'textarea')
  ],
  'snapshot-report': [
    field('recordNo', '随手拍编号', 'text', requiredTable),
    field('name', '隐患简述', 'text', requiredTable),
    field('occurredAt', '上报时间', 'datetime', requiredTable),
    field('location', '现场位置', 'text', requiredTable),
    field('reporterName', '上报人', 'employee', table),
    field('riskLevel', '建议等级', 'select', { choices: riskChoices }),
    field('content', '现场描述', 'textarea', required),
    field('locationCoordinates', '定位坐标', 'text'),
    field('attachmentDescription', '现场照片说明', 'textarea'),
    field('status', '受理状态', 'select', {
      choices: choice(['待受理', '已受理', '处理中', '已完成', '不予受理'])
    })
  ],
  'public-danger-report': [
    field('applicationNo', '举报编号', 'text', requiredTable),
    field('name', '隐患标题', 'text', requiredTable),
    field('reporterName', '举报人', 'text', table),
    field('contactInformation', '联系方式', 'text'),
    field('workLocation', '隐患地点', 'text', requiredTable),
    field('occurredAt', '举报时间', 'datetime'),
    field('dangerDescription', '隐患描述', 'textarea', required),
    field('verifierName', '核实人', 'employee'),
    field('verificationResult', '核实结果', 'textarea'),
    field('handlingResult', '处置结果', 'textarea'),
    field('status', '受理状态', 'select', {
      choices: choice(['待受理', '核实中', '处理中', '已办结', '无效举报'])
    })
  ],
  'danger-statistics': analysisFields('隐患治理'),
  'special-work-management': [
    field('applicationNo', '作业票编号', 'text', requiredTable),
    field('name', '作业项目', 'text', requiredTable),
    field('workType', '特殊作业类型', 'select', {
      choices: choice([
        '动火',
        '高处',
        '吊装',
        '受限空间',
        '临时用电',
        '断路',
        '盲板抽堵',
        '其他危险作业'
      ]),
      table: true
    }),
    field('workLocation', '作业地点', 'text', table),
    field('applicantName', '申请人', 'employee'),
    field('startAt', '作业开始时间', 'datetime'),
    field('endAt', '作业结束时间', 'datetime'),
    field('status', '作业票状态', 'select', {
      choices: choice(['草稿', '审批中', '已批准', '作业中', '已关闭', '已作废'])
    }),
    field('safetyMeasures', '核心安全措施', 'textarea')
  ],
  'hot-work': specialWorkFields('动火作业', [
    field('hotWorkMode', '动火方式', 'text'),
    field('gasAnalysis', '可燃/有毒气体分析结果', 'textarea')
  ]),
  'work-at-height': specialWorkFields('高处作业', [
    field('heightMeters', '作业高度（米）', 'number'),
    field('fallProtection', '坠落防护方式', 'textarea')
  ]),
  'lifting-work': specialWorkFields('吊装作业', [
    field('liftingWeight', '吊装重量', 'number'),
    field('craneName', '吊装设备', 'text'),
    field('commanderName', '指挥人员', 'employee')
  ]),
  'confined-space-work': specialWorkFields('受限空间作业', [
    field('spaceName', '受限空间名称', 'text'),
    field('gasAnalysis', '氧气/可燃/有毒气体分析', 'textarea'),
    field('rescueEquipment', '应急救援器材', 'textarea')
  ]),
  'temporary-electricity': specialWorkFields('临时用电作业', [
    field('powerLevel', '电压等级', 'text'),
    field('distributionBox', '配电箱编号', 'text'),
    field('electricianName', '持证电工', 'employee')
  ]),
  'road-breaking-work': specialWorkFields('断路作业', [
    field('affectedRoad', '影响道路/区域', 'text'),
    field('trafficPlan', '交通组织方案', 'textarea')
  ]),
  'blind-plate-work': specialWorkFields('盲板抽堵作业', [
    field('mediumName', '管道介质', 'text'),
    field('blindPlateNo', '盲板编号', 'text'),
    field('pipelinePressure', '管道压力', 'text')
  ]),
  'hazardous-work': specialWorkFields('危险作业', [
    field('hazardType', '危险作业类别', 'text'),
    field('hazardAnalysis', '危险/环境因素分析', 'textarea')
  ]),
  'hazardous-waste-inbound': [
    field('recordNo', '入库单号', 'text', requiredTable),
    field('wasteName', '危废名称', 'text', requiredTable),
    field('wasteCode', '危废代码', 'text', requiredTable),
    field('sourceDepartment', '产生部门', 'text', table),
    field('occurredAt', '入库时间', 'datetime', requiredTable),
    field('warehouseLocation', '贮存位置', 'text'),
    field('packageType', '包装方式', 'text'),
    field('quantity', '入库重量', 'number', required),
    field('unit', '计量单位', 'select', { choices: choice(['千克', '吨']) }),
    field('handlerName', '入库经办人', 'employee'),
    field('storageExpiryDate', '贮存期限', 'date'),
    field('remark', '备注', 'textarea')
  ],
  'hazardous-waste-outbound': [
    field('recordNo', '出库单号', 'text', requiredTable),
    field('manifestNo', '转移联单编号', 'text', requiredTable),
    field('wasteName', '危废名称', 'text', requiredTable),
    field('wasteCode', '危废代码', 'text', table),
    field('occurredAt', '出库时间', 'datetime', requiredTable),
    field('quantity', '出库重量', 'number', required),
    field('unit', '计量单位', 'select', { choices: choice(['千克', '吨']) }),
    field('receiverName', '接收单位', 'text'),
    field('transporterName', '运输单位', 'text'),
    field('vehicleNo', '运输车辆', 'text'),
    field('disposalMethod', '处置方式', 'text'),
    field('handlerName', '出库经办人', 'employee'),
    field('attachmentDescription', '联单/称重附件说明', 'textarea')
  ],
  'hazardous-waste-catalog': [
    field('code', '危废代码', 'text', requiredTable),
    field('name', '危废名称', 'text', requiredTable),
    field('category', '废物类别', 'text', requiredTable),
    field('industrySource', '行业来源', 'text', table),
    field('hazardousCharacteristics', '危险特性', 'select', {
      choices: choice(['腐蚀性', '毒性', '易燃性', '反应性', '感染性'])
    }),
    field('physicalForm', '物理形态', 'select', {
      choices: choice(['固态', '液态', '气态', '混合态'])
    }),
    field('packagingRequirement', '包装要求', 'textarea'),
    field('storageRequirement', '贮存要求', 'textarea'),
    field('disposalMethod', '处置方式', 'text'),
    field('remark', '备注', 'textarea')
  ]
}
