import {
  fetchEmployeeSelectorList,
  type EmployeeIntegrationItem
} from '@/api/integration/employees'
import { loadAllDocumentPages } from '@/utils/business/document-detail-list'
import { createImportReferenceLookup } from '@/utils/business/import-reference'
import { createTenantScopeReadGuard } from '@/utils/tenant-scope-context'
import type { IssuanceImportCodes } from './issuance-import-rows'
export {
  readIssuanceImportRows,
  resolveIssuanceImportRows,
  type IssuanceImportCodes,
  type IssuanceImportRow
} from './issuance-import-rows'
import {
  fetchMaterialList,
  fetchStorageLocationList,
  type SmisMaterial,
  type SmisMaterialSearchParams,
  type SmisStorageLocation,
  type SmisStorageLocationSearchParams
} from '@smis/api'

export interface IssuanceImportReferences {
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
  const resolveEmployee = createImportReferenceLookup(async (employeeNo) => {
    const records = await loadAllDocumentPages(fetchEmployeeSelectorList, {
      tenantId,
      keyword: employeeNo,
      from: 0
    })
    return records.filter((row) => row.tenantId === tenantId && row.employeeNo === employeeNo)
  })
  const resolveWarehouse = createImportReferenceLookup(async (locationCode) => {
    const records = await loadAllDocumentPages(fetchStorageLocationList, {
      keyword: locationCode,
      status: 'enabled',
      from: 0
    } satisfies SmisStorageLocationSearchParams)
    return records.filter((row) => row.tenantId === tenantId && row.locationCode === locationCode)
  })
  const resolveMaterial = createImportReferenceLookup(async (materialCode) => {
    const records = await loadAllDocumentPages(fetchMaterialList, {
      materialCode,
      materialType,
      status: 'enabled',
      from: 0
    } satisfies SmisMaterialSearchParams)
    return records.filter((row) => row.tenantId === tenantId && row.materialCode === materialCode)
  })
  return async (codes: IssuanceImportCodes) => {
    assertTenantScope()
    const [employee, issuer, warehouse, material] = await Promise.all([
      resolveEmployee(codes.employeeNo, `员工工号：${codes.employeeNo}`),
      resolveEmployee(codes.issuerEmployeeNo, `员工工号：${codes.issuerEmployeeNo}`),
      resolveWarehouse(codes.warehouseCode, `启用仓库编码：${codes.warehouseCode}`),
      resolveMaterial(
        codes.materialCode,
        `${materialType === 'tool' ? '工器具' : '防护用品'}编码：${codes.materialCode}`
      )
    ])
    assertTenantScope()
    return { employee, issuer, warehouse, material }
  }
}
