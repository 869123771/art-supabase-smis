import type { SmisQualificationCatalogType } from '@smis/api'

export const qualificationCatalogConfig: Record<
  SmisQualificationCatalogType,
  {
    title: string
    eyebrow: string
    icon: string
    permission: string
    description: string
    codePlaceholder: string
    namePlaceholder: string
  }
> = {
  work_item: {
    title: '作业项目',
    eyebrow: 'WORK ITEM TAXONOMY',
    icon: 'ri:tools-line',
    permission: 'SmisWorkItem',
    description: '维护特种设备相关作业项目层级，为人员证件项目关联提供统一口径。',
    codePlaceholder: '如 A1',
    namePlaceholder: '如 锅炉作业'
  },
  work_category: {
    title: '作业类别',
    eyebrow: 'WORK CATEGORY TAXONOMY',
    icon: 'ri:folder-settings-line',
    permission: 'SmisWorkCategory',
    description: '按业务层级管理作业类别，统一证件类别联动与资质统计口径。',
    codePlaceholder: '如 OPERATOR',
    namePlaceholder: '如 特种设备作业人员'
  },
  permitted_operation_item: {
    title: '准操项目',
    eyebrow: 'PERMITTED OPERATION TAXONOMY',
    icon: 'ri:shield-check-line',
    permission: 'SmisPermittedOperationItem',
    description: '维护人员获准操作项目层级，支持证件明细自动带出项目编码与名称。',
    codePlaceholder: '如 N1',
    namePlaceholder: '如 起重机指挥'
  }
}
