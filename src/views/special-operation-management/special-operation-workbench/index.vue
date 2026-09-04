<template>
  <SpecialOperationPermitPage
    title="特殊作业管理"
    description="统一管理特殊作业申请、审批、执行、验收与归档，支持按租户配置作业类型和专有字段。"
    page-icon="ri:file-shield-2-line"
    :permissions="permissions"
  />
</template>

<script setup lang="ts">
  import SpecialOperationPermitPage, {
    type SpecialOperationPagePermissions
  } from '../shared/special-operation-permit-page.vue'

  const permissions = {
    view: 'SmisSpecialOperationWorkbench:View',
    add: 'SmisSpecialOperationWorkbench:Add',
    copy: 'SmisSpecialOperationWorkbench:Copy',
    edit: 'SmisSpecialOperationWorkbench:Edit',
    delete: 'SmisSpecialOperationWorkbench:Delete',
    export: 'SmisSpecialOperationWorkbench:Export',
    void: 'SmisSpecialOperationWorkbench:Void',
    start: 'SmisSpecialOperationWorkbench:Start',
    requestAcceptance: 'SmisSpecialOperationWorkbench:RequestAcceptance',
    accept: 'SmisSpecialOperationWorkbench:Accept',
    print: 'SmisSpecialOperationWorkbench:Print'
  } satisfies SpecialOperationPagePermissions

  defineOptions({ name: 'SmisSpecialOperationWorkbench' })
</script>
