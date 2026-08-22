# art-supabase-smis

Art Supabase Pro 的 SMIS 安全生产业务应用。本仓只维护安全生产页面、业务 API、业务类型、数据库迁移与业务 Edge Function；登录、租户、菜单、权限、布局、路由、公共组件、Store 和 Supabase 公共客户端统一由 `art-supabase-pro` 提供。

## 独立运行

```bash
pnpm install
pnpm dev
```

默认访问 `http://localhost:3014`。独立运行时，SMIS 自身菜单提升为一级菜单；接入主平台时仍保留主平台的“SMIS 安全生产”应用目录。

## 检查与部署

```bash
pnpm check
pnpm build
pnpm preview
```

生产构建统一输出到 `docs/`，默认静态路径为 `/art-supabase-smis/`，并自动生成 `docs/.nojekyll`，可直接作为 Pages 发布目录。

## 模块边界

SMIS 与 HR、VMS 等模块通过平台提供的稳定集成契约读取人员和车辆数据，禁止直接引用其他业务仓源码。业务修改先在本仓提交推送，再由主仓更新 Git 子模块指针。
