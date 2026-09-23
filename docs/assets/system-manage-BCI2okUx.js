import{q as e,z as t}from"./user-DmyIQTTj.js";import"./style-tZUUXBRV.js";import"./supabase-BE_2VzjO.js";import{t as n}from"./tree-D_nZY1Id.js";var{supabase:r,keysToSnakeDeep:i,responseHandle:a}=t(),o=new n({idKey:`id`,parentKey:`parentId`,childrenKey:`children`});async function s(t={}){let n=e(t.tenantId),i=r.from(`mdm_organization`).select(`id,tenant_id,parent_id,organization_code,organization_name,organization_type,status,sort,is_system,
       tenant:sys_tenant!sys_organization_tenant_id_fkey(tenant_code,tenant_name)`).order(`sort`).order(`organization_name`);n&&(i=i.eq(`tenant_id`,n)),t.status&&(i=i.eq(`status`,t.status));let s=await a(()=>i,{showErrorMessage:!0});return{...s,data:o.listToTree(s.data??[],(e,t)=>(e.sort??0)-(t.sort??0)||e.organizationName.localeCompare(t.organizationName,`zh-CN`))}}async function c(e={}){if(!e?.tenantId)return{data:[],error:null};let t=await s({tenantId:e.tenantId,status:`1`}),n=e.excludeId?o.removeNodesByCondition(t.data??[],t=>t.id===e.excludeId).tree:t.data;return{...t,data:n}}async function l(e={}){if(!e?.tenantId)return{data:[],error:null};let t=r.from(`sys_user`).select(`
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