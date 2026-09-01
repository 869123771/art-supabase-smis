<template>
  <ArtDialog ref="dialogRef" size="xl">
    <div class="measure-dialog">
      <div class="measure-dialog__flow"
        ><span class="is-done"><ArtSvgIcon icon="ri:checkbox-circle-line" />已完成定量评价</span
        ><i></i
        ><span class="is-current"
          ><ArtSvgIcon icon="ri:shield-check-line" />维护防控措施与岗位周期</span
        ></div
      >
      <ArtForm
        ref="formRef"
        v-model="model"
        :items="items"
        :rules="rules"
        :span="12"
        :gutter="20"
        label-position="top"
        :show-reset="false"
        :show-submit="false"
      />
      <div class="measure-dialog__positions">
        <div class="measure-dialog__positions-head"
          ><div
            ><strong>防控岗位与排查周期</strong
            ><p>一条措施可关联多个岗位，每个岗位独立配置此措施的排查频次。</p></div
          ><ElSelect
            v-model="selectedPositionIds"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            placeholder="选择一个或多个防控岗位"
            ><ElOption
              v-for="position in positions"
              :key="position.id"
              :label="`${position.positionName}（${position.positionCode}）`"
              :value="position.id"
              ><span>{{ position.positionName }}</span
              ><small>{{ position.organizationName || position.positionCode }}</small></ElOption
            ></ElSelect
          ></div
        >
        <ElScrollbar v-if="model.positions.length" class="measure-dialog__position-scroll">
          <ul class="measure-dialog__position-list">
            <li v-for="binding in model.positions" :key="binding.positionId">
              <div class="measure-dialog__position-identity">
                <span><ArtSvgIcon icon="ri:briefcase-4-line" /></span>
                <div>
                  <strong>{{ positionOf(binding.positionId)?.positionName }}</strong>
                  <small>{{ positionOf(binding.positionId)?.positionCode }}</small>
                </div>
              </div>
              <label>
                <span>排查频次</span>
                <ElInputNumber
                  v-model="binding.frequencyCount"
                  :min="1"
                  :max="999"
                  controls-position="right"
                />
              </label>
              <label>
                <span>频次单位</span>
                <ElSelect v-model="binding.frequencyUnit" placeholder="请选择">
                  <ElOption
                    v-for="option in frequencyOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </ElSelect>
              </label>
              <div class="measure-dialog__period-preview">
                <small>周期预览</small>
                <ElTag type="primary" effect="plain">
                  每 {{ binding.frequencyCount }}
                  {{
                    frequencyOptions.find((item) => item.value === binding.frequencyUnit)?.label ||
                    '—'
                  }}
                </ElTag>
              </div>
              <ArtIconButton
                icon="ri:close-line"
                label="移除防控岗位"
                tone="danger"
                @click="removePosition(binding.positionId)"
              />
            </li>
          </ul>
        </ElScrollbar>
        <div v-else class="measure-dialog__position-empty">
          <ArtSvgIcon icon="ri:briefcase-4-line" />
          <div>
            <strong>尚未选择防控岗位</strong>
            <small>从上方选择岗位后，可分别配置对应的排查频次。</small>
          </div>
        </div>
      </div>
    </div>
  </ArtDialog>
