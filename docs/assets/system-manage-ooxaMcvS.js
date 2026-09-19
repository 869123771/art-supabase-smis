import{K as e,R as t}from"./user-CkS2O_6I.js";import"./supabase-BE_2VzjO.js";import{t as n}from"./tree-D_nZY1Id.js";import"./tenantScope-BBTd2NDj.js";var{supabase:r,keysToSnakeDeep:i,responseHandle:a}=t(),o=new n({idKey:`id`,parentKey:`parentId`,childrenKey:`children`});async function s(t={}){let{keyword:n,tenantId:i,organizationType:o,status:s,recordId:c}=t,l=e(i),u=await a(()=>r.rpc(`get_organization_list_secure`,{p_keyword:n?.trim()||void 0,p_tenant_id:l,p_organization_type:o||void 0,p_status:s||void 0,p_record_id:c||void 0}),{showErrorMessage:!0});return{...u,total:u.data?.length??0}}async function c(e={}){let t=await s(e),n=t.data??[];return{...t,data:o.listToTree(n,(e,t)=>(e.sort??0)-(t.sort??0)||e.organizationName.localeCompare(t.organizationName,`zh-CN`))}}async function l(e={}){if(!e?.tenantId)return{data:[],error:null};let t=await c({tenantId:e.tenantId,status:`1`}),n=e.excludeId?o.removeNodesByCondition(t.data??[],t=>t.id===e.excludeId).tree:t.data;return{...t,data:n}}async function u(e={}){if(!e?.tenantId)return{data:[],error:null};let t=r.from(`sys_user`).select(`
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
      `).eq(`tenant_id`,e.tenantId).eq(`status`,`1`).is(`deleted_at`,null).order(`nick_name`,{ascending:!0});return await a(()=>t,{showErrorMessage:!0})}export{u as n,c as r,l as t};