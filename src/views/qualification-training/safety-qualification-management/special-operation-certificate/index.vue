<template>
  <PersonnelCertificateLedger
    category="special_operation"
    page-title="特种作业操作证"
    eyebrow="SPECIAL OPERATION CERTIFICATES"
    page-description="统一维护特种作业操作证、准操项目、有效期提醒和复审记录。"
    permission-prefix="SmisSpecialOperationCertificate"
    scope-tag="作业类别与准操项目联动"
  />
</template>

<script setup lang="ts">
  import PersonnelCertificateLedger from '../special-equipment-personnel-certificate-ledger/index.vue'

  defineOptions({ name: 'SmisSpecialOperationCertificate' })
</script>
