<template>
  <PersonnelCertificateLedger
    category="safety_manager"
    page-title="安全管理人员证"
    eyebrow="SAFETY MANAGER CERTIFICATES"
    page-description="统一维护安全管理人员证、单位类型、职业类型、人员学历、有效期提醒和复审记录。"
    permission-prefix="SmisSafetyManagerCertificate"
    scope-tag="身份证与最高学历联动"
  />
</template>

<script setup lang="ts">
  import PersonnelCertificateLedger from '../special-equipment-personnel-certificate-ledger/index.vue'

  defineOptions({ name: 'SmisSafetyManagerCertificate' })
</script>
