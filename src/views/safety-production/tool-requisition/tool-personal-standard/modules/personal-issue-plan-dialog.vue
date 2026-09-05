<template>
  <ArtDialog ref="dialogRef" size="lg">
    <div class="personal-plan__notice">
      <ArtSvgIcon icon="ri:calendar-schedule-line" />
      <div>
        <strong>{{ employee?.employeeName }} · {{ employee?.employeeNo }}</strong>
        <p>设置首次领用时间和周期后，到期任务会按个人标准生成待领用单。</p>
      </div>
    </div>

    <ArtSectionCard
      title="工器具个人领用计划"
      subtitle="周期默认继承发放标准，可按人员实际入岗日期调整。"
      :loading="loading"
      :empty="!loading && !form.items.length"
      empty-title="暂无工器具个人标准"
      empty-description="请先为该员工生成工器具个人标准。"
    >
      <ArtTable
        :data="form.items"
        :columns="planColumns"
        :pagination="false"
        row-key="id"
        table-layout="fixed"
      />
    </ArtSectionCard>
  </ArtDialog>
</template>

<script setup lang="tsx">
  import dayjs from 'dayjs'
  import { ElDatePicker, ElInputNumber, ElOption, ElSelect } from 'element-plus'
  import type { ColumnOption } from '@/types'
  import { useUserStore } from '@/store/modules/user'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import {
    fetchToolPersonalStandardItems,
    saveToolPersonalIssuePlan,
    type SmisToolPersonalStandard,
    type SmisToolPersonalStandardItem
  } from '@smis/api'

  interface PlanItem extends SmisToolPersonalStandardItem {
    initialIssueDate: string
    nextIssueDate: string
  }

  const emit = defineEmits<{ success: [] }>()
  const dialogRef = ref<ArtDialogExpose<SmisToolPersonalStandard>>()
  const employee = shallowRef<SmisToolPersonalStandard>()
  const loading = ref(false)
  const form = reactive<{ items: PlanItem[] }>({ items: [] })
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const cycleOptions = computed(() =>
    (getDictMap.value.smisToolIssuanceCycle ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  )
  const planColumns = computed<ColumnOption<PlanItem>[]>(() => [
    { prop: 'materialName', label: '工器具', minWidth: 180, showOverflowTooltip: true },
    { prop: 'specificationModel', label: '规格型号', minWidth: 130, showOverflowTooltip: true },
    { prop: 'quotaQuantity', label: '定额数量', width: 100, align: 'right' },
    {
      prop: 'basicUnit',
      label: '计量单位',
      width: 96,
      align: 'center',
      dict: { code: 'smisMaterialUnit', display: 'text' }
    },
    {
      prop: 'initialIssueDate',
      label: '首次领用时间',
      required: true,
      width: 170,
      formatter: (row) => (
        <ElDatePicker
          v-model={row.initialIssueDate}
          type="date"
          valueFormat="YYYY-MM-DD"
          placeholder="选择日期"
          class="!w-full"
        />
      )
    },
    {
      prop: 'issuanceCycle',
      label: '周期',
      width: 132,
      formatter: (row) => (
        <ElSelect v-model={row.issuanceCycle}>
          {cycleOptions.value.map((option) => (
            <ElOption key={option.value} label={option.label} value={option.value} />
          ))}
        </ElSelect>
      )
    },
    {
      prop: 'issuanceFrequency',
      label: '周期数',
      required: true,
      width: 140,
      formatter: (row) => (
        <ElInputNumber
          v-model={row.issuanceFrequency}
          min={1}
          max={9999}
          precision={0}
          class="!w-full"
        />
      )
    },
    {
      prop: 'nextIssueDate',
      label: '下次领用日期',
      required: true,
      width: 170,
      formatter: (row) => (
        <ElDatePicker
          v-model={row.nextIssueDate}
          type="date"
          valueFormat="YYYY-MM-DD"
          placeholder="选择日期"
          class="!w-full"
        />
      )
    }
  ])

  const handleSubmit = async (): Promise<boolean> => {
    if (!employee.value) return false
    if (!form.items.length) {
      ElMessage.warning('请先生成工器具个人标准')
      return false
    }
    if (form.items.some((item) => !item.initialIssueDate || !item.nextIssueDate)) {
      ElMessage.warning('请完整填写首次领用时间和下次领用日期')
      return false
    }
    try {
      await saveToolPersonalIssuePlan(
        employee.value.employeeId,
        form.items.map((item) => ({
          id: item.id,
          initialIssueDate: item.initialIssueDate,
          nextIssueDate: item.nextIssueDate,
          issuanceCycle: item.issuanceCycle,
          issuanceFrequency: item.issuanceFrequency
        }))
      )
      emit('success')
      return true
    } catch {
      return false
    }
  }

  const handleOpen = async (row: SmisToolPersonalStandard): Promise<void> => {
    employee.value = row
    form.items = []
    await dialogRef.value?.handleOpen(row, {
      title: '设置个人领用时间与周期',
      subtitle: '新岗员工由安全员维护首次领用日期和个人周期',
      confirmText: '保存领用计划',
      contentMaxHeight: '72vh',
      onOpen: async (_data, api) => {
        api.setLoading(true)
        loading.value = true
        try {
          await Promise.all([
            userStore.ensureDictLoaded('smisToolIssuanceCycle'),
            userStore.ensureDictLoaded('smisMaterialUnit')
          ])
          const result = await fetchToolPersonalStandardItems(row.employeeId)
          const today = dayjs().format('YYYY-MM-DD')
          form.items = (result.data ?? []).map((item) => ({
            ...item,
            initialIssueDate: item.initialIssueDate || today,
            nextIssueDate: item.nextIssueDate || item.initialIssueDate || today
          }))
        } finally {
          loading.value = false
          api.setLoading(false)
        }
      },
      onConfirm: handleSubmit
    })
  }

  defineExpose({ handleOpen })
</script>

<style scoped lang="scss">
  .personal-plan {
    &__notice {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 12px 16px;
      margin-bottom: 16px;
      color: var(--art-gray-800);
      background: var(--art-gray-100);
      border-radius: var(--el-border-radius-base);

      svg {
        flex: 0 0 auto;
        margin-top: 2px;
        font-size: 22px;
        color: var(--theme-color);
      }

      strong,
      p {
        display: block;
        margin: 0;
      }

      p {
        margin-top: 4px;
        color: var(--art-gray-700);
      }
    }
  }
</style>
