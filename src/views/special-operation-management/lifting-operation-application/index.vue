<template>
  <SpecialOperationPermitPage
    title="吊装作业申请"
    description="统一记录吊装重量、吊装工具、现场分析和人员职责，闭环管控吊装作业全过程。"
    page-icon="ri:scales-3-line"
    :permissions="permissions"
    operation-type-code="LIFTING"
  />
</template>

<script setup lang="ts">
  import SpecialOperationPermitPage, {
    type SpecialOperationPagePermissions
  } from '../shared/special-operation-permit-page.vue'

  const permissions = {
    view: 'SmisLiftingOperationApplication:View',
    add: 'SmisLiftingOperationApplication:Add',
    copy: 'SmisLiftingOperationApplication:Copy',
    edit: 'SmisLiftingOperationApplication:Edit',
    delete: 'SmisLiftingOperationApplication:Delete',
    export: 'SmisLiftingOperationApplication:Export',
    void: 'SmisLiftingOperationApplication:Void',
    start: 'SmisLiftingOperationApplication:Start',
    requestAcceptance: 'SmisLiftingOperationApplication:RequestAcceptance',
    accept: 'SmisLiftingOperationApplication:Accept',
    print: 'SmisLiftingOperationApplication:Print'
  } satisfies SpecialOperationPagePermissions

  defineOptions({ name: 'SmisLiftingOperationApplication' })
</script>
