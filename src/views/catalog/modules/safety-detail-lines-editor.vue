<template>
  <section class="detail-lines art-card-xs">
    <header>
      <div>
        <strong>{{ schema.title }}</strong>
        <p>{{ schema.description }}</p>
      </div>
      <ElButton type="primary" plain @click="openRowDialog()">
        <ArtSvgIcon icon="ri:add-line" />新增明细
      </ElButton>
    </header>

    <ElTable :data="modelValue" row-key="_key" max-height="320" border>
      <ElTableColumn type="index" label="序号" width="58" align="center" />
      <ElTableColumn
        v-for="detailField in schema.fields"
        :key="detailField.key"
        :prop="detailField.key"
        :label="detailField.label"
        :min-width="detailField.width || (detailField.type === 'date' ? 146 : 132)"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{ displayValue(row[detailField.key]) }}
        </template>
      </ElTableColumn>
      <ElTableColumn label="操作" width="112" fixed="right" align="center">
        <template #default="{ $index }">
          <div class="detail-lines__actions">
            <ArtButtonTable type="edit" label="编辑明细" @click="openRowDialog($index)" />
            <ArtButtonTable type="delete" label="删除明细" @click="removeRow($index)" />
          </div>
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

  <ArtDialog ref="rowDialogRef" size="md">
    <ArtForm
      ref="rowFormRef"
      v-model="rowForm"
      :items="rowFormItems"
      :rules="rowFormRules"
      :span="12"
      :gutter="20"
      label-width="110px"
      :show-reset="false"
      :show-submit="false"
    />
  </ArtDialog>
</template>

<script setup lang="ts">
  import type { FormRules } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtEmptyState from '@/components/core/layouts/art-empty-state/index.vue'
  import ArtForm, { type FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import type {
    SafetyDetailField,
    SafetyDetailSchema
  } from '@smis/domain/safety-module-detail-schema'

  defineOptions({ name: 'SmisSafetyDetailLinesEditor' })

  interface DialogFormExpose {
    validate: () => Promise<boolean | void>
    clearValidate: () => void
  }

  type DetailRow = Record<string, unknown> & { _key: string }
  const props = defineProps<{ modelValue: DetailRow[]; schema: SafetyDetailSchema }>()
  const emit = defineEmits<{ 'update:modelValue': [value: DetailRow[]] }>()
  const rowDialogRef = ref<ArtDialogExpose<number | undefined>>()
  const rowFormRef = ref<DialogFormExpose>()
  const rowForm = reactive<Record<string, unknown>>({})
  const editingIndex = ref<number>()

  const displayValue = (value: unknown): string =>
    value === undefined || value === null || value === '' ? '--' : String(value)

  const toFormItem = (detailField: SafetyDetailField): FormItem => {
    const common = {
      key: detailField.key,
      label: detailField.label,
      span: detailField.key === 'remark' ? 24 : 12,
      placeholder: `${detailField.type === 'text' || detailField.type === 'number' ? '请输入' : '请选择'}${detailField.label}`
    }
    if (detailField.type === 'number') {
      return {
        ...common,
        type: 'number',
        props: { min: 0, precision: 2, controlsPosition: 'right' }
      }
    }
    if (detailField.type === 'date') {
      return {
        ...common,
        type: 'date',
        props: { type: 'date', valueFormat: 'YYYY-MM-DD' }
      }
    }
    if (detailField.type === 'select') {
      return {
        ...common,
        type: 'select',
        options: (detailField.options ?? []).map((value) => ({ label: value, value })),
        props: { clearable: true, filterable: true }
      }
    }
    return {
      ...common,
      type: 'input',
      props:
        detailField.key === 'remark'
          ? { type: 'textarea', rows: 3, maxlength: 500, showWordLimit: true }
          : { clearable: true, maxlength: 200 }
    }
  }

  const rowFormItems = computed<FormItem[]>(() => [
    {
      key: 'detailFields',
      label: props.schema.title,
      type: 'divider',
      span: 24
    },
    ...props.schema.fields.map(toFormItem)
  ])

  const rowFormRules = computed<FormRules>(() =>
    Object.fromEntries(
      props.schema.fields
        .filter((item) => item.required)
        .map((item) => [
          item.key,
          [
            {
              required: true,
              message: `${item.type === 'text' || item.type === 'number' ? '请输入' : '请选择'}${item.label}`,
              trigger: item.type === 'text' || item.type === 'number' ? 'blur' : 'change'
            }
          ]
        ])
    )
  )

  const replaceRowForm = (row?: DetailRow): void => {
    Object.keys(rowForm).forEach((key) => delete rowForm[key])
    Object.assign(
      rowForm,
      Object.fromEntries(
        props.schema.fields.map((item) => [item.key, row?.[item.key] ?? undefined])
      )
    )
  }

  const saveRow = async (): Promise<boolean> => {
    try {
      if ((await rowFormRef.value?.validate()) === false) return false
    } catch {
      return false
    }
    const nextRows = [...props.modelValue]
    const currentIndex = editingIndex.value
    const row: DetailRow = {
      ...structuredClone(toRaw(rowForm)),
      _key:
        currentIndex === undefined
          ? `${Date.now()}-${Math.random().toString(16).slice(2)}`
          : nextRows[currentIndex]._key
    }
    if (currentIndex === undefined) nextRows.push(row)
    else nextRows.splice(currentIndex, 1, row)
    emit('update:modelValue', nextRows)
    return true
  }

  const openRowDialog = async (index?: number): Promise<void> => {
    editingIndex.value = index
    replaceRowForm(index === undefined ? undefined : props.modelValue[index])
    await rowDialogRef.value?.handleOpen(index, {
      title: `${index === undefined ? '新增' : '编辑'}明细`,
      subtitle: props.schema.description,
      confirmText: '保存明细',
      onConfirm: saveRow,
      onOpen: async () => {
        await nextTick()
        rowFormRef.value?.clearValidate()
      }
    })
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
    }

    strong {
      font-size: 14px;
      color: var(--el-text-color-primary);
    }

    p {
      margin: 4px 0 0;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    &__actions {
      display: inline-flex;
      gap: 4px;
      align-items: center;
    }
  }

  @media (width <= 640px) {
    .detail-lines header {
      flex-direction: column;
    }
  }
</style>
