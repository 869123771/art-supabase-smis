import{t as e}from"./tree-Cmqyq6lG.js";import"./user-CUXYsC87.js";import{f as t,i as n}from"./useWebsiteConfig-ZjxRBOvx.js";import"./style-B0L_jseh.js";import"./supabase-B6_wT17x.js";var{supabase:r,keysToSnakeDeep:i,responseHandle:a}=n(),o=new e({idKey:`id`,parentKey:`parentId`,childrenKey:`children`});async function s(e={}){let n=t(e.tenantId),i=r.from(`mdm_organization`).select(`id,tenant_id,parent_id,organization_code,organization_name,organization_type,status,sort,is_system,
       tenant:sys_tenant!sys_organization_tenant_id_fkey(tenant_code,tenant_name)`).order(`sort`).order(`organization_name`);n&&(i=i.eq(`tenant_id`,n)),e.status&&(i=i.eq(`status`,e.status));let s=await a(()=>i,{showErrorMessage:!0});return{...s,data:o.listToTree(s.data??[],(e,t)=>(e.sort??0)-(t.sort??0)||e.organizationName.localeCompare(t.organizationName,`zh-CN`))}}async function c(e={}){if(!e?.tenantId)return{data:[],error:null};let t=await s({tenantId:e.tenantId,status:`1`}),n=e.excludeId?o.removeNodesByCondition(t.data??[],t=>t.id===e.excludeId).tree:t.data;return{...t,data:n}}async function l(e={}){if(!e?.tenantId)return{data:[],error:null};let t=r.from(`sys_user`).select(`
        id,
        tenant_id,
        organization_id,
        avatar,
        user_name,
        nick_name,
        user_email,
        status,
        organization:mdm_organization!sys_user_organization_id_fkey(
          id,
          organization_code,
          organization_name
        )
      `).eq(`tenant_id`,e.tenantId).eq(`status`,`1`).is(`deleted_at`,null).order(`nick_name`,{ascending:!0});return await a(()=>t,{showErrorMessage:!0})}export{l as n,s as r,c as t};