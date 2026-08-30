import dayjs from 'dayjs'
import { omit } from 'lodash-es'
import { useSupabase } from '@/hooks'
import TreeUtils from '@/utils/tree'
import type {
  SmisPersonnelCertificate,
  SmisPersonnelCertificateOverview,
  SmisPersonnelCertificateSavePayload,
  SmisPersonnelCertificateSearchParams,
  SmisQualificationCatalog,
  SmisQualificationCatalogOverview,
  SmisQualificationCatalogSavePayload,
  SmisQualificationCatalogSearchParams,
  SmisQualificationCatalogType
} from '@smis/api/types'

interface QualificationCatalogPayload {
  records?: SmisQualificationCatalog[]
  total?: number
  tree?: SmisQualificationCatalog[]
  overview?: SmisQualificationCatalogOverview
}

interface PersonnelCertificatePayload {
  records?: SmisPersonnelCertificate[]
  total?: number
  overview?: SmisPersonnelCertificateOverview
}

const treeUtils = new TreeUtils({ idKey: 'id', parentKey: 'parentId', childrenKey: 'children' })
const { supabase, keysToSnakeDeep, responseHandle } = useSupabase()

export async function fetchQualificationCatalogList(params: SmisQualificationCatalogSearchParams) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<QualificationCatalogPayload>(
    () =>
      supabase.rpc('smis_list_qualification_catalog_secure', {
        p_catalog_type: params.catalogType,
        p_from: from,
        p_to: Math.max(params.to ?? from + 99, from),
        p_keyword: params.keyword?.trim() || null,
        p_status: params.status || null,
        p_ancestor_id: params.ancestorId || null,
        p_purpose: params.purpose ?? 'list'
      }),
    { showErrorMessage: true }
  )
  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    tree: treeUtils.listToTree(
      result.data?.tree ?? [],
      (a, b) => a.sort - b.sort || a.itemName.localeCompare(b.itemName, 'zh-CN')
    ),
    overview: result.data?.overview ?? { total: 0, enabled: 0, disabled: 0, rootCount: 0 },
    error: result.error
  }
}

export async function saveQualificationCatalog(params: SmisQualificationCatalogSavePayload) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_qualification_catalog_secure', {
        p_id: params.id ?? null,
        p_payload: keysToSnakeDeep(omit(params, ['id']))
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.id ? '基础数据已更新' : '基础数据已新增'
    }
  )
}

export async function deleteQualificationCatalog(
  catalogType: SmisQualificationCatalogType,
  ids: string[]
) {
  return await responseHandle<number>(
    () =>
      supabase.rpc('smis_delete_qualification_catalog_secure', {
        p_catalog_type: catalogType,
        p_ids: ids
      }),
    { showMessage: true, breakReturn: true, message: '基础数据已删除' }
  )
}

export async function fetchPersonnelCertificateList(
  params: SmisPersonnelCertificateSearchParams = {}
) {
  const from = Math.max(params.from ?? 0, 0)
  const [startDate, endDate] = params.effectiveDateRange ?? []
  const result = await responseHandle<PersonnelCertificatePayload>(
    () =>
      supabase.rpc('smis_list_personnel_certificates_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_employee_name: params.employeeName?.trim() || null,
        p_certificate_number: params.certificateNumber?.trim() || null,
        p_certificate_category: params.certificateCategory || null,
        p_start_date: startDate ? dayjs(startDate).format('YYYY-MM-DD') : null,
        p_end_date: endDate ? dayjs(endDate).format('YYYY-MM-DD') : null,
        p_warning_status: params.warningStatus || null,
        p_purpose: params.purpose ?? 'list'
      }),
    { showErrorMessage: true }
  )
  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    overview: result.data?.overview ?? {
      total: 0,
      normal: 0,
      warning: 0,
      expired: 0,
      employees: 0
    },
    error: result.error
  }
}

export async function savePersonnelCertificate(params: SmisPersonnelCertificateSavePayload) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_personnel_certificate_secure', {
        p_id: params.id ?? null,
        p_payload: keysToSnakeDeep(omit(params, ['id']))
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.id ? '人员证件已更新' : '人员证件已新增'
    }
  )
}

export async function deletePersonnelCertificates(ids: string[]) {
  return await responseHandle<number>(
    () => supabase.rpc('smis_delete_personnel_certificates_secure', { p_ids: ids }),
    { showMessage: true, breakReturn: true, message: '人员证件已删除' }
  )
}
