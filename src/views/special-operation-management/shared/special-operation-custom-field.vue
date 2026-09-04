<template>
  <ElInput
    v-if="field.fieldType === 'text' || field.fieldType === 'textarea'"
    :model-value="textValue"
    :type="field.fieldType === 'textarea' ? 'textarea' : 'text'"
    :rows="3"
    :maxlength="field.fieldType === 'textarea' ? 500 : 200"
    :show-word-limit="field.fieldType === 'textarea'"
    :placeholder="field.placeholder || `填写${field.fieldLabel}`"
    @update:model-value="emit('update:modelValue', $event)"
  />

  <div v-else-if="field.fieldType === 'number'" class="custom-field__number">
    <ElInputNumber
      :model-value="numberValue"
      :controls="false"
      :min="0"
      :placeholder="field.placeholder || `填写${field.fieldLabel}`"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <span v-if="field.unit">{{ field.unit }}</span>
  </div>

  <ElDatePicker
    v-else-if="field.fieldType === 'date' || field.fieldType === 'datetime'"
    :model-value="dateValue"
    :type="field.fieldType === 'date' ? 'date' : 'datetime'"
    :value-format="field.fieldType === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DDTHH:mm:ssZ'"
    :placeholder="field.placeholder || `选择${field.fieldLabel}`"
    @update:model-value="emit('update:modelValue', $event)"
  />

  <ElSelect
    v-else-if="field.fieldType === 'single' || field.fieldType === 'multiple'"
    :model-value="field.fieldType === 'multiple' ? multipleValue : singleValue"
    :multiple="field.fieldType === 'multiple'"
    :placeholder="field.placeholder || `选择${field.fieldLabel}`"
    clearable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <ElOption v-for="option in field.options" :key="option" :label="option" :value="option" />
  </ElSelect>

  <ElSwitch
    v-else
    :model-value="booleanValue"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
  import type { SmisSpecialOperationFieldDefinition } from '@smis/api'

  const props = defineProps<{
    field: SmisSpecialOperationFieldDefinition
    modelValue?: unknown
  }>()
  const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()

  const textValue = computed(() =>
    typeof props.modelValue === 'string' || typeof props.modelValue === 'number'
      ? String(props.modelValue)
      : ''
  )
  const numberValue = computed(() =>
    typeof props.modelValue === 'number'
      ? props.modelValue
      : typeof props.modelValue === 'string' && props.modelValue.trim()
        ? Number(props.modelValue)
        : undefined
  )
  const dateValue = computed(() =>
    typeof props.modelValue === 'string' ? props.modelValue : undefined
  )
  const singleValue = computed(() =>
    typeof props.modelValue === 'string' || typeof props.modelValue === 'number'
      ? props.modelValue
      : undefined
  )
  const multipleValue = computed(() =>
    Array.isArray(props.modelValue)
      ? props.modelValue.filter((item): item is string | number =>
          ['string', 'number'].includes(typeof item)
        )
      : []
  )
  const booleanValue = computed(() => props.modelValue === true)
</script>

<style scoped lang="scss">
  .custom-field__number {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
    width: 100%;
  }

  .custom-field__number > span {
    min-width: 24px;
    color: var(--el-text-color-secondary);
  }

  :deep(.el-date-editor),
  :deep(.el-input-number),
  :deep(.el-select) {
    width: 100%;
  }
</style>
