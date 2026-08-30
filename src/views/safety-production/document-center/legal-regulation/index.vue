<template>
  <ArtPermissionGuard permission="SmisLegalRegulation:View" resource-name="法律法规">
    <DocumentRegisterWorkspace kind="legal_regulation" @compliance="openCompliance" />
    <LegalComplianceRecordsDialog ref="complianceDialogRef" />
  </ArtPermissionGuard>
</template>

<script setup lang="ts">
  import ArtPermissionGuard from '@/components/core/feedback/art-permission-guard/index.vue'
  import type { SmisDocumentRegister } from '@smis/api'
  import DocumentRegisterWorkspace from '../shared/document-register-workspace.vue'
  import LegalComplianceRecordsDialog, {
    type LegalComplianceRecordsDialogOpenData
  } from './modules/legal-compliance-records-dialog.vue'

  defineOptions({ name: 'SmisLegalRegulation' })

  interface ComplianceDialogExpose {
    handleOpen: (data: LegalComplianceRecordsDialogOpenData) => Promise<void>
  }

  const complianceDialogRef = ref<ComplianceDialogExpose>()
  const openCompliance = (row: SmisDocumentRegister): void => {
    void complianceDialogRef.value?.handleOpen({ document: row })
  }
</script>
