<template>
  <ArtPermissionGuard permission="SmisSafetyManagementSystem:View" resource-name="安全管理制度">
    <DocumentRegisterWorkspace kind="safety_management_system" />
  </ArtPermissionGuard>
</template>

<script setup lang="ts">
  import ArtPermissionGuard from '@/components/core/feedback/art-permission-guard/index.vue'
  import DocumentRegisterWorkspace from '../shared/document-register-workspace.vue'

  defineOptions({ name: 'SmisSafetyManagementSystem' })
</script>
