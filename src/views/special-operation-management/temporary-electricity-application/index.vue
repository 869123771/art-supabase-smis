<template>
  <SpecialOperationPermitPage
    title="临时用电作业申请"
    description="统一管理临时用电申请、电源接入、用电设备、安全确认和作业验收，确保现场用电全过程可追溯。"
    page-icon="ri:flashlight-line"
    :permissions="permissions"
    operation-type-code="TEMP_ELECTRICITY"
  />
</template>

<script setup lang="ts">
  import SpecialOperationPermitPage, {
    type SpecialOperationPagePermissions
  } from '../shared/special-operation-permit-page.vue'

  const permissions = {
    view: 'SmisTemporaryElectricityApplication:View',
    add: 'SmisTemporaryElectricityApplication:Add',
    copy: 'SmisTemporaryElectricityApplication:Copy',
    edit: 'SmisTemporaryElectricityApplication:Edit',
    delete: 'SmisTemporaryElectricityApplication:Delete',
    export: 'SmisTemporaryElectricityApplication:Export',
    void: 'SmisTemporaryElectricityApplication:Void',
    start: 'SmisTemporaryElectricityApplication:Start',
    requestAcceptance: 'SmisTemporaryElectricityApplication:RequestAcceptance',
    accept: 'SmisTemporaryElectricityApplication:Accept',
    print: 'SmisTemporaryElectricityApplication:Print'
  } satisfies SpecialOperationPagePermissions

  defineOptions({ name: 'SmisTemporaryElectricityApplication' })
</script>
