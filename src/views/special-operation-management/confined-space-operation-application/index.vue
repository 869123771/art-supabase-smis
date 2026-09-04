<template>
  <SpecialOperationPermitPage
    title="受限空间作业申请"
    description="聚合受限空间辨识、介质信息、气体检测、监护职责与安全措施，保障进入前条件完整可查。"
    page-icon="ri:door-lock-box-line"
    :permissions="permissions"
    operation-type-code="CONFINED_SPACE"
  />
</template>

<script setup lang="ts">
  import SpecialOperationPermitPage, {
    type SpecialOperationPagePermissions
  } from '../shared/special-operation-permit-page.vue'

  const permissions = {
    view: 'SmisConfinedSpaceOperationApplication:View',
    add: 'SmisConfinedSpaceOperationApplication:Add',
    copy: 'SmisConfinedSpaceOperationApplication:Copy',
    edit: 'SmisConfinedSpaceOperationApplication:Edit',
    delete: 'SmisConfinedSpaceOperationApplication:Delete',
    export: 'SmisConfinedSpaceOperationApplication:Export',
    void: 'SmisConfinedSpaceOperationApplication:Void',
    start: 'SmisConfinedSpaceOperationApplication:Start',
    requestAcceptance: 'SmisConfinedSpaceOperationApplication:RequestAcceptance',
    accept: 'SmisConfinedSpaceOperationApplication:Accept',
    print: 'SmisConfinedSpaceOperationApplication:Print'
  } satisfies SpecialOperationPagePermissions

  defineOptions({ name: 'SmisConfinedSpaceOperationApplication' })
</script>
