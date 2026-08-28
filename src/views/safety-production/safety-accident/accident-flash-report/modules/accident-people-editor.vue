<template>
  <div class="accident-people-editor">
    <div class="accident-people-editor__toolbar">
      <div>
        <strong>人员信息</strong>
        <span>批量选择员工后自动固化事故发生时的人事档案快照</span>
      </div>
      <AccidentEmployeeMultipleSelect
        :model-value="selectedIds"
        :selected-data="selectedEmployees"
        @update:selected-data="handleSelectedEmployees"
      />
    </div>

    <ElTable
      v-if="rows.length"
      :data="rows"
      row-key="localKey"
      table-layout="fixed"
      class="accident-people-editor__table"
    >
      <ElTableColumn type="expand" width="48">
        <template #default="{ row, $index }">
          <div class="accident-people-editor__detail">
            <dl class="accident-people-editor__snapshot">
              <div
                ><dt>公司</dt><dd>{{ row.companyName || '—' }}</dd></div
              >
              <div
                ><dt>作业部</dt><dd>{{ row.operationDepartmentName || '—' }}</dd></div
              >
              <div
                ><dt>作业区</dt><dd>{{ row.operationAreaName || '—' }}</dd></div
              >
              <div
                ><dt>班组</dt><dd>{{ row.teamName || '—' }}</dd></div
              >
              <div
                ><dt>身份证号</dt><dd>{{ row.idCardNo || '—' }}</dd></div
              >
              <div
                ><dt>手机号码</dt><dd>{{ row.phone || '—' }}</dd></div
              >
              <div
                ><dt>文化程度</dt><dd>{{ row.educationLevel || '—' }}</dd></div
              >
              <div class="is-wide"
                ><dt>家庭住址</dt><dd>{{ row.homeAddress || '—' }}</dd></div
              >
            </dl>
            <div class="accident-people-editor__injury-grid">
              <label>
                <span>工种年龄（年）</span>
                <ElInputNumber
                  :model-value="toNumber(row.jobYears)"
                  :min="0"
                  :max="100"
                  :precision="1"
                  controls-position="right"
                  placeholder="请输入"
                  @update:model-value="patchRow($index, { jobYears: $event })"
                />
              </label>
              <label>
                <span>受过几级安全教育</span>
                <ElInput
                  :model-value="row.safetyEducationLevel || ''"
                  maxlength="80"
                  placeholder="例如：三级安全教育"
                  @update:model-value="patchRow($index, { safetyEducationLevel: $event })"
                />
              </label>
              <label>
                <span>受害性质</span>
                <ElInput
                  :model-value="row.victimNature || ''"
                  maxlength="100"
                  placeholder="请输入受害性质"
                  @update:model-value="patchRow($index, { victimNature: $event })"
                />
              </label>
              <label>
                <span>伤害部位</span>
                <ElInput
                  :model-value="row.injuryPart || ''"
                  maxlength="100"
                  placeholder="请输入伤害部位"
                  @update:model-value="patchRow($index, { injuryPart: $event })"
                />
              </label>
              <label>
                <span>伤害程度</span>
                <ElInput
                  :model-value="row.injuryDegree || ''"
                  maxlength="100"
                  placeholder="请输入伤害程度"
                  @update:model-value="patchRow($index, { injuryDegree: $event })"
                />
              </label>
              <label class="is-wide">
                <span>备注</span>
                <ElInput
                  :model-value="row.remark || ''"
                  type="textarea"
                  :rows="2"
                  maxlength="500"
                  show-word-limit
                  resize="none"
                  placeholder="补充人员伤害或处置说明"
                  @update:model-value="patchRow($index, { remark: $event })"
                />
              </label>
            </div>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn type="index" label="序号" width="64" align="center" />
      <ElTableColumn label="人员" min-width="180">
        <template #default="{ row }">
          <div class="accident-people-editor__identity">
            <strong>{{ row.employeeName }}</strong>
            <span>{{ row.employeeNo }}</span>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn label="组织路径" min-width="240">
        <template #default="{ row }">{{ organizationPath(row) }}</template>
      </ElTableColumn>
      <ElTableColumn label="性别 / 年龄" width="108">
        <template #default="{ row }">{{ row.gender || '—' }} / {{ row.age ?? '—' }}</template>
      </ElTableColumn>
      <ElTableColumn label="工种 / 工龄" min-width="160">
        <template #default="{ row }">
          {{ row.jobTitle || '—' }} · {{ formatYears(row.workYears) }}
        </template>
      </ElTableColumn>
      <ElTableColumn label="伤害摘要" min-width="190">
        <template #default="{ row }">
          {{
            [row.victimNature, row.injuryPart, row.injuryDegree].filter(Boolean).join(' · ') ||
            '待补充'
          }}
        </template>
      </ElTableColumn>
      <ElTableColumn label="操作" width="76" align="center">
        <template #default="{ $index }">
          <ElButton link type="danger" aria-label="移除事故人员" @click="removeRow($index)">
            移除
          </ElButton>
        </template>
      </ElTableColumn>
    </ElTable>
    <ArtEmptyState
      v-else
      title="暂无事故相关人员"
      description="如事故涉及人员，可从员工花名册批量选择并补充伤害信息。"
      size="compact"
    />
  </div>
</template>

