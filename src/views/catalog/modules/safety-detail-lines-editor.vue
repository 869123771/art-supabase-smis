<template>
  <section class="detail-lines art-card-xs">
    <header>
      <div
        ><strong>{{ schema.title }}</strong
        ><p>{{ schema.description }}</p></div
      >
      <ElButton type="primary" plain @click="addRow">
        <ArtSvgIcon icon="ri:add-line" />新增明细
      </ElButton>
    </header>
    <ElTable :data="modelValue" row-key="_key" max-height="320" border>
      <ElTableColumn type="index" label="序号" width="58" align="center" />
      <ElTableColumn
        v-for="detailField in schema.fields"
        :key="detailField.key"
        :label="detailField.label"
        :min-width="detailField.width || (detailField.type === 'date' ? 146 : 132)"
      >
        <template #default="{ row }">
          <ElInputNumber
            v-if="detailField.type === 'number'"
            v-model="row[detailField.key]"
            :min="0"
            :precision="2"
            controls-position="right"
          />
          <ElDatePicker
            v-else-if="detailField.type === 'date'"
            v-model="row[detailField.key]"
            type="date"
            value-format="YYYY-MM-DD"
            :placeholder="`请选择${detailField.label}`"
          />
          <ElSelect
            v-else-if="detailField.type === 'select'"
            v-model="row[detailField.key]"
            clearable
            filterable
            :placeholder="`请选择${detailField.label}`"
          >
            <ElOption
              v-for="option in detailField.options"
              :key="option"
              :label="option"
              :value="option"
            />
          </ElSelect>
          <ElInput
            v-else
            v-model="row[detailField.key]"
            clearable
            :maxlength="200"
            :placeholder="`请输入${detailField.label}`"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn label="操作" width="70" fixed="right" align="center">
        <template #default="{ $index }">
          <ArtButtonTable type="delete" label="删除明细" @click="removeRow($index)" />
        </template>
      </ElTableColumn>
      <template #empty>
        <ArtEmptyState
          compact
          :title="schema.emptyText"
          description="点击“新增明细”维护子表数据。"
        />
      </template>
    </ElTable>
  </section>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtEmptyState from '@/components/core/layouts/art-empty-state/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import type { SafetyDetailSchema } from '@smis/domain/safety-module-detail-schema'

  defineOptions({ name: 'SmisSafetyDetailLinesEditor' })

  type DetailRow = Record<string, unknown> & { _key: string }
  const props = defineProps<{ modelValue: DetailRow[]; schema: SafetyDetailSchema }>()
  const emit = defineEmits<{ 'update:modelValue': [value: DetailRow[]] }>()

  const addRow = (): void => {
    const row = Object.fromEntries(props.schema.fields.map((item) => [item.key, undefined]))
    emit('update:modelValue', [
      ...props.modelValue,
      { ...row, _key: `${Date.now()}-${Math.random().toString(16).slice(2)}` }
    ])
  }

  const removeRow = (index: number): void => {
    emit(
      'update:modelValue',
      props.modelValue.filter((_, itemIndex) => itemIndex !== index)
    )
  }
</script>

<style scoped lang="scss">
  .detail-lines {
    display: grid;
    gap: 12px;
    padding: 14px;

    header {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      justify-content: space-between;

      strong {
        font-size: 14px;
      }

      p {
        margin: 4px 0 0;
        font-size: 12px;
        color: var(--art-text-gray-600);
      }
    }

    :deep(.el-input-number),
    :deep(.el-date-editor),
    :deep(.el-select) {
      width: 100%;
    }
  }

  @media (width <= 640px) {
    .detail-lines header {
      flex-direction: column;
    }
  }
</style>
