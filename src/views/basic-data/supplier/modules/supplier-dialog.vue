<template>
  <ArtDialog ref="dialogRef" size="xl">
    <div class="supplier-dialog">
      <div class="supplier-dialog__context" role="note">
        <span aria-hidden="true"><ArtSvgIcon icon="ri:git-merge-line" /></span>
        <div>
          <strong>一处建档，多系统复用</strong>
          <p>单位编码与名称用于唯一识别；地图选点会同步回填详细地址、经度和纬度。</p>
        </div>
      </div>

      <ArtForm
        ref="formRef"
        v-model="form.model"
        :items="form.items"
        :rules="form.rules"
        :span="12"
        :gutter="24"
        label-position="top"
        :show-reset="false"
        :show-submit="false"
      >
        <template #addressPicker>
          <ArtAddressPicker
            v-model:address-detail="form.model.addressDetail"
            v-model:longitude="form.model.longitude"
            v-model:latitude="form.model.latitude"
            v-model:coordinate-system="form.model.coordinateSystem"
            hide-region-selector
            show-coordinate-hint
            :show-locate-button="true"
            detail-label="详细地址"
            detail-placeholder="输入地址后地图检索，或直接打开地图选点"
            label-width="86px"
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
  import ArtForm, {
    type FormItem,
    type FormItemOption
  } from '@/components/core/forms/art-form/index.vue'
  import ArtAddressPicker from '@/components/core/forms/art-address-picker/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { useUserStore } from '@/store/modules/user'
  import { saveSupplier, type SmisSupplier, type SmisSupplierSavePayload } from '@smis/api'
  import {
    getSupplierDictionaryOptions,
    SUPPLIER_DICTIONARY_CODES,
    type SupplierDictionaryCode
  } from '@smis/domain/supplier-dictionary'

  export interface SupplierDialogOpenData {
    row?: SmisSupplier
  }

  interface SupplierForm extends Omit<
    SmisSupplierSavePayload,
    | 'supplierGroup'
    | 'enterpriseNature'
    | 'industry'
    | 'contactPerson'
    | 'contactPhone'
    | 'region'
    | 'regionAdcode'
    | 'addressDetail'
    | 'remark'
  > {
    supplierGroup: string
    enterpriseNature: string
    industry: string
    contactPerson: string
    contactPhone: string
    region: string
    regionAdcode: string
    addressDetail: string
    remark: string
    addressPicker?: undefined
  }

  interface FormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
  }

  const emit = defineEmits<{ success: [type: 'add' | 'edit'] }>()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const dialogRef = ref<ArtDialogExpose<SupplierDialogOpenData>>()
  const formRef = ref<FormExpose>()

  const initialForm = (): SupplierForm => ({
    id: undefined,
    supplierCode: '',
    supplierName: '',
    supplierCategory: '',
    supplierGroup: '',
    supplierType: 'general',
    enterpriseNature: '',
    industry: '',
    contactPerson: '',
    contactPhone: '',
    region: '',
    regionAdcode: '',
    addressDetail: '',
    longitude: null,
    latitude: null,
    coordinateSystem: 'gcj02',
    remark: ''
  })

  const toOptions = (code: SupplierDictionaryCode): FormItemOption[] =>
    getSupplierDictionaryOptions(code, getDictMap.value[code])

  const form = reactive<{
    model: SupplierForm
    items: ComputedRef<FormItem[]>
    rules: FormRules<SupplierForm>
  }>({
    model: initialForm(),
    items: computed(() => [
      { label: '单位信息', key: 'identitySection', type: 'divider', span: 24 },
      {
        label: '单位编码',
        key: 'supplierCode',
        type: 'input',
        props: { maxlength: 40, clearable: true, placeholder: '如 SUP-0001' }
      },
      {
        label: '单位名称',
        key: 'supplierName',
        type: 'input',
        props: { maxlength: 120, clearable: true, placeholder: '请输入供应商完整单位名称' }
      },
      {
        label: '供应商类别',
        key: 'supplierCategory',
        type: 'select',
        options: toOptions('supplierCategory'),
        props: { clearable: true, placeholder: '请选择供应商类别' }
      },
      {
        label: '供应商分组',
        key: 'supplierGroup',
        type: 'input',
        props: { maxlength: 80, clearable: true, placeholder: '如 华东区域、年度框架' }
      },
      {
        label: '供应商类型',
        key: 'supplierType',
        type: 'select',
        span: 8,
        options: toOptions('supplierType'),
        props: { clearable: false, placeholder: '请选择供应商类型' }
      },
      {
        label: '企业性质',
        key: 'enterpriseNature',
        type: 'select',
        span: 8,
        options: toOptions('enterpriseNature'),
        props: { clearable: true, placeholder: '请选择企业性质' }
      },
      {
        label: '行业',
        key: 'industry',
        type: 'select',
        span: 8,
        options: toOptions('supplierIndustry'),
        props: { clearable: true, placeholder: '请选择行业' }
      },
      { label: '联系与位置', key: 'contactSection', type: 'divider', span: 24 },
      {
        label: '联系人',
        key: 'contactPerson',
        type: 'input',
        props: { maxlength: 50, clearable: true, placeholder: '请输入主要联系人' }
      },
      {
        label: '联系电话',
        key: 'contactPhone',
        type: 'input',
        props: { maxlength: 30, clearable: true, placeholder: '请输入手机号或座机号' }
      },
      { label: '', key: 'addressPicker', type: 'input', span: 24, labelWidth: 0 },
      { label: '补充信息', key: 'additionalSection', type: 'divider', span: 24 },
      {
        label: '备注',
        key: 'remark',
        type: 'input',
        span: 24,
        props: {
          type: 'textarea',
          rows: 3,
          maxlength: 500,
          showWordLimit: true,
          resize: 'none',
          placeholder: '可补充合作范围、资质情况或业务注意事项'
        }
      }
    ]),
    rules: {
      supplierCode: [
        { required: true, message: '请输入单位编码', trigger: 'blur' },
        {
          pattern: /^[A-Za-z0-9][A-Za-z0-9_-]*$/,
          message: '仅支持字母、数字、短横线和下划线',
          trigger: 'blur'
        },
        { max: 40, message: '单位编码不能超过 40 个字符', trigger: 'blur' }
      ],
      supplierName: [
        { required: true, message: '请输入单位名称', trigger: 'blur' },
        { max: 120, message: '单位名称不能超过 120 个字符', trigger: 'blur' }
      ],
      supplierCategory: [{ required: true, message: '请选择供应商类别', trigger: 'change' }],
      supplierGroup: [{ max: 80, message: '供应商分组不能超过 80 个字符', trigger: 'blur' }],
      supplierType: [{ required: true, message: '请选择供应商类型', trigger: 'change' }],
      enterpriseNature: [{ required: true, message: '请选择企业性质', trigger: 'change' }],
      industry: [{ required: true, message: '请选择行业', trigger: 'change' }],
      contactPerson: [{ max: 50, message: '联系人不能超过 50 个字符', trigger: 'blur' }],
      contactPhone: [
        {
          validator: (_rule, value, callback) => {
            if (!value) return callback()
            return /^(?:1[3-9]\d{9}|0\d{2,3}-?\d{7,8}|\+?\d[\d -]{5,19})$/.test(String(value))
              ? callback()
              : callback(new Error('请输入正确的手机号或座机号'))
          },
          trigger: 'blur'
        }
      ],
      addressDetail: [
        { required: true, message: '请输入详细地址', trigger: 'blur' },
        { max: 300, message: '详细地址不能超过 300 个字符', trigger: 'blur' }
      ],
      remark: [{ max: 500, message: '备注不能超过 500 个字符', trigger: 'blur' }]
    }
  })

  const resetForm = async (): Promise<void> => {
    Object.assign(form.model, initialForm())
    await nextTick()
    formRef.value?.clearValidate()
  }

  const handleSubmit = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()
      await saveSupplier({
        ...toRaw(form.model),
        supplierCode: form.model.supplierCode.trim().toUpperCase(),
        supplierName: form.model.supplierName.trim(),
        supplierGroup: form.model.supplierGroup?.trim() || null,
        contactPerson: form.model.contactPerson?.trim() || null,
        contactPhone: form.model.contactPhone?.trim() || null,
        region: form.model.region?.trim() || null,
        regionAdcode: form.model.regionAdcode?.trim() || null,
        addressDetail: form.model.addressDetail?.trim() || null,
        longitude: form.model.longitude === '' ? null : form.model.longitude,
        latitude: form.model.latitude === '' ? null : form.model.latitude,
        remark: form.model.remark?.trim() || null
      })
      emit('success', form.model.id ? 'edit' : 'add')
      return true
    } catch {
      return false
    }
  }

  const handleOpen = async (data: SupplierDialogOpenData): Promise<void> => {
    await resetForm()
    if (data.row) {
      Object.assign(form.model, {
        ...data.row,
        supplierGroup: data.row.supplierGroup || '',
        enterpriseNature: data.row.enterpriseNature || '',
        industry: data.row.industry || '',
        contactPerson: data.row.contactPerson || '',
        contactPhone: data.row.contactPhone || '',
        region: data.row.region || '',
        regionAdcode: data.row.regionAdcode || '',
        addressDetail: data.row.addressDetail || '',
        longitude: data.row.longitude ?? null,
        latitude: data.row.latitude ?? null,
        coordinateSystem: data.row.coordinateSystem || 'gcj02',
        remark: data.row.remark || ''
      })
    }

    await dialogRef.value?.handleOpen(data, {
      title: data.row ? '编辑供应商' : '新增供应商',
      subtitle: '维护跨系统共用的单位身份、分类口径、联系人和地图地址',
      confirmText: data.row ? '保存更改' : '创建供应商',
      contentMaxHeight: '72vh',
      onOpen: async (_openData, api) => {
        api.setLoading(true)
        try {
          await Promise.all(
            SUPPLIER_DICTIONARY_CODES.map((code) => userStore.ensureDictLoaded(code))
          )
        } finally {
          api.setLoading(false)
        }
      },
      onConfirm: handleSubmit,
      onReset: () => void resetForm()
    })
  }

  defineExpose({ handleOpen })
</script>

<style scoped lang="scss">
  .supplier-dialog {
    &__context {
      display: grid;
      grid-template-columns: 40px minmax(0, 1fr);
      gap: 12px;
      align-items: center;
      padding: 12px 14px;
      margin-bottom: 18px;
      background: color-mix(in srgb, var(--theme-color) 7%, var(--default-box-color));
      border-left: 3px solid var(--theme-color);
      border-radius: var(--el-border-radius-base);

      > span {
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        color: var(--theme-color);
        background: var(--default-box-color);
        border-radius: var(--el-border-radius-base);
      }

      strong {
        color: var(--el-text-color-primary);
      }

      p {
        margin: 3px 0 0;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
</style>
