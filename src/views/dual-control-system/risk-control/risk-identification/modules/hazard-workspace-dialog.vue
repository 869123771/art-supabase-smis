<template>
  <ArtDialog ref="dialogRef" size="xl">
    <div class="hazard-workspace">
      <div class="hazard-workspace__summary">
        <span aria-hidden="true"><ArtSvgIcon icon="ri:links-line" /></span>
        <div>
          <strong>{{ riskPoint?.pointName }}</strong>
          <p>{{ riskPoint?.pointNo }} · 作业活动与危害因素可多对多关联</p>
        </div>
        <div class="hazard-workspace__counts">
          <span
            ><strong>{{ activities.length }}</strong
            ><small>作业活动</small></span
          >
          <span
            ><strong>{{ hazards.length }}</strong
            ><small>危害因素</small></span
          >
        </div>
      </div>

      <div class="hazard-workspace__grid">
        <ArtSectionCard
          title="作业 / 活动信息"
          subtitle="维护作业活动与必经作业步骤"
          :loading="loading"
          :error="error"
          :empty="!loading && !error && !activities.length && !activityEditor.visible"
          empty-title="暂无作业活动"
          empty-description="先新增作业活动，再与一个或多个危害因素关联。"
          :min-height="460"
          @retry="loadWorkspace"
        >
          <template #actions>
            <ElButton
              v-auth="'SmisDualControlRiskIdentification:MaintainHazards'"
              type="primary"
              plain
              :icon="Plus"
              @click="openActivityEditor()"
              >新增作业活动</ElButton
            >
          </template>

          <div v-if="activityEditor.visible" class="hazard-workspace__editor">
            <ElForm label-position="top">
              <ElFormItem label="作业活动" required>
                <ElInput
                  v-model="activityEditor.form.activityName"
                  maxlength="300"
                  placeholder="请输入作业活动名称"
                />
              </ElFormItem>
              <ElFormItem label="作业步骤" required>
                <ElInput
                  v-model="activityEditor.form.workStep"
                  type="textarea"
                  :rows="3"
                  maxlength="1000"
                  show-word-limit
                  resize="none"
                  placeholder="描述该活动的关键作业步骤"
                />
              </ElFormItem>
              <div class="hazard-workspace__editor-actions">
                <ElButton @click="activityEditor.visible = false">取消</ElButton>
                <ElButton
                  v-auth="'SmisDualControlRiskIdentification:MaintainHazards'"
                  type="primary"
                  :loading="activityEditor.submitting"
                  @click="submitActivity"
                  >保存活动</ElButton
                >
              </div>
            </ElForm>
          </div>

          <ElScrollbar class="hazard-workspace__scrollbar">
            <ElTable :data="activities" row-key="id" table-layout="fixed">
              <ElTableColumn type="index" label="序号" width="58" />
              <ElTableColumn
                prop="activityName"
                label="作业活动"
                min-width="150"
                show-overflow-tooltip
              />
              <ElTableColumn
                prop="workStep"
                label="作业步骤"
                min-width="180"
                show-overflow-tooltip
              />
              <ElTableColumn label="关联危害" width="88" align="center">
                <template #default="{ row }"
                  ><ElTag effect="plain">{{ row.hazardCount }} 条</ElTag></template
                >
              </ElTableColumn>
              <ElTableColumn label="操作" width="92" fixed="right">
                <template #default="{ row }">
                  <div class="hazard-workspace__row-actions">
                    <ArtButtonTable
                      type="edit"
                      permission="SmisDualControlRiskIdentification:MaintainHazards"
                      label="编辑作业活动"
                      @click="openActivityEditorRow(row)"
                    />
                    <ArtButtonTable
                      type="delete"
                      permission="SmisDualControlRiskIdentification:MaintainHazards"
                      label="删除作业活动"
                      @click="removeActivityRow(row)"
                    />
                  </div>
                </template>
              </ElTableColumn>
            </ElTable>
          </ElScrollbar>
        </ArtSectionCard>

        <ArtSectionCard
          title="危害因素"
          subtitle="维护类别、事故类型、后果及关联作业活动"
          :loading="loading"
          :error="error"
          :empty="!loading && !error && !hazards.length && !hazardEditor.visible"
          empty-title="暂无危害因素"
          empty-description="新增后系统会按风险点编号生成 -WHYS- 三位流水码。"
          :min-height="460"
          @retry="loadWorkspace"
        >
          <template #actions>
            <ElButton
              v-auth="'SmisDualControlRiskIdentification:MaintainHazards'"
              type="primary"
              plain
              :icon="Plus"
              @click="openHazardEditor()"
              >新增危害因素</ElButton
            >
          </template>

          <div v-if="hazardEditor.visible" class="hazard-workspace__editor">
            <ElForm label-position="top">
              <div class="hazard-workspace__editor-grid">
                <ElFormItem label="危害编号">
                  <ElInput
                    :model-value="hazardEditor.form.hazardNo"
                    disabled
                    placeholder="保存后自动生成"
                  />
                </ElFormItem>
                <ElFormItem label="危害因素类别" required>
                  <ElSelect
                    v-model="hazardEditor.form.factorCategoryId"
                    filterable
                    class="w-full"
                    placeholder="选择危害因素类别"
                  >
                    <ElOption
                      v-for="item in options.hazardCategories"
                      :key="item.id"
                      :label="`${item.categoryName} · ${item.categoryCode}`"
                      :value="item.id"
                    />
                  </ElSelect>
                </ElFormItem>
              </div>
              <ElFormItem label="危害因素" required>
                <ElInput
                  v-model="hazardEditor.form.hazardFactor"
                  type="textarea"
                  :rows="3"
                  maxlength="1500"
                  show-word-limit
                  resize="none"
                  placeholder="描述人的、物的、环境或管理方面的危害因素"
                />
              </ElFormItem>
              <ElFormItem label="事故类型（可多选）">
                <ElSelect
                  v-model="hazardEditor.form.accidentTypes"
                  multiple
                  filterable
                  collapse-tags
                  collapse-tags-tooltip
                  class="w-full"
                  placeholder="选择可能导致的事故类型"
                >
                  <ElOption v-for="item in accidentTypeOptions" :key="item.value" v-bind="item" />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="关联作业活动（可多选）">
                <ElSelect
                  v-model="hazardEditor.form.activityIds"
                  multiple
                  filterable
                  collapse-tags
                  collapse-tags-tooltip
                  class="w-full"
                  placeholder="选择与该危害因素相关的作业活动"
                >
                  <ElOption
                    v-for="item in activities"
                    :key="item.id"
                    :label="`${item.activityName} · ${item.workStep}`"
                    :value="item.id"
                  />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="后果及影响">
                <ElInput
                  v-model="hazardEditor.form.consequence"
                  type="textarea"
                  :rows="3"
                  maxlength="2000"
                  show-word-limit
                  resize="none"
                  placeholder="说明可能造成的人员、设备、环境或经营影响"
                />
              </ElFormItem>
              <div class="hazard-workspace__editor-actions">
                <ElButton @click="hazardEditor.visible = false">取消</ElButton>
                <ElButton
                  v-auth="'SmisDualControlRiskIdentification:MaintainHazards'"
                  type="primary"
                  :loading="hazardEditor.submitting"
                  @click="submitHazard"
                  >保存危害因素</ElButton
                >
              </div>
            </ElForm>
          </div>

          <ElScrollbar class="hazard-workspace__scrollbar">
            <ElTable :data="hazards" row-key="id" table-layout="fixed">
              <ElTableColumn
                prop="hazardNo"
                label="危害编号"
                min-width="170"
                show-overflow-tooltip
              />
              <ElTableColumn
                prop="hazardFactor"
                label="危害因素"
                min-width="190"
                show-overflow-tooltip
              />
              <ElTableColumn
                prop="factorCategoryName"
                label="因素类别"
                min-width="130"
                show-overflow-tooltip
              />
              <ElTableColumn label="事故类型" min-width="160">
                <template #default="{ row }">
                  <div class="hazard-workspace__tags">
                    <ArtDictDisplay
                      v-for="value in row.accidentTypes.slice(0, 2)"
                      :key="value"
                      dict-code="smisAccidentCategory"
                      :value="value"
                      display="tag"
                    />
                    <ElTag v-if="row.accidentTypes.length > 2" type="info" effect="plain"
                      >+{{ row.accidentTypes.length - 2 }}</ElTag
                    >
                    <span v-if="!row.accidentTypes.length">—</span>
                  </div>
                </template>
              </ElTableColumn>
              <ElTableColumn label="关联活动" width="88" align="center">
                <template #default="{ row }"
                  ><ElTag effect="plain">{{ row.activityIds.length }} 项</ElTag></template
                >
              </ElTableColumn>
              <ElTableColumn label="操作" width="92" fixed="right">
                <template #default="{ row }">
                  <div class="hazard-workspace__row-actions">
                    <ArtButtonTable
                      type="edit"
                      permission="SmisDualControlRiskIdentification:MaintainHazards"
                      label="编辑危害因素"
                      @click="openHazardEditorRow(row)"
                    />
                    <ArtButtonTable
                      type="delete"
                      permission="SmisDualControlRiskIdentification:MaintainHazards"
                      label="删除危害因素"
                      @click="removeHazardRow(row)"
                    />
                  </div>
                </template>
              </ElTableColumn>
            </ElTable>
          </ElScrollbar>
        </ArtSectionCard>
      </div>
    </div>

    <template #footer="{ api }">
      <span class="hazard-workspace__footer-note">所有新增、编辑和删除操作均实时保存</span>
      <ElButton type="primary" @click="api.handleClose(true)">完成维护</ElButton>
    </template>
  </ArtDialog>
