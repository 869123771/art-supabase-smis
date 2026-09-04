<template>
  <div class="blind-plate-items">
    <div class="blind-plate-items__header">
      <div>
        <strong>盲板明细</strong>
        <small>逐项登记设备或管线、介质、工况和盲板标识，便于现场逐块核验。</small>
      </div>
      <ElButton type="primary" plain @click="addItem">
        <ArtSvgIcon icon="ri:add-line" />
        新增盲板
      </ElButton>
    </div>

    <div class="blind-plate-items__table-scroll">
      <ArtTable
        :data="modelValue"
        :pagination="false"
        row-key="id"
        table-layout="fixed"
        empty-text="尚未添加盲板明细"
      >
        <ElTableColumn type="index" label="序号" width="62" fixed="left" />
        <ElTableColumn label="设备 / 管线名称" min-width="180">
          <template #default="{ row, $index }">
            <ElInput
              :model-value="row.equipmentPipelineName"
              maxlength="120"
              placeholder="必填"
              @update:model-value="updateItem($index, 'equipmentPipelineName', $event)"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn label="介质" min-width="120">
          <template #default="{ row, $index }">
            <ElInput
              :model-value="row.medium"
              maxlength="80"
              placeholder="介质名称"
              @update:model-value="updateItem($index, 'medium', $event)"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn label="温度（℃）" min-width="112">
          <template #default="{ row, $index }">
            <ElInput
              :model-value="row.temperature"
              maxlength="24"
              placeholder="例如 35"
              @update:model-value="updateItem($index, 'temperature', $event)"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn label="压力（MPa）" min-width="118">
          <template #default="{ row, $index }">
            <ElInput
              :model-value="row.pressure"
              maxlength="24"
              placeholder="例如 0.6"
              @update:model-value="updateItem($index, 'pressure', $event)"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn label="盲板材质" min-width="120">
          <template #default="{ row, $index }">
            <ElInput
              :model-value="row.material"
              maxlength="80"
              placeholder="材质"
              @update:model-value="updateItem($index, 'material', $event)"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn label="盲板规格" min-width="132">
          <template #default="{ row, $index }">
            <ElInput
              :model-value="row.specification"
              maxlength="80"
              placeholder="必填"
              @update:model-value="updateItem($index, 'specification', $event)"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn label="盲板编号" min-width="132">
          <template #default="{ row, $index }">
            <ElInput
              :model-value="row.blindPlateNo"
              maxlength="80"
              placeholder="现场标识编号"
              @update:model-value="updateItem($index, 'blindPlateNo', $event)"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="76" fixed="right">
          <template #default="{ $index }">
            <ElButton link type="danger" @click="removeItem($index)">移除</ElButton>
          </template>
        </ElTableColumn>
      </ArtTable>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { SmisSpecialOperationBlindPlateItem } from '@smis/api'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { createBlindPlateItem } from './special-operation-permit-utils'

  type BlindPlateEditableKey = Exclude<keyof SmisSpecialOperationBlindPlateItem, 'id'>

  const props = defineProps<{ modelValue: SmisSpecialOperationBlindPlateItem[] }>()
  const emit = defineEmits<{
    'update:modelValue': [value: SmisSpecialOperationBlindPlateItem[]]
  }>()

  const addItem = (): void =>
    emit('update:modelValue', [...props.modelValue, createBlindPlateItem()])
  const removeItem = (index: number): void =>
    emit(
      'update:modelValue',
      props.modelValue.filter((_, itemIndex) => itemIndex !== index)
    )
  const updateItem = (index: number, key: BlindPlateEditableKey, value: string): void => {
    emit(
      'update:modelValue',
      props.modelValue.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    )
  }
</script>

<style scoped lang="scss">
  .blind-plate-items {
    display: grid;
    gap: 12px;
    min-width: 0;

    &__header {
      display: flex;
      gap: 16px;
      align-items: center;
      justify-content: space-between;

      > div {
        display: grid;
        gap: 3px;
        min-width: 0;
      }

      strong {
        color: var(--el-text-color-primary);
      }

      small {
        line-height: 1.5;
        color: var(--el-text-color-secondary);
      }
    }

    :deep(.el-table) {
      --el-table-header-bg-color: var(--art-gray-100);

      border-radius: var(--art-control-radius);
    }

    &__table-scroll {
      min-width: 0;
      overflow-x: auto;
      border-radius: var(--art-control-radius);
    }

    &__table-scroll :deep(.art-table) {
      min-width: 1052px;
    }

    @media (width <= 640px) {
      &__header {
        flex-direction: column;
        align-items: stretch;

        .el-button {
          width: 100%;
        }
      }
    }
  }
</style>
