-- Transactional regression test for the document-driven SMIS workflow.
-- Run with a privileged database connection; every test row is rolled back.
begin;

do $test$
declare
  v_auth_id uuid;
  v_inbound public.smis_business_record;
  v_outbound public.smis_business_record;
  v_permit public.smis_business_record;
  v_exam public.smis_business_record;
  v_attempt public.smis_exam_attempt;
  v_available numeric;
  v_event_count integer;
  v_rejected boolean := false;
begin
  select user_row.auth_user_id
  into v_auth_id
  from public.sys_user user_row
  join public.sys_role role_row
    on role_row.role_code = any(coalesce(user_row.user_roles, array[]::text[]))
   and role_row.tenant_id = user_row.tenant_id
   and role_row.builtin_type = 'platform_super'
  where user_row.status = '1'
    and user_row.deleted_at is null
  limit 1;

  if v_auth_id is null then
    raise exception 'No active platform-super test identity is available';
  end if;
  perform set_config('request.jwt.claim.sub', v_auth_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);

  v_inbound := public.smis_save_business_record(jsonb_build_object(
    'module_code', 'hazardous-waste-inbound',
    'record_no', 'TX-IN-001',
    'title', '废机油入库',
    'status', 'active',
    'payload', jsonb_build_object(
      'waste_code', 'HW08', 'waste_name', '废矿物油', 'quantity', 100, 'unit', '千克'
    )
  ));
  v_outbound := public.smis_save_business_record(jsonb_build_object(
    'module_code', 'hazardous-waste-outbound',
    'record_no', 'TX-OUT-001',
    'title', '废机油出库',
    'status', 'active',
    'payload', jsonb_build_object(
      'waste_code', 'HW08', 'waste_name', '废矿物油', 'quantity', 40, 'unit', '千克'
    )
  ));

  select stock.available_quantity
  into v_available
  from public.smis_get_hazardous_waste_stock() stock
  where stock.waste_code = 'HW08';
  if v_available <> 60 then
    raise exception 'Inventory assertion failed: expected 60 kg, got %', v_available;
  end if;

  begin
    perform public.smis_save_business_record(jsonb_build_object(
      'module_code', 'hazardous-waste-outbound',
      'record_no', 'TX-OUT-OVER',
      'title', '超库存出库',
      'status', 'active',
      'payload', jsonb_build_object(
        'waste_code', 'HW08', 'waste_name', '废矿物油', 'quantity', 61, 'unit', '千克'
      )
    ));
  exception when others then
    if sqlerrm like 'Insufficient hazardous-waste stock.%' then
      v_rejected := true;
    else
      raise;
    end if;
  end;
  if not v_rejected then raise exception 'Over-stock outbound was not rejected'; end if;

  v_permit := public.smis_save_business_record(jsonb_build_object(
    'module_code', 'hot-work',
    'record_no', 'TX-HOT-001',
    'title', '动火作业联调票',
    'status', 'draft',
    'payload', jsonb_build_object(
      'work_location', '测试区域',
      'detail_rows', jsonb_build_array(
        jsonb_build_object('row_type', '安全措施', 'name', '现场清理可燃物', 'result', '符合')
      )
    )
  ));
  v_permit := public.smis_transition_business_record(v_permit.id, 'submit', '提交联调审批');
  v_permit := public.smis_transition_business_record(v_permit.id, 'reject', '措施需补充');
  v_permit := public.smis_transition_business_record(v_permit.id, 'submit', '已补充措施');
  v_permit := public.smis_transition_business_record(v_permit.id, 'approve', '审批通过');
  v_permit := public.smis_transition_business_record(v_permit.id, 'transfer', '转交现场负责人');
  v_permit := public.smis_transition_business_record(v_permit.id, 'complete', '作业完成');
  if v_permit.status <> 'completed' then raise exception 'Permit workflow did not complete'; end if;

  select count(*)
  into v_event_count
  from public.smis_business_event event_row
  where event_row.record_id = v_permit.id;
  if v_event_count <> 7 then
    raise exception 'Permit timeline expected 7 events, got %', v_event_count;
  end if;

  v_exam := public.smis_save_business_record(jsonb_build_object(
    'module_code', 'exam-management',
    'record_no', 'TX-EXAM-001',
    'title', '安全基础考试',
    'status', 'draft',
    'payload', jsonb_build_object(
      'duration_minutes', 30,
      'passing_score', 60,
      'attempt_limit', 1,
      'detail_rows', jsonb_build_array(jsonb_build_object(
        'question_no', 'Q1',
        'question_type', '单选题',
        'question_content', '进入作业区前应先做什么？',
        'option_content', 'A.安全交底；B.直接作业',
        'correct_answer', 'A',
        'score', 100
      ))
    )
  ));
  v_exam := public.smis_transition_business_record(v_exam.id, 'submit', '提交试卷');
  v_exam := public.smis_transition_business_record(v_exam.id, 'approve', '发布考试');
  v_attempt := public.smis_start_exam_attempt(v_exam.id);
  v_attempt := public.smis_submit_exam_attempt(v_attempt.id, '{"Q1":"A"}'::jsonb);
  if v_attempt.status <> 'submitted' or v_attempt.score <> 100 or v_attempt.passed is not true then
    raise exception 'Server-side exam scoring assertion failed';
  end if;
end
$test$;

rollback;
