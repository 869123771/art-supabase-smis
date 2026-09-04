<template>
  <SpecialOperationPermitPage
    title="盲板抽堵申请"
    description="集中管理盲板抽堵类别、管线介质、盲板明细、安全隔离和现场验收，形成可核验的作业票档案。"
    page-icon="ri:stop-circle-line"
    :permissions="permissions"
    operation-type-code="BLIND_PLATE"
  />
</template>

<script setup lang="ts">
  import SpecialOperationPermitPage, {
    type SpecialOperationPagePermissions
  } from '../shared/special-operation-permit-page.vue'

  const permissions = {
    view: 'SmisBlindPlateOperationApplication:View',
    add: 'SmisBlindPlateOperationApplication:Add',
    copy: 'SmisBlindPlateOperationApplication:Copy',
    edit: 'SmisBlindPlateOperationApplication:Edit',
    delete: 'SmisBlindPlateOperationApplication:Delete',
    export: 'SmisBlindPlateOperationApplication:Export',
    void: 'SmisBlindPlateOperationApplication:Void',
    start: 'SmisBlindPlateOperationApplication:Start',
    requestAcceptance: 'SmisBlindPlateOperationApplication:RequestAcceptance',
    accept: 'SmisBlindPlateOperationApplication:Accept',
    print: 'SmisBlindPlateOperationApplication:Print'
  } satisfies SpecialOperationPagePermissions

  defineOptions({ name: 'SmisBlindPlateOperationApplication' })
</script>
