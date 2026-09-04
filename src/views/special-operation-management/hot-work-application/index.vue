<template>
  <SpecialOperationPermitPage
    title="动火作业申请"
    description="发起和跟踪动火作业票，统一记录危害因素、动火方式、责任人员、现场分析和安全措施。"
    page-icon="ri:fire-line"
    :permissions="permissions"
    operation-type-code="HOT_WORK"
  />
</template>

<script setup lang="ts">
  import SpecialOperationPermitPage, {
    type SpecialOperationPagePermissions
  } from '../shared/special-operation-permit-page.vue'

  const permissions = {
    view: 'SmisHotWorkApplication:View',
    add: 'SmisHotWorkApplication:Add',
    copy: 'SmisHotWorkApplication:Copy',
    edit: 'SmisHotWorkApplication:Edit',
    delete: 'SmisHotWorkApplication:Delete',
    export: 'SmisHotWorkApplication:Export',
    void: 'SmisHotWorkApplication:Void',
    start: 'SmisHotWorkApplication:Start',
    requestAcceptance: 'SmisHotWorkApplication:RequestAcceptance',
    accept: 'SmisHotWorkApplication:Accept',
    print: 'SmisHotWorkApplication:Print'
  } satisfies SpecialOperationPagePermissions

  defineOptions({ name: 'SmisHotWorkApplication' })
</script>
