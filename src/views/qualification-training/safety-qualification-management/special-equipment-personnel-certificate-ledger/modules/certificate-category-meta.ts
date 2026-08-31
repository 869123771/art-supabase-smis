import type { SmisCertificateCategory, SmisQualificationCatalogType } from '@smis/api'

export interface CertificateCategoryMeta {
  catalogType: SmisQualificationCatalogType
  detailTitle: string
  detailSubtitle: string
  workCodePrefixes?: readonly string[]
  showWorkCategory?: boolean
  certificateTermCode?: string
  showEmployeeProfile?: boolean
  employeeEducationLabel?: string
  approvalDateLabel?: string
  extraFields?: readonly {
    key: string
    label: string
    placeholder: string
    type?: 'input' | 'select'
    dictCode?: string
    required?: boolean
  }[]
}

const certificateCategoryMeta: Record<SmisCertificateCategory, CertificateCategoryMeta> = {
  special_equipment_personnel: {
    catalogType: 'work_item',
    detailTitle: '证件明细',
    detailSubtitle: '一个证件可关联多个 A 类作业项目；项目编码随选项自动带出',
    workCodePrefixes: ['A'],
    extraFields: [
      {
        key: 'equipmentType',
        label: '设备种类',
        placeholder: '如锅炉、压力容器'
      }
    ]
  },
  special_equipment_operator: {
    catalogType: 'work_item',
    detailTitle: '作业证件明细',
    detailSubtitle: '可维护 G、R、D、T、Q、N、F 类作业项目，项目代号随选择自动带出',
    workCodePrefixes: ['G', 'R', 'D', 'T', 'Q', 'N', 'F']
  },
  special_operation: {
    catalogType: 'permitted_operation_item',
    detailTitle: '准操项目明细',
    detailSubtitle: '先选择作业类别，再选择准操项目；项目代号随选项自动带出',
    showWorkCategory: true
  },
  safety_manager: {
    catalogType: 'certificate_term',
    detailTitle: '证件有效期',
    detailSubtitle: '维护发证日期、有效日期和到期提醒；日期变化自动形成复审记录',
    certificateTermCode: 'SAFETY_MANAGER',
    showEmployeeProfile: true,
    extraFields: [
      {
        key: 'unitType',
        label: '单位类型',
        placeholder: '请选择单位类型',
        type: 'select',
        dictCode: 'smisSafetyManagerUnitType',
        required: true
      },
      {
        key: 'occupationType',
        label: '职业类型',
        placeholder: '请选择职业类型',
        type: 'select',
        dictCode: 'smisSafetyManagerOccupationType',
        required: true
      }
    ]
  },
  registered_safety_engineer: {
    catalogType: 'certificate_term',
    detailTitle: '注册与有效期',
    detailSubtitle: '维护注册日期、有效日期和到期提醒；日期变化自动形成复审记录',
    certificateTermCode: 'REGISTERED_SAFETY_ENGINEER',
    showEmployeeProfile: true,
    employeeEducationLabel: '全日制学历',
    approvalDateLabel: '注册日期',
    extraFields: [
      {
        key: 'safetyOfficerType',
        label: '安全员类别',
        placeholder: '请选择安全员类别',
        type: 'select',
        dictCode: 'smisRegisteredSafetyOfficerType',
        required: true
      },
      {
        key: 'engineerType',
        label: '工程师类别',
        placeholder: '请选择工程师类别',
        type: 'select',
        dictCode: 'smisRegisteredEngineerType',
        required: true
      },
      {
        key: 'practiceCategory',
        label: '注册类别',
        placeholder: '请选择注册类别',
        type: 'select',
        dictCode: 'smisRegisteredPracticeCategory',
        required: true
      }
    ]
  }
}

export const getCertificateCategoryMeta = (
  category: SmisCertificateCategory
): CertificateCategoryMeta => certificateCategoryMeta[category]

export const isCatalogAllowedForCertificateCategory = (
  item: { catalogType: SmisQualificationCatalogType; itemCode: string },
  category: SmisCertificateCategory
): boolean => {
  const meta = getCertificateCategoryMeta(category)
  if (item.catalogType !== meta.catalogType) return false
  if (!meta.workCodePrefixes?.length) return true
  const normalizedCode = item.itemCode.trim().toUpperCase()
  return meta.workCodePrefixes.some((prefix) => normalizedCode.startsWith(prefix))
}
