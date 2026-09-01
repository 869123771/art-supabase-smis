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
        <ElTable
          :data="model.positions"
          table-layout="fixed"
          max-height="260"
          empty-text="请选择防控岗位"
        >
          <ElTableColumn label="防控岗位" min-width="230"
            ><template #default="{ row }"
              ><strong>{{ positionOf(row.positionId)?.positionName }}</strong
              ><small class="measure-dialog__position-code">{{
                positionOf(row.positionId)?.positionCode
              }}</small></template
            ></ElTableColumn
          >
          <ElTableColumn label="排查频次" width="150"
            ><template #default="{ row }"
              ><ElInputNumber
                v-model="row.frequencyCount"
                :min="1"
                :max="999"
                controls-position="right" /></template
          ></ElTableColumn>
          <ElTableColumn label="频次单位" width="180"
            ><template #default="{ row }"
              ><ElSelect v-model="row.frequencyUnit" placeholder="请选择"
                ><ElOption
                  v-for="option in frequencyOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value" /></ElSelect></template
          ></ElTableColumn>
          <ElTableColumn label="周期预览" min-width="140"
            ><template #default="{ row }"
              ><ElTag type="primary" effect="plain"
                >每 {{ row.frequencyCount }}
                {{
                  frequencyOptions.find((i) => i.value === row.frequencyUnit)?.label || '—'
                }}</ElTag
              ></template
            ></ElTableColumn
          >
          <ElTableColumn label="操作" width="70" align="right"
            ><template #default="{ row }"
              ><ArtIconButton
                icon="ri:close-line"
                label="移除防控岗位"
                tone="danger"
                @click="removePosition(row.positionId)" /></template
          ></ElTableColumn>
        </ElTable>
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
    background: linear-gradient(90deg, var(--el-color-success), var(--theme-color));
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

  .measure-dialog__position-code {
    display: block;
    font-family: var(--art-font-family-mono, Consolas, monospace);
    color: var(--el-text-color-secondary);
  }

  @media (width <= 760px) {
    .measure-dialog__positions-head {
      grid-template-columns: 1fr;
    }
  }
</style>
