<template>
  <HazardousWasteDocumentPage
    direction="outbound"
    :permissions="{
      view: 'SmisHazardousWasteOutbound:View',
      add: 'SmisHazardousWasteOutbound:Add',
      edit: 'SmisHazardousWasteOutbound:Edit',
      delete: 'SmisHazardousWasteOutbound:Delete',
      export: 'SmisHazardousWasteOutbound:Export',
      submit: 'SmisHazardousWasteOutbound:Submit',
      review: 'SmisHazardousWasteOutbound:Review'
    }"
  />
</template>
<script setup lang="ts">
  import HazardousWasteDocumentPage from '../shared/document-page.vue'
  defineOptions({ name: 'SmisHazardousWasteOutbound' })
</script>
