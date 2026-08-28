<template>
  <div class="accident-measures-editor">
    <div class="accident-measures-editor__toolbar">
      <div>
        <strong>计划防范措施</strong>
        <span>明确措施、计划落实时间和责任人</span>
      </div>
      <ElButton type="primary" plain @click="addRow">
        <ArtSvgIcon icon="ri:add-line" />添加措施
      </ElButton>
    </div>

    <ElTable v-if="rows.length" :data="rows" row-key="localKey" table-layout="fixed">
      <ElTableColumn type="index" label="序号" width="64" align="center" />
      <ElTableColumn label="计划防范措施" min-width="280">
        <template #default="{ row, $index }">
          <ElInput
            :model-value="row.plannedMeasure"
            type="textarea"
            :rows="2"
            maxlength="1000"
            show-word-limit
            resize="none"
            placeholder="请输入可执行、可核验的防范措施"
            @update:model-value="patchRow($index, { plannedMeasure: $event })"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn label="计划落实时间" width="180">
        <template #default="{ row, $index }">
          <ElDatePicker
            :model-value="row.plannedImplementationDate || undefined"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            class="w-full"
            @update:model-value="patchRow($index, { plannedImplementationDate: $event || null })"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn label="落实责任人" min-width="240">
        <template #default="{ row, $index }">
          <ArtEmployeeSelect
            :model-value="row.responsibleEmployeeId || undefined"
            :selected-data="row.responsibleEmployee ? [row.responsibleEmployee] : []"
            :api-fn="fetchAccidentEmployeeCandidates"
            title="选择防范措施责任人"
            subtitle="数据来自当前租户员工花名册"
            placeholder="选择责任人"
            @update:model-value="patchRow($index, { responsibleEmployeeId: $event || null })"
            @update:selected-data="handleResponsibleChange($index, $event)"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn label="操作" width="76" align="center">
        <template #default="{ $index }">
          <ElButton link type="danger" aria-label="删除防范措施" @click="removeRow($index)">
            删除
          </ElButton>
        </template>
      </ElTableColumn>
    </ElTable>
    <ArtEmptyState
      v-else
      title="暂未添加防范措施"
      description="事故原因明确后，可补充计划措施、完成日期与责任人。"
      size="compact"
    />
  </div>
</template>

<script setup lang="ts">
  import { cloneDeep, omit } from 'lodash-es'
  import type { EmployeeIntegrationItem } from '@/api/integration/employees'
  import ArtEmployeeSelect from '@/components/business/art-employee-select/index.vue'
  import ArtEmptyState from '@/components/core/feedback/art-empty-state/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import {
    fetchAccidentEmployeeCandidates,
    type SmisAccidentEmployee,
    type SmisAccidentPreventionMeasure
  } from '@smis/api'

  interface EditorRow extends SmisAccidentPreventionMeasure {
    localKey: string
  }

  const props = withDefaults(defineProps<{ modelValue?: SmisAccidentPreventionMeasure[] }>(), {
    modelValue: () => []
  })
  const emit = defineEmits<{
    'update:modelValue': [value: SmisAccidentPreventionMeasure[]]
  }>()
  const rows = ref<EditorRow[]>([])
  let localSequence = 0
  const createLocalKey = (): string => `measure-${Date.now()}-${localSequence++}`
  const toEditorRows = (value: SmisAccidentPreventionMeasure[]): EditorRow[] =>
    cloneDeep(value).map((item) => ({ ...item, localKey: item.id || createLocalKey() }))
  watch(
    () => props.modelValue,
    (value) => {
      rows.value = toEditorRows(value)
    },
    { immediate: true }
  )
  const sync = (): void =>
    emit(
      'update:modelValue',
      rows.value.map((row, index) => ({ ...omit(row, 'localKey'), sort: index }))
    )
  const addRow = (): void => {
    rows.value.push({
      localKey: createLocalKey(),
      plannedMeasure: '',
      plannedImplementationDate: null,
      responsibleEmployeeId: null,
      responsibleEmployee: null,
      sort: rows.value.length
    })
    sync()
  }
  const patchRow = (index: number, patch: Partial<EditorRow>): void => {
    const next = cloneDeep(rows.value)
    Object.assign(next[index], patch)
    rows.value = next
    sync()
  }
  const removeRow = (index: number): void => {
    rows.value.splice(index, 1)
    sync()
  }
  const handleResponsibleChange = (index: number, selected: EmployeeIntegrationItem[]): void => {
    const employee = selected[0] as SmisAccidentEmployee | undefined
    patchRow(index, {
      responsibleEmployeeId: employee?.id || null,
      responsibleEmployee: employee ?? null
    })
  }
</script>

<style scoped lang="scss">
  .accident-measures-editor {
    min-width: 0;

    &__toolbar {
      display: flex;
      gap: 16px;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;

      > div {
        display: grid;
        gap: 3px;
      }

      span {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    :deep(.el-table__cell) {
      vertical-align: top;
    }

    @media (width <= 760px) {
      &__toolbar {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  }
</style>
