<template>
  <ArtPermissionGuard permission="SmisRequiredKnowledge:View" resource-name="应知应会">
    <DocumentRegisterWorkspace kind="required_knowledge" />
  </ArtPermissionGuard>
</template>

<script setup lang="ts">
  import ArtPermissionGuard from '@/components/core/feedback/art-permission-guard/index.vue'
  import DocumentRegisterWorkspace from '../shared/document-register-workspace.vue'

  defineOptions({ name: 'SmisRequiredKnowledge' })
</script>