</template>
<script setup lang="ts">
  import { ElMessage, type FormRules } from 'element-plus'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtForm, { type FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtIconButton from '@/components/core/widget/art-icon-button/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { useUserStore } from '@/store/modules/user'
  import {
    fetchRiskPositionOptions,
    saveRiskControlMeasure,
    type SmisRiskControlMeasure,
    type SmisRiskControlMeasurePayload,
    type SmisRiskItem,
    type SmisRiskPositionOption
  } from '@smis/api'
  export interface MeasureDialogOpenData {
    item: SmisRiskItem
    row?: SmisRiskControlMeasure
  }
  interface FormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
  }
  const emit = defineEmits<{ success: [] }>()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const dialogRef = ref<ArtDialogExpose<MeasureDialogOpenData>>()
  const formRef = ref<FormExpose>()
  const positions = ref<SmisRiskPositionOption[]>([])
  const selectedPositionIds = ref<string[]>([])
  const initial = (): SmisRiskControlMeasurePayload => ({
    riskItemId: '',
    controlMeasure: '',
    controlMeasureCategory: '',
    controlLevel: '',
    standardBasis: '',
    failureMode: '',
    hazardLevel: '',
    sort: 10,
    positions: []
  })
  const model = reactive(initial())
  const dictOptions = (code: string) =>
    (getDictMap.value[code] ?? []).map((i) => ({ label: i.label || i.name, value: i.value }))
  const categoryOptions = computed(() => dictOptions('smisControlMeasureCategory'))
  const controlLevelOptions = computed(() => dictOptions('smisControlLevel'))
  const hazardLevelOptions = computed(() => dictOptions('smisHazardLevel'))
  const frequencyOptions = computed(() => dictOptions('smisFrequencyUnit'))
  const items = computed<FormItem[]>(() => [
    {
      label: '防控措施',
      key: 'controlMeasure',
      type: 'input',
      span: 24,
      props: {
        type: 'textarea',
        rows: 4,
        maxlength: 1000,
        showWordLimit: true,
        resize: 'none',
        placeholder: '描述可执行、可检查的工程、管理或个体防护措施'
      }
    },
    {
      label: '措施类别',
      key: 'controlMeasureCategory',
      type: 'select',
      options: categoryOptions.value,
      props: { clearable: false, placeholder: '请选择措施类别' }
    },
    {
      label: '管控层级',
      key: 'controlLevel',
      type: 'select',
      options: controlLevelOptions.value,
      props: { clearable: false, placeholder: '请选择管控层级' }
    },
    {
      label: '隐患等级',
      key: 'hazardLevel',
      type: 'select',
      options: hazardLevelOptions.value,
      props: { clearable: false, placeholder: '请选择隐患等级' }
    },
    {
      label: '排序',
      key: 'sort',
      type: 'number',
      props: { min: 0, max: 9999, controlsPosition: 'right' }
    },
    {
      label: '标准依据',
      key: 'standardBasis',
      type: 'input',
      span: 24,
      props: { maxlength: 500, clearable: true, placeholder: '法规、标准或制度条款（可选）' }
    },
    {
      label: '失效模式',
      key: 'failureMode',
      type: 'input',
      span: 24,
      props: { maxlength: 500, clearable: true, placeholder: '措施未执行时的可能失效表现（可选）' }
    }
  ])
  const rules: FormRules = {
    controlMeasure: [{ required: true, message: '请输入防控措施', trigger: 'blur' }],
    controlMeasureCategory: [{ required: true, message: '请选择措施类别', trigger: 'change' }],
    controlLevel: [{ required: true, message: '请选择管控层级', trigger: 'change' }],
    hazardLevel: [{ required: true, message: '请选择隐患等级', trigger: 'change' }]
  }
  const positionOf = (id: string) => positions.value.find((i) => i.id === id)
  const removePosition = (id: string) => {
    selectedPositionIds.value = selectedPositionIds.value.filter((i) => i !== id)
  }
  watch(
    selectedPositionIds,
    (ids) => {
      const existing = new Map(model.positions.map((i) => [i.positionId, i]))
      model.positions = ids.map(
        (id) => existing.get(id) || { positionId: id, frequencyCount: 1, frequencyUnit: 'day' }
      )
    },
    { deep: true }
  )
  const submit = async () => {
    try {
      await formRef.value?.validate()
      if (!model.positions.length) {
        ElMessage.warning('请至少选择一个防控岗位')
        return false
      }
      if (model.positions.some((i) => !i.frequencyUnit || i.frequencyCount < 1)) {
        ElMessage.warning('请完整配置每个岗位的排查周期')
        return false
      }
      await saveRiskControlMeasure({
        ...model,
        controlMeasure: model.controlMeasure.trim(),
        standardBasis: model.standardBasis?.trim() || null,
        failureMode: model.failureMode?.trim() || null
      })
      emit('success')
      return true
    } catch {
      return false
    }
  }
  const handleOpen = async (data: MeasureDialogOpenData) => {
    Object.assign(model, initial(), { riskItemId: data.item.id })
    selectedPositionIds.value = []
    const [positionResult] = await Promise.all([
      fetchRiskPositionOptions('', 0, 499),
      ...[
        'smisControlMeasureCategory',
        'smisControlLevel',
        'smisHazardLevel',
        'smisFrequencyUnit'
      ].map((code) => userStore.ensureDictLoaded(code))
    ])
    positions.value = positionResult.data
    if (data.row) {
      Object.assign(model, {
        id: data.row.id,
        riskItemId: data.item.id,
        controlMeasure: data.row.controlMeasure,
        controlMeasureCategory: data.row.controlMeasureCategory,
        controlLevel: data.row.controlLevel,
        standardBasis: data.row.standardBasis || '',
        failureMode: data.row.failureMode || '',
        hazardLevel: data.row.hazardLevel,
        sort: data.row.sort,
        positions: data.row.positions.map((i) => ({
          positionId: i.positionId,
          frequencyCount: i.frequencyCount,
          frequencyUnit: i.frequencyUnit
        }))
      })
      await nextTick()
      selectedPositionIds.value = model.positions.map((i) => i.positionId)
    }
    await nextTick()
    formRef.value?.clearValidate()
    await dialogRef.value?.handleOpen(data, {
      title: data.row ? '编辑防控措施' : '新增防控措施',
      subtitle: `${data.item.itemNo} · 完成评价后配置岗位责任和排查周期`,
      confirmText: '保存防控措施',
      onConfirm: submit
    })
  }
  defineExpose({ handleOpen })
