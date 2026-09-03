<template>
  <InspectionStatisticsWorkspace
    report-type="missed_rate"
    page-permission="SmisDualControlMissedInspectionRateStatistics:View"
    detail-permission="SmisDualControlMissedInspectionRateStatistics:ViewDetail"
    export-permission="SmisDualControlMissedInspectionRateStatistics:Export"
  />
</template>

<script setup lang="ts">
  import InspectionStatisticsWorkspace from '../shared/inspection-statistics-workspace.vue'

  defineOptions({ name: 'SmisDualControlMissedInspectionRateStatistics' })
</script>
