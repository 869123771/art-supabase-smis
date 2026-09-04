<template>
  <SpecialOperationPermitPage
    title="高处作业申请"
    description="规范高处作业申请与审批，集中管理作业高度、风险辨识、安全措施和现场验收。"
    page-icon="ri:arrow-up-circle-line"
    :permissions="permissions"
    operation-type-code="WORK_AT_HEIGHT"
  />
</template>

<script setup lang="ts">
  import SpecialOperationPermitPage, {
    type SpecialOperationPagePermissions
  } from '../shared/special-operation-permit-page.vue'

  const permissions = {
    view: 'SmisWorkAtHeightApplication:View',
    add: 'SmisWorkAtHeightApplication:Add',
    copy: 'SmisWorkAtHeightApplication:Copy',
    edit: 'SmisWorkAtHeightApplication:Edit',
    delete: 'SmisWorkAtHeightApplication:Delete',
    export: 'SmisWorkAtHeightApplication:Export',
    void: 'SmisWorkAtHeightApplication:Void',
    start: 'SmisWorkAtHeightApplication:Start',
    requestAcceptance: 'SmisWorkAtHeightApplication:RequestAcceptance',
    accept: 'SmisWorkAtHeightApplication:Accept',
    print: 'SmisWorkAtHeightApplication:Print'
  } satisfies SpecialOperationPagePermissions

  defineOptions({ name: 'SmisWorkAtHeightApplication' })
</script>
