import { createApp, defineComponent, h, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { setupGlobDirectives } from '@/directives'
import language from '@/locales'
import { store } from '@/store'
import { useUserStore } from '@/store/modules/user'
import InspectionCategoryDialog from '@smis/views/basic-data/inspection-category/modules/inspection-category-dialog.vue'
import '@styles/core/tailwind.css'
import '@styles/index.scss'

const tenantId = '11111111-1111-4111-8111-111111111111'
const Preview = defineComponent({
  setup() {
    const dialog = ref<{
      handleOpen: (data: { tenantId: string; tenantName: string }) => Promise<void>
    }>()
    return () =>
      h('main', { style: 'padding: 24px' }, [
        h(
          'button',
          {
            type: 'button',
            onClick: () => dialog.value?.handleOpen({ tenantId, tenantName: '视觉验收业务租户' })
          },
          '打开检验类别弹窗'
        ),
        h(InspectionCategoryDialog, { ref: dialog })
      ])
  }
})

const app = createApp(Preview)
app.use(store)
app.use(
  createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }]
  })
)
app.use(language)
setupGlobDirectives(app)

const userStore = useUserStore(store)
userStore.setUserInfo({
  userId: '22222222-2222-4222-8222-222222222222',
  tenantId,
  platformSuper: false
} as Api.Auth.UserInfo)
userStore.setDictMap({
  commonEnabledStatus: [
    { name: '启用', code: 'enabled', value: 'enabled', label: '启用', status: '1' },
    { name: '停用', code: 'disabled', value: 'disabled', label: '停用', status: '1' }
  ]
})
userStore.ensureDictLoaded = async () => undefined

app.mount('#inspection-category-feedback-preview')
