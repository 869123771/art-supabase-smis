export const SUPPLIER_DICTIONARY_CODES = [
  'supplierCategory',
  'supplierType',
  'enterpriseNature',
  'supplierIndustry'
] as const

export type SupplierDictionaryCode = (typeof SUPPLIER_DICTIONARY_CODES)[number]

export interface SupplierDictionaryOption {
  label: string
  value: string
}

const SUPPLIER_DICTIONARY_FALLBACKS: Record<SupplierDictionaryCode, SupplierDictionaryOption[]> = {
  supplierCategory: [
    { label: '检验机构', value: 'inspection_agency' },
    { label: '安装单位', value: 'installation_company' },
    { label: '维修单位', value: 'repair_company' },
    { label: '维保单位', value: 'maintenance_company' },
    { label: '材料供应商', value: 'material_supplier' }
  ],
  supplierType: [
    { label: '一般供应商', value: 'general' },
    { label: '重点供应商', value: 'key' }
  ],
  enterpriseNature: [
    { label: '国企', value: 'state_owned' },
    { label: '央企', value: 'central_state_owned' },
    { label: '外资', value: 'foreign_invested' },
    { label: '民营', value: 'private' }
  ],
  supplierIndustry: [
    { label: '煤炭矿业', value: 'coal_mining' },
    { label: '生产制造业', value: 'manufacturing' },
    { label: '物流运输', value: 'logistics_transportation' },
    { label: '科技服务', value: 'technology_services' }
  ]
}

export const getSupplierDictionaryOptions = (
  code: SupplierDictionaryCode,
  items?: Api.DataCenter.DictListItem[]
): SupplierDictionaryOption[] => {
  if (!items?.length) return SUPPLIER_DICTIONARY_FALLBACKS[code]

  return items.map((item) => ({
    label: String(item.label || item.name || item.value || ''),
    value: String(item.value ?? '')
  }))
}

export const resolveSupplierDictionaryLabel = (
  code: SupplierDictionaryCode,
  value?: string | null,
  items?: Api.DataCenter.DictListItem[]
): string =>
  getSupplierDictionaryOptions(code, items).find((item) => item.value === value)?.label ||
  value ||
  ''
