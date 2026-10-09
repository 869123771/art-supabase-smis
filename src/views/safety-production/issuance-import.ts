import { memoize } from 'lodash-es'
import {
  fetchEmployeeSelectorList,
  type EmployeeIntegrationItem
} from '@/api/integration/employees'
import { loadAllDocumentPages } from '@/utils/business/document-detail-list'
import { requireUniqueImportReference } from '@/utils/business/import-reference'
import { createTenantScopeReadGuard } from '@/utils/tenant-scope-context'
import {
  fetchMaterialList,
  fetchStorageLocationList,
  type SmisMaterial,
  type SmisMaterialSearchParams,
  type SmisStorageLocation,
  type SmisStorageLocationSearchParams
} from '@smis/api'

interface IssuanceImportCodes {
  employeeNo: string
  issuerEmployeeNo: string
  warehouseCode: string
  materialCode: string
}

interface IssuanceImportReferences {
  employee: EmployeeIntegrationItem
  issuer: EmployeeIntegrationItem
  warehouse: SmisStorageLocation
  material: SmisMaterial
}

/** A fresh resolver owns only one import batch, one write tenant and one material domain. */
export function createIssuanceImportLookup(
  tenantId: string,
  materialType: 'protective_equipment' | 'tool'
): (codes: IssuanceImportCodes) => Promise<IssuanceImportReferences> {
  const assertTenantScope = createTenantScopeReadGuard()
  const resolveEmployee = memoize(async (employeeNo: string) => {
    const records = await loadAllDocumentPages(fetchEmployeeSelectorList, {
      tenantId,
      keyword: employeeNo,
      from: 0
    })
    return requireUniqueImportReference(
      records.filter((row) => row.tenantId === tenantId && row.employeeNo === employeeNo),
      `员工工号：${employeeNo}`
    )
  })
  const resolveWarehouse = memoize(async (locationCode: string) => {
    const records = await loadAllDocumentPages(fetchStorageLocationList, {
      keyword: locationCode,
      status: 'enabled',
      from: 0
    } satisfies SmisStorageLocationSearchParams)
    return requireUniqueImportReference(
      records.filter((row) => row.tenantId === tenantId && row.locationCode === locationCode),
      `启用仓库编码：${locationCode}`
    )
  })
  const resolveMaterial = memoize(async (materialCode: string) => {
    const records = await loadAllDocumentPages(fetchMaterialList, {
      materialCode,
      materialType,
      status: 'enabled',
      from: 0
    } satisfies SmisMaterialSearchParams)
    return requireUniqueImportReference(
      records.filter((row) => row.tenantId === tenantId && row.materialCode === materialCode),
      `${materialType === 'tool' ? '工器具' : '防护用品'}编码：${materialCode}`
    )
  })
  return async (codes: IssuanceImportCodes) => {
    assertTenantScope()
    const [employee, issuer, warehouse, material] = await Promise.all([
      resolveEmployee(codes.employeeNo),
      resolveEmployee(codes.issuerEmployeeNo),
      resolveWarehouse(codes.warehouseCode),
      resolveMaterial(codes.materialCode)
    ])
    assertTenantScope()
    return { employee, issuer, warehouse, material }
  }
}
