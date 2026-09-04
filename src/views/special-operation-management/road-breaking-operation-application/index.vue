<template>
  <SpecialOperationPermitPage
    title="断路作业申请"
    description="规范断路范围、交通管制、绕行路线、安全措施与恢复验收，降低施工期间道路通行风险。"
    page-icon="ri:road-map-line"
    :permissions="permissions"
    operation-type-code="ROAD_BREAKING"
  />
</template>

<script setup lang="ts">
  import SpecialOperationPermitPage, {
    type SpecialOperationPagePermissions
  } from '../shared/special-operation-permit-page.vue'

  const permissions = {
    view: 'SmisRoadBreakingOperationApplication:View',
    add: 'SmisRoadBreakingOperationApplication:Add',
    copy: 'SmisRoadBreakingOperationApplication:Copy',
    edit: 'SmisRoadBreakingOperationApplication:Edit',
    delete: 'SmisRoadBreakingOperationApplication:Delete',
    export: 'SmisRoadBreakingOperationApplication:Export',
    void: 'SmisRoadBreakingOperationApplication:Void',
    start: 'SmisRoadBreakingOperationApplication:Start',
    requestAcceptance: 'SmisRoadBreakingOperationApplication:RequestAcceptance',
    accept: 'SmisRoadBreakingOperationApplication:Accept',
    print: 'SmisRoadBreakingOperationApplication:Print'
  } satisfies SpecialOperationPagePermissions

  defineOptions({ name: 'SmisRoadBreakingOperationApplication' })
</script>