</script>
<style scoped lang="scss">
  .measure-dialog__flow {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 10px 14px;
    margin-bottom: 16px;
    background: var(--el-fill-color-light);
    border-radius: var(--el-border-radius-base);
  }

  .measure-dialog__flow span {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .measure-dialog__flow span.is-done {
    color: var(--el-color-success);
  }

  .measure-dialog__flow span.is-current {
    font-weight: 700;
    color: var(--theme-color);
  }

  .measure-dialog__flow i {
    flex: 1;
    height: 1px;
    background: var(--el-border-color);
  }

  .measure-dialog__positions {
    padding: 14px;
    margin-top: 4px;
    background: var(--el-fill-color-extra-light);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--el-border-radius-base);
  }

  .measure-dialog__positions-head {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(320px, 46%);
    gap: 18px;
    align-items: start;
    margin-bottom: 12px;
  }

  .measure-dialog__positions-head p {
    margin: 3px 0 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .measure-dialog__positions-head :deep(.el-select) {
    width: 100%;
  }

  .measure-dialog__positions-head :deep(.el-select-dropdown__item) {
    display: flex;
    justify-content: space-between;
  }

  .measure-dialog__positions-head small {
    color: var(--el-text-color-secondary);
  }

  .measure-dialog__position-scroll {
    max-height: 280px;
  }

  .measure-dialog__position-list {
    display: grid;
    gap: 8px;
    padding: 0 4px 0 0;
    margin: 0;
    list-style: none;
  }

  .measure-dialog__position-list > li {
    display: grid;
    grid-template-columns: minmax(210px, 1.2fr) 142px 170px 130px 34px;
    gap: 12px;
    align-items: end;
    padding: 11px 12px;
    background: var(--default-box-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--el-border-radius-base);
  }

  .measure-dialog__position-identity {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr);
    gap: 10px;
    align-items: center;
    min-width: 0;
  }

  .measure-dialog__position-identity > span {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    color: var(--theme-color);
    background: color-mix(in srgb, var(--theme-color) 8%, var(--el-bg-color));
    border-radius: var(--el-border-radius-base);
  }

  .measure-dialog__position-identity strong,
  .measure-dialog__position-identity small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .measure-dialog__position-identity small {
    margin-top: 3px;
    font-family: var(--art-font-family-mono, Consolas, monospace);
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }

  .measure-dialog__position-list label,
  .measure-dialog__period-preview {
    display: grid;
    gap: 5px;
    min-width: 0;
  }

  .measure-dialog__position-list label > span,
  .measure-dialog__period-preview > small {
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }

  .measure-dialog__position-list :deep(.el-input-number),
  .measure-dialog__position-list :deep(.el-select) {
    width: 100%;
  }

  .measure-dialog__period-preview {
    align-content: end;
    align-self: stretch;
  }

  .measure-dialog__period-preview .el-tag {
    justify-content: center;
    width: 100%;
  }

  .measure-dialog__position-list .art-icon-button {
    align-self: end;
  }

  .measure-dialog__position-empty {
    display: grid;
    grid-template-columns: 38px minmax(0, 1fr);
    gap: 11px;
    align-items: center;
    min-height: 78px;
    padding: 12px 14px;
    color: var(--el-text-color-secondary);
    background: var(--default-box-color);
    border: 1px dashed var(--el-border-color);
    border-radius: var(--el-border-radius-base);
  }

  .measure-dialog__position-empty > .art-svg-icon {
    font-size: 24px;
    color: var(--el-text-color-placeholder);
  }

  .measure-dialog__position-empty strong,
  .measure-dialog__position-empty small {
    display: block;
  }

  .measure-dialog__position-empty small {
    margin-top: 3px;
    font-size: 11px;
  }

  @media (width <= 1080px) {
    .measure-dialog__position-list > li {
      grid-template-columns: minmax(210px, 1fr) 142px 170px 34px;
    }

    .measure-dialog__period-preview {
      display: none;
    }
  }

  @media (width <= 760px) {
    .measure-dialog__positions-head {
      grid-template-columns: 1fr;
    }

    .measure-dialog__position-list > li {
      grid-template-columns: minmax(0, 1fr) 34px;
    }

    .measure-dialog__position-list label {
      grid-column: 1;
    }

    .measure-dialog__position-list .art-icon-button {
      grid-row: 1;
      grid-column: 2;
    }
  }
</style>
