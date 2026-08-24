# art-supabase-smis

Art Supabase Pro 的 SMIS 空壳应用。当前业务页面、组件、API、类型、测试、数据库对象、菜单、字典和 Edge Function 均已移除；登录、租户、布局、路由、公共组件、Store 和 Supabase 公共客户端继续由 `art-supabase-pro` 提供。

## 独立运行

```bash
pnpm install
pnpm dev
```

默认访问 `http://localhost:3014`。当前没有业务菜单或业务路由，可直接在 `src/views/` 下开始新的实现。

## 检查与部署

```bash
pnpm check
pnpm build
pnpm preview
```

生产构建统一输出到 `docs/`，默认静态路径为 `/art-supabase-smis/`，并自动生成 `docs/.nojekyll`，可直接作为 Pages 发布目录。

## 空壳边界

仓库只保留应用启动、构建、代码检查和模块元数据。新的 SMIS 实现应继续通过平台稳定契约访问公共能力，禁止直接引用其他业务仓源码。业务修改先在本仓提交推送，再由主仓更新 Git 子模块指针。
