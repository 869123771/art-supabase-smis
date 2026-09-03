<template>
  <ArtDialog ref="dialogRef" size="md" :show-footer="false">
    <ArtSectionCard
      title="风险辨识单位"
      :subtitle="`${record?.organizationName || ''} · ${record?.positionName || ''}`"
      :empty="!record?.identificationUnits.length"
      empty-title="暂无辨识单位"
      empty-description="请先在风险辨识业务中关联风险点辨识单位。"
    >
      <div class="identification-units">
        <div
          v-for="unit in record?.identificationUnits"
          :key="unit.organizationId"
          class="identification-units__item art-card-xs"
        >
          <span aria-hidden="true"><ArtSvgIcon icon="ri:organization-chart" /></span>
          <div
            ><strong>{{ unit.organizationName }}</strong
            ><small>{{ unit.organizationCode }}</small></div
          >
        </div>
      </div>
    </ArtSectionCard>
  </ArtDialog>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtSectionCard from '@/components/core/surfaces/art-section-card/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import type { SmisPositionRiskChecklistRecord } from '@smis/api'

  const dialogRef = ref<ArtDialogExpose<SmisPositionRiskChecklistRecord>>()
  const record = ref<SmisPositionRiskChecklistRecord>()
  const handleOpen = async (data: SmisPositionRiskChecklistRecord): Promise<void> => {
    record.value = data
    await dialogRef.value?.handleOpen(data, { title: '辨识单位', showFooter: false })
  }
  defineExpose({ handleOpen })
</script>

<style scoped lang="scss">
  .identification-units {
    display: grid;
    gap: 10px;

    &__item {
      display: grid;
      grid-template-columns: 38px minmax(0, 1fr);
      gap: 10px;
      align-items: center;
      padding: 12px 14px;
    }

    &__item > span {
      display: grid;
      place-items: center;
      width: 38px;
      height: 38px;
      color: var(--theme-color);
      background: color-mix(in srgb, var(--theme-color) 10%, var(--el-bg-color));
      border-radius: var(--el-border-radius-base);
    }

    &__item > div {
      display: grid;
      min-width: 0;
    }

    &__item small {
      margin-top: 2px;
      color: var(--el-text-color-secondary);
    }
  }
</style>
