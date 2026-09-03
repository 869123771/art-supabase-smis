<template>
  <SpecialOperationCatalogPage
    catalog-kind="safety_checklist"
    title="安全检查表"
    singular="排查项"
    item-label="排查项"
    description="按作业类型维护标准化安全排查项，为作业票发起、现场确认和审计追溯提供一致检查口径。"
    page-icon="ri:shield-check-line"
    view-permission="SmisSpecialOperationSafetyChecklist:View"
    add-permission="SmisSpecialOperationSafetyChecklist:Add"
    edit-permission="SmisSpecialOperationSafetyChecklist:Edit"
    delete-permission="SmisSpecialOperationSafetyChecklist:Delete"
    export-permission="SmisSpecialOperationSafetyChecklist:Export"
    void-permission="SmisSpecialOperationSafetyChecklist:Void"
  />
</template>

<script setup lang="ts">
  import SpecialOperationCatalogPage from '../shared/special-operation-catalog-page.vue'

  defineOptions({ name: 'SmisSpecialOperationSafetyChecklist' })
</script>