</template>

<script setup lang="ts">
  import { Plus } from '@element-plus/icons-vue'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtSectionCard from '@/components/core/surfaces/art-section-card/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { useArtFeedback } from '@/hooks/core/useArtFeedback'
  import { useUserStore } from '@/store/modules/user'
  import {
    deleteRiskActivities,
    deleteRiskHazards,
    fetchRiskHazardWorkspace,
    saveRiskActivity,
    saveRiskHazard,
    type SmisRiskActivity,
    type SmisRiskHazard,
    type SmisRiskIdentificationOptions,
    type SmisRiskPoint
  } from '@smis/api'

  export interface HazardWorkspaceDialogOpenData {
    riskPoint: SmisRiskPoint
    options: SmisRiskIdentificationOptions
  }
  interface ActivityForm {
    id?: string
    activityName: string
    workStep: string
    sort: number
  }
  interface HazardForm {
    id?: string
    hazardNo: string
    hazardFactor: string
    factorCategoryId: string
    accidentTypes: string[]
    consequence: string
    activityIds: string[]
    sort: number
  }

  const emit = defineEmits<{ changed: [] }>()
  const dialogRef = ref<ArtDialogExpose<HazardWorkspaceDialogOpenData>>()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const { confirmDelete } = useArtFeedback()
  const riskPoint = shallowRef<SmisRiskPoint>()
  const options = shallowRef<SmisRiskIdentificationOptions>({
    sites: [],
    organizations: [],
    equipment: [],
    hazardCategories: []
  })
  const activities = shallowRef<SmisRiskActivity[]>([])
  const hazards = shallowRef<SmisRiskHazard[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const activityEditor = reactive({
    visible: false,
    submitting: false,
    form: { activityName: '', workStep: '', sort: 0 } as ActivityForm
  })
  const hazardEditor = reactive({
    visible: false,
    submitting: false,
    form: {
      hazardNo: '',
      hazardFactor: '',
      factorCategoryId: '',
      accidentTypes: [],
      consequence: '',
      activityIds: [],
      sort: 0
    } as HazardForm
  })
  const accidentTypeOptions = computed(() =>
    (getDictMap.value.smisAccidentCategory ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  )

  const loadWorkspace = async (): Promise<void> => {
    if (!riskPoint.value) return
    loading.value = true
    error.value = null
    try {
      const workspace = await fetchRiskHazardWorkspace(riskPoint.value.id)
      activities.value = workspace.activities
      hazards.value = workspace.hazards
    } catch {
      error.value = '危害因素数据加载失败，请检查网络后重试。'
    } finally {
      loading.value = false
    }
  }
  const openActivityEditor = (row?: SmisRiskActivity): void => {
    Object.assign(activityEditor.form, {
      id: row?.id,
      activityName: row?.activityName ?? '',
      workStep: row?.workStep ?? '',
      sort: row?.sort ?? activities.value.length * 10
    })
    activityEditor.visible = true
  }
  const openActivityEditorRow = (row: unknown): void => openActivityEditor(row as SmisRiskActivity)
  const submitActivity = async (): Promise<void> => {
    if (!riskPoint.value || activityEditor.submitting) return
    if (!activityEditor.form.activityName.trim() || !activityEditor.form.workStep.trim()) {
      ElMessage.warning('请完整填写作业活动和作业步骤')
      return
    }
    try {
      activityEditor.submitting = true
      await saveRiskActivity({
        ...toRaw(activityEditor.form),
        riskPointId: riskPoint.value.id,
        activityName: activityEditor.form.activityName.trim(),
        workStep: activityEditor.form.workStep.trim()
      })
      activityEditor.visible = false
      await loadWorkspace()
      emit('changed')
    } finally {
      activityEditor.submitting = false
    }
  }
  const removeActivity = async (row: SmisRiskActivity): Promise<void> => {
    try {
      await confirmDelete(`确定删除作业活动“${row.activityName}”吗？其危害关联会同步解除。`)
      await deleteRiskActivities([row.id])
      await loadWorkspace()
      emit('changed')
    } catch {
      /* 用户取消 */
    }
  }
  const removeActivityRow = (row: unknown): void => void removeActivity(row as SmisRiskActivity)
  const openHazardEditor = (row?: SmisRiskHazard): void => {
    Object.assign(hazardEditor.form, {
      id: row?.id,
      hazardNo: row?.hazardNo ?? '',
      hazardFactor: row?.hazardFactor ?? '',
      factorCategoryId: row?.factorCategoryId ?? '',
      accidentTypes: [...(row?.accidentTypes ?? [])],
      consequence: row?.consequence ?? '',
      activityIds: [...(row?.activityIds ?? [])],
      sort: row?.sort ?? hazards.value.length * 10
    })
    hazardEditor.visible = true
  }
  const openHazardEditorRow = (row: unknown): void => openHazardEditor(row as SmisRiskHazard)
  const submitHazard = async (): Promise<void> => {
    if (!riskPoint.value || hazardEditor.submitting) return
    if (!hazardEditor.form.hazardFactor.trim() || !hazardEditor.form.factorCategoryId) {
      ElMessage.warning('请完整填写危害因素和危害因素类别')
      return
    }
    try {
      hazardEditor.submitting = true
      await saveRiskHazard({
        id: hazardEditor.form.id,
        riskPointId: riskPoint.value.id,
        hazardFactor: hazardEditor.form.hazardFactor.trim(),
        factorCategoryId: hazardEditor.form.factorCategoryId,
        accidentTypes: [...hazardEditor.form.accidentTypes],
        consequence: hazardEditor.form.consequence.trim() || null,
        activityIds: [...hazardEditor.form.activityIds],
        sort: hazardEditor.form.sort
      })
      hazardEditor.visible = false
      await loadWorkspace()
      emit('changed')
    } finally {
      hazardEditor.submitting = false
    }
  }
  const removeHazard = async (row: SmisRiskHazard): Promise<void> => {
    try {
      await confirmDelete(`确定删除危害因素“${row.hazardNo}”吗？已完成评价的危害因素不会被删除。`)
      await deleteRiskHazards([row.id])
      await loadWorkspace()
      emit('changed')
    } catch {
      /* 用户取消 */
    }
  }
  const removeHazardRow = (row: unknown): void => void removeHazard(row as SmisRiskHazard)
  const handleOpen = async (data: HazardWorkspaceDialogOpenData): Promise<void> => {
    riskPoint.value = data.riskPoint
    options.value = data.options
    activityEditor.visible = false
    hazardEditor.visible = false
    await dialogRef.value?.handleOpen(data, {
      title: '维护危害因素',
      subtitle: `${data.riskPoint.pointNo} · ${data.riskPoint.pointName}`,
      contentMaxHeight: 'calc(100vh - 130px)',
      loading: true,
      onOpen: async (_data, api) => {
        try {
          await Promise.all([loadWorkspace(), userStore.ensureDictLoaded('smisAccidentCategory')])
        } finally {
          api.setLoading(false)
        }
      }
    })
  }
  onDeactivated(() => dialogRef.value?.handleClose())
  defineExpose({ handleOpen })
</script>

<style scoped lang="scss">
  .hazard-workspace {
    min-width: 0;

    &__summary {
      display: grid;
      grid-template-columns: 44px minmax(0, 1fr) auto;
      gap: 12px;
      align-items: center;
      padding: 14px 16px;
      margin-bottom: 14px;
      background: color-mix(in srgb, var(--theme-color) 7%, var(--default-box-color));
      border-left: 3px solid var(--theme-color);
      border-radius: var(--el-border-radius-base);

      > span:first-child {
        display: grid;
        place-items: center;
        width: 44px;
        height: 44px;
        color: var(--theme-color);
        background: var(--default-box-color);
        border-radius: var(--el-border-radius-base);
      }

      p {
        margin: 3px 0 0;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    &__counts {
      display: flex;
      gap: 8px;

      span {
        display: grid;
        min-width: 78px;
        padding: 7px 10px;
        text-align: center;
        background: var(--default-box-color);
        border-radius: var(--el-border-radius-base);
      }

      strong {
        color: var(--theme-color);
      }

      small {
        color: var(--el-text-color-secondary);
      }
    }

    &__grid {
      display: grid;
      grid-template-columns: minmax(360px, 0.9fr) minmax(500px, 1.25fr);
      gap: 14px;
      min-width: 0;
    }

    &__editor {
      padding: 14px;
      margin-bottom: 12px;
      background: color-mix(in srgb, var(--theme-color) 4%, var(--el-fill-color-extra-light));
      border: 1px solid color-mix(in srgb, var(--theme-color) 16%, var(--el-border-color-light));
      border-radius: var(--el-border-radius-base);
    }

    &__editor-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    &__editor-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    &__scrollbar {
      height: 390px;
    }

    &__row-actions,
    &__tags {
      display: flex;
      gap: 4px;
      align-items: center;
      min-width: 0;
    }

    &__tags {
      flex-wrap: wrap;
    }

    &__footer-note {
      flex: 1;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      text-align: left;
    }
  }

  @media (width <= 1080px) {
    .hazard-workspace__grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .hazard-workspace__scrollbar {
      height: 320px;
    }
  }

  @media (width <= 680px) {
    .hazard-workspace__summary {
      grid-template-columns: 40px minmax(0, 1fr);
    }

    .hazard-workspace__counts {
      grid-column: 1 / -1;
    }

    .hazard-workspace__editor-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
