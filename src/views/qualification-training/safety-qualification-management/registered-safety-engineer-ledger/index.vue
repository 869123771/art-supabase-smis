<template>
  <PersonnelCertificateLedger
    category="registered_safety_engineer"
    page-title="注册安全工程师台账"
    eyebrow="REGISTERED SAFETY ENGINEER LEDGER"
    page-description="统一维护注册安全工程师证件、专业类别、有效期提醒和复审记录。"
    permission-prefix="SmisRegisteredSafetyEngineerLedger"
    scope-tag="注册分类治理"
  />
</template>

<script setup lang="ts">
  import PersonnelCertificateLedger from '../special-equipment-personnel-certificate-ledger/index.vue'

  defineOptions({ name: 'SmisRegisteredSafetyEngineerLedger' })
</script>
