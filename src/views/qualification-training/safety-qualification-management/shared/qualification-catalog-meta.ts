import type { SmisQualificationMaintenanceCatalogType } from '@smis/api'

export const qualificationCatalogConfig: Record<
  SmisQualificationMaintenanceCatalogType,
  {
    title: string
    eyebrow: string
    icon: string
    permissions: {
      view: string
      add: string
      edit: string
      delete: string
      export: string
    }
    description: string
    codePlaceholder: string
    namePlaceholder: string
  }
> = {
  work_item: {
    title: '作业项目',
    eyebrow: 'WORK ITEM TAXONOMY',
    icon: 'ri:tools-line',
    permissions: {
      view: 'SmisWorkItem:View',
      add: 'SmisWorkItem:Add',
      edit: 'SmisWorkItem:Edit',
      delete: 'SmisWorkItem:Delete',
      export: 'SmisWorkItem:Export'
    },
    description: '维护特种设备相关作业项目层级，为人员证件项目关联提供统一口径。',
    codePlaceholder: '如 A1',
    namePlaceholder: '如 锅炉作业'
  },
  work_category: {
    title: '作业类别',
    eyebrow: 'WORK CATEGORY TAXONOMY',
    icon: 'ri:folder-settings-line',
    permissions: {
      view: 'SmisWorkCategory:View',
      add: 'SmisWorkCategory:Add',
      edit: 'SmisWorkCategory:Edit',
      delete: 'SmisWorkCategory:Delete',
      export: 'SmisWorkCategory:Export'
    },
    description: '按业务层级管理作业类别，统一证件类别联动与资质统计口径。',
    codePlaceholder: '如 OPERATOR',
    namePlaceholder: '如 特种设备作业人员'
  },
  permitted_operation_item: {
    title: '准操项目',
    eyebrow: 'PERMITTED OPERATION TAXONOMY',
    icon: 'ri:shield-check-line',
    permissions: {
      view: 'SmisPermittedOperationItem:View',
      add: 'SmisPermittedOperationItem:Add',
      edit: 'SmisPermittedOperationItem:Edit',
      delete: 'SmisPermittedOperationItem:Delete',
      export: 'SmisPermittedOperationItem:Export'
    },
    description: '按作业类别维护准操项目树，支持证件明细自动带出准操项目代号与名称。',
    codePlaceholder: '如 1.1',
    namePlaceholder: '如 高压电工作业'
  }
}
