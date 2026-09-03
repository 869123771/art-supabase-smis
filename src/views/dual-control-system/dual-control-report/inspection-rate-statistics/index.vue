<template>
  <InspectionStatisticsWorkspace
    report-type="inspection_rate"
    page-permission="SmisDualControlInspectionRateStatistics:View"
    detail-permission="SmisDualControlInspectionRateStatistics:ViewDetail"
    export-permission="SmisDualControlInspectionRateStatistics:Export"
  />
</template>

<script setup lang="ts">
  import InspectionStatisticsWorkspace from '../shared/inspection-statistics-workspace.vue'

  defineOptions({ name: 'SmisDualControlInspectionRateStatistics' })
</script>