<script setup lang="ts">
  import { cloneDeep, omit } from 'lodash-es'
  import ArtEmptyState from '@/components/core/feedback/art-empty-state/index.vue'
  import type { SmisAccidentEmployee, SmisAccidentPerson } from '@smis/api'
  import AccidentEmployeeMultipleSelect from '../../shared/accident-employee-multiple-select.vue'

  interface EditorRow extends SmisAccidentPerson {
    localKey: string
  }

  const props = withDefaults(defineProps<{ modelValue?: SmisAccidentPerson[] }>(), {
    modelValue: () => []
  })
  const emit = defineEmits<{ 'update:modelValue': [value: SmisAccidentPerson[]] }>()
  const rows = ref<EditorRow[]>([])
  let localSequence = 0
  const createLocalKey = (): string => `person-${Date.now()}-${localSequence++}`
  const toEditorRows = (value: SmisAccidentPerson[]): EditorRow[] =>
    cloneDeep(value).map((item) => ({ ...item, localKey: item.id || createLocalKey() }))
  watch(
    () => props.modelValue,
    (value) => {
      rows.value = toEditorRows(value)
    },
    { immediate: true }
  )
  const selectedIds = computed(() => rows.value.map((row) => row.employeeId))
  const selectedEmployees = computed<SmisAccidentEmployee[]>(() =>
    rows.value.map((row) => ({
      id: row.employeeId,
      tenantId: '',
      employeeNo: row.employeeNo,
      employeeName: row.employeeName,
      employmentStatus: 'active',
      gender: row.gender,
      idCardNo: row.idCardNo,
      age: row.age,
      phone: row.phone,
      jobTitle: row.jobTitle,
      workYears: row.workYears,
      educationLevel: row.educationLevel,
      homeAddress: row.homeAddress,
      companyName: row.companyName,
      operationDepartmentName: row.operationDepartmentName,
      operationAreaName: row.operationAreaName,
      teamName: row.teamName
    }))
  )
  const sync = (): void =>
    emit(
      'update:modelValue',
      rows.value.map((row, index) => ({ ...omit(row, 'localKey'), sort: index }))
    )
  const patchRow = (index: number, patch: Partial<EditorRow>): void => {
    const next = cloneDeep(rows.value)
    Object.assign(next[index], patch)
    rows.value = next
    sync()
  }
  const handleSelectedEmployees = (employees: SmisAccidentEmployee[]): void => {
    const existing = new Map(rows.value.map((row) => [row.employeeId, row]))
    rows.value = employees.map((employee, index) => {
      const current = existing.get(employee.id)
      if (current) return { ...current, sort: index }
      return {
        localKey: createLocalKey(),
        employeeId: employee.id,
        companyName: employee.companyName,
        operationDepartmentName: employee.operationDepartmentName,
        operationAreaName: employee.operationAreaName,
        teamName: employee.teamName,
        employeeNo: employee.employeeNo,
        employeeName: employee.employeeName,
        gender: employee.gender,
        idCardNo: employee.idCardNo,
        age: employee.age,
        phone: employee.phone,
        jobTitle: employee.jobTitle,
        workYears: employee.workYears,
        jobYears: null,
        safetyEducationLevel: null,
        victimNature: null,
        injuryPart: null,
        injuryDegree: null,
        educationLevel: employee.educationLevel,
        homeAddress: employee.homeAddress,
        remark: null,
        sort: index
      }
    })
    sync()
  }
  const removeRow = (index: number): void => {
    rows.value.splice(index, 1)
    sync()
  }
  type OrganizationField =
    'companyName' | 'operationDepartmentName' | 'operationAreaName' | 'teamName'

  const organizationFields: OrganizationField[] = [
    'companyName',
    'operationDepartmentName',
    'operationAreaName',
    'teamName'
  ]

  const organizationPath = (value: unknown): string => {
    if (!value || typeof value !== 'object') return '未分配组织'

    const labels = organizationFields.flatMap((field) => {
      if (!(field in value)) return []
      const fieldValue: unknown = Reflect.get(value, field)
      return typeof fieldValue === 'string' && fieldValue.trim() ? [fieldValue] : []
    })

    return labels.join(' / ') || '未分配组织'
  }
  const toNumber = (value: number | string | null | undefined): number | undefined => {
    if (value === null || value === undefined || value === '') return undefined
    const numberValue = Number(value)
    return Number.isFinite(numberValue) ? numberValue : undefined
  }
  const formatYears = (value: number | string | null | undefined): string => {
    const numberValue = toNumber(value)
    return numberValue === undefined ? '—' : `${numberValue} 年`
  }
</script>

<style scoped lang="scss">
  .accident-people-editor {
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

    &__detail {
      display: grid;
      gap: 16px;
      padding: 16px 20px 18px;
      background: var(--art-gray-100);
    }

    &__snapshot {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px 20px;
      margin: 0;

      > div {
        min-width: 0;
      }

      .is-wide {
        grid-column: span 2;
      }

      dt {
        margin-bottom: 3px;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }

      dd {
        margin: 0;
        color: var(--el-text-color-primary);
        overflow-wrap: anywhere;
      }
    }

    &__injury-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px 18px;
      padding-top: 16px;
      border-top: 1px solid var(--el-border-color-lighter);

      label {
        display: grid;
        gap: 6px;
        min-width: 0;

        > span {
          font-size: 13px;
          color: var(--el-text-color-regular);
        }
      }

      .is-wide {
        grid-column: span 2;
      }
    }

    &__identity {
      display: grid;
      min-width: 0;

      strong,
      span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      span {
        margin-top: 2px;
        font-family: var(--art-font-family-mono, Consolas, monospace);
        font-size: 11px;
        color: var(--el-text-color-secondary);
      }
    }

    @media (width <= 900px) {
      &__snapshot,
      &__injury-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (width <= 640px) {
      &__toolbar {
        flex-direction: column;
        align-items: flex-start;
      }

      &__snapshot,
      &__injury-grid {
        grid-template-columns: minmax(0, 1fr);

        .is-wide {
          grid-column: auto;
        }
      }
    }
  }
</style>
