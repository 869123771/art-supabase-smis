<template>
  <ArtDialog ref="dialogRef" size="md">
    <div class="risk-map-scene-dialog">
      <div class="risk-map-scene-dialog__context">
        <span><ArtSvgIcon icon="ri:map-2-line" /></span>
        <div>
          <strong>建立场景层级与画布底图</strong>
          <p>上级场景用于组织全厂、区域与作业区层级；底图可后续随时替换。</p>
        </div>
      </div>
      <ArtForm
        ref="formRef"
        v-model="form.model"
        :items="form.items"
        :rules="form.rules"
        :span="12"
        :gutter="20"
        label-position="top"
        :show-reset="false"
        :show-submit="false"
      >
        <template #parentId>
          <ElTreeSelect
            v-model="form.model.parentId"
            :data="sceneTree"
            :props="treeProps"
            node-key="id"
            value-key="id"
            check-strictly
            filterable
            clearable
            default-expand-all
            placeholder="未选择时作为根场景"
            class="w-full"
          />
        </template>
        <template #backgroundUrl>
          <ArtUploadImage
            v-model="form.model.backgroundUrl"
            :limit="1"
            :size="132"
            title="上传场景底图"
            file-type="image/*"
          />
        </template>
      </ArtForm>
    </div>
  </ArtDialog>
</template>

<script setup lang="ts">
  import type { FormRules } from 'element-plus'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtForm, { type FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtUploadImage from '@/components/core/forms/art-upload-image/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { saveRiskMapScene, type SmisRiskMapScene, type SmisRiskMapScenePayload } from '@smis/api'

  export interface RiskMapSceneDialogOpenData {
    row?: SmisRiskMapScene
    sceneTree: SmisRiskMapScene[]
    presetParentId?: string
  }
  interface FormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
  }

  const emit = defineEmits<{ success: [id: string, type: 'add' | 'edit'] }>()
  const dialogRef = ref<ArtDialogExpose<RiskMapSceneDialogOpenData>>()
  const formRef = ref<FormExpose>()
  const sceneTree = shallowRef<SmisRiskMapScene[]>([])
  const treeProps = { label: 'sceneName', children: 'children', disabled: 'disabled' }
  const initial = (): SmisRiskMapScenePayload => ({
    parentId: null,
    sceneName: '',
    backgroundUrl: '',
    canvasWidth: 1000,
    canvasHeight: 650,
    sort: 10
  })
  const form = reactive<{
    model: SmisRiskMapScenePayload
    items: FormItem[]
    rules: FormRules<SmisRiskMapScenePayload>
  }>({
    model: initial(),
    items: [
      {
        label: '场景名称',
        key: 'sceneName',
        type: 'input',
        span: 24,
        props: { maxlength: 80, placeholder: '如 全厂风险图、生产一楼' }
      },
      { label: '上级场景', key: 'parentId', type: 'text', span: 24 },
      {
        label: '画布宽度',
        key: 'canvasWidth',
        type: 'number',
        props: { min: 480, max: 4000, step: 20, controlsPosition: 'right' }
      },
      {
        label: '画布高度',
        key: 'canvasHeight',
        type: 'number',
        props: { min: 320, max: 3000, step: 20, controlsPosition: 'right' }
      },
      {
        label: '排序',
        key: 'sort',
        type: 'number',
        props: { min: 0, max: 9999, controlsPosition: 'right' }
      },
      { label: '场景底图', key: 'backgroundUrl', type: 'text', span: 24 }
    ],
    rules: {
      sceneName: [{ required: true, message: '请输入场景名称', trigger: 'blur' }],
      canvasWidth: [{ required: true, message: '请输入画布宽度', trigger: 'change' }],
      canvasHeight: [{ required: true, message: '请输入画布高度', trigger: 'change' }]
    }
  })

  const markCurrentDisabled = (rows: SmisRiskMapScene[], currentId?: string): SmisRiskMapScene[] =>
    rows.map((row) => ({
      ...row,
      disabled: row.id === currentId,
      children: row.children ? markCurrentDisabled(row.children, currentId) : []
    })) as SmisRiskMapScene[]
  const handleSubmit = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()
      const result = await saveRiskMapScene({
        ...toRaw(form.model),
        sceneName: form.model.sceneName.trim(),
        backgroundUrl: form.model.backgroundUrl?.trim() || null
      })
      const id = String(result.data || form.model.id)
      emit('success', id, form.model.id ? 'edit' : 'add')
      return true
    } catch {
      return false
    }
  }
  const handleOpen = async (data: RiskMapSceneDialogOpenData): Promise<void> => {
    Object.assign(form.model, initial())
    sceneTree.value = markCurrentDisabled(data.sceneTree, data.row?.id)
    if (data.row) {
      Object.assign(form.model, {
        id: data.row.id,
        parentId: data.row.parentId || null,
        sceneName: data.row.sceneName,
        backgroundUrl: data.row.backgroundUrl || '',
        canvasWidth: data.row.canvasWidth,
        canvasHeight: data.row.canvasHeight,
        sort: data.row.sort
      })
    } else {
      form.model.parentId = data.presetParentId || null
    }
    await nextTick()
    formRef.value?.clearValidate()
    await dialogRef.value?.handleOpen(data, {
      title: data.row ? '编辑四色图场景' : '新增四色图场景',
      subtitle: '配置层级、画布尺寸与场景底图',
      confirmText: data.row ? '保存场景设置' : '创建场景',
      contentMaxHeight: 'calc(100vh - 180px)',
      onConfirm: handleSubmit
    })
  }

  defineExpose({ handleOpen })
</script>

<style scoped lang="scss">
  .risk-map-scene-dialog {
    &__context {
      display: grid;
      grid-template-columns: 44px minmax(0, 1fr);
      gap: var(--art-space-3);
      align-items: center;
      padding: var(--art-space-3) var(--art-space-4);
      margin-bottom: var(--art-space-4);
      background: color-mix(in srgb, var(--theme-color) 7%, var(--default-box-color));
      border-left: 3px solid var(--theme-color);
      border-radius: var(--el-border-radius-base);

      > span {
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
        font-size: var(--art-font-size-caption);
        color: var(--el-text-color-secondary);
      }
    }
  }
</style>
