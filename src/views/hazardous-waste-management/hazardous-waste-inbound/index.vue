<template>
  <HazardousWasteDocumentPage
    direction="inbound"
    :permissions="{
      view: 'SmisHazardousWasteInbound:View',
      add: 'SmisHazardousWasteInbound:Add',
      edit: 'SmisHazardousWasteInbound:Edit',
      delete: 'SmisHazardousWasteInbound:Delete',
      export: 'SmisHazardousWasteInbound:Export',
      submit: 'SmisHazardousWasteInbound:Submit',
      review: 'SmisHazardousWasteInbound:Review'
    }"
  />
</template>
<script setup lang="ts">
  import HazardousWasteDocumentPage from '../shared/document-page.vue'
  defineOptions({ name: 'SmisHazardousWasteInbound' })
</script>
