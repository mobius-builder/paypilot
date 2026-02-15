-- ============================================================================
-- AI AGENTS MODULE - Seed Data for Demo
-- ============================================================================

-- Create a demo agent instance for Acme Technologies
-- First, we need to get the company_id and a user_id

DO $$
DECLARE
  v_company_id UUID;
  v_user_id UUID;
  v_pulse_agent_id UUID;
  v_onboarding_agent_id UUID;
  v_instance_id UUID;
  v_conversation_id UUID;
BEGIN
  -- Get Acme Technologies company
  SELECT id INTO v_company_id FROM companies WHERE slug = 'acme-technologies' LIMIT 1;

  IF v_company_id IS NULL THEN
    RAISE NOTICE 'Acme Technologies company not found, skipping agent seed';
    RETURN;
  END IF;

  -- Get demo user (or any admin user)
  SELECT cm.user_id INTO v_user_id
  FROM company_members cm
  WHERE cm.company_id = v_company_id AND cm.role IN ('owner', 'admin')
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No admin user found, skipping agent seed';
    RETURN;
  END IF;

  -- Get pulse check agent template
  SELECT id INTO v_pulse_agent_id FROM agents WHERE slug = 'pulse_check' LIMIT 1;
  SELECT id INTO v_onboarding_agent_id FROM agents WHERE slug = 'onboarding' LIMIT 1;

  IF v_pulse_agent_id IS NULL THEN
    RAISE NOTICE 'Pulse check agent template not found, skipping';
    RETURN;
  END IF;

  -- Create Weekly Pulse Check agent instance
  INSERT INTO agent_instances (
    company_id,
    agent_id,
    created_by,
    name,
    config,
    status
  ) VALUES (
    v_company_id,
    v_pulse_agent_id,
    v_user_id,
    'Weekly Team Pulse',
    '{
      "tone_preset": "poke_lite",
      "audience_type": "company_wide",
      "guardrails": {
        "no_sensitive_topics": true,
        "no_medical_legal": true,
        "no_coercion": true,
        "no_harassment": true
      }
    }'::jsonb,
    'active'
  )
  RETURNING id INTO v_instance_id;

  -- Create schedule for weekly runs
  INSERT INTO agent_schedules (
    agent_instance_id,
    cadence,
    timezone,
    next_run_at,
    is_active
  ) VALUES (
    v_instance_id,
    'weekly',
    'America/New_York',
    now() + INTERVAL '1 hour', -- Demo: runs in 1 hour
    true
  );

  RAISE NOTICE 'Created Weekly Team Pulse agent instance: %', v_instance_id;

  -- Create a sample conversation with the demo user
  INSERT INTO conversations (
    company_id,
    agent_instance_id,
    participant_user_id,
    status,
    last_message_at,
    last_touched_at,
    message_count,
    unread_count
  ) VALUES (
    v_company_id,
    v_instance_id,
    v_user_id,
    'active',
    now() - INTERVAL '2 hours',
    now() - INTERVAL '2 hours',
    4,
    1
  )
  RETURNING id INTO v_conversation_id;

  -- Add sample messages to the conversation (include company_id for RLS)
  INSERT INTO messages (conversation_id, company_id, sender_type, content, content_type, is_read, created_at) VALUES
  (v_conversation_id, v_company_id, 'agent', 'Hey! Quick check-in - how''s your week going so far?', 'text', true, now() - INTERVAL '3 hours'),
  (v_conversation_id, v_company_id, 'employee', 'It''s been pretty busy actually. We''ve got a lot of deadlines coming up and I''m feeling a bit overwhelmed.', 'text', true, now() - INTERVAL '2 hours 30 minutes'),
  (v_conversation_id, v_company_id, 'agent', 'Thanks for being honest about that. What''s been the biggest challenge with the workload?', 'text', true, now() - INTERVAL '2 hours 15 minutes'),
  (v_conversation_id, v_company_id, 'employee', 'I think it''s the context switching. I''m on three different projects and it''s hard to make progress on any of them. My manager is supportive but there''s only so much they can do.', 'text', true, now() - INTERVAL '2 hours');

  -- Create a feedback summary for this conversation (include company_id for RLS)
  INSERT INTO feedback_summaries (
    conversation_id,
    company_id,
    summary,
    sentiment,
    sentiment_score,
    tags,
    action_items,
    key_quotes,
    computed_at
  ) VALUES (
    v_conversation_id,
    v_company_id,
    'Employee is feeling overwhelmed due to high workload and context switching across multiple projects. Manager relationship is positive but capacity issues persist.',
    'negative',
    -0.4,
    '["workload", "manager", "work_life_balance"]'::jsonb,
    '[
      {"text": "Review employee workload and consider redistributing tasks or adjusting deadlines.", "confidence": 0.8, "priority": "high", "category": "workload"},
      {"text": "Discuss project prioritization with employee to reduce context switching.", "confidence": 0.7, "priority": "medium", "category": "workload"}
    ]'::jsonb,
    '["I''m feeling a bit overwhelmed", "context switching across three projects"]'::jsonb,
    now() - INTERVAL '1 hour'
  );

  -- Create onboarding agent instance if template exists
  IF v_onboarding_agent_id IS NOT NULL THEN
    INSERT INTO agent_instances (
      company_id,
      agent_id,
      created_by,
      name,
      config,
      status
    ) VALUES (
      v_company_id,
      v_onboarding_agent_id,
      v_user_id,
      'New Hire Onboarding',
      '{
        "tone_preset": "friendly_peer",
        "audience_type": "individual",
        "guardrails": {
          "no_sensitive_topics": true,
          "no_medical_legal": true,
          "no_coercion": true,
          "no_harassment": true
        }
      }'::jsonb,
      'active'
    )
    RETURNING id INTO v_instance_id;

    INSERT INTO agent_schedules (
      agent_instance_id,
      cadence,
      timezone,
      next_run_at,
      is_active
    ) VALUES (
      v_instance_id,
      'daily',
      'America/New_York',
      now() + INTERVAL '24 hours',
      true
    );

    RAISE NOTICE 'Created New Hire Onboarding agent instance: %', v_instance_id;
  END IF;

  -- Create a sample agent run record
  INSERT INTO agent_runs (
    agent_instance_id,
    run_type,
    status,
    started_at,
    finished_at,
    messages_sent,
    conversations_touched
  )
  SELECT
    ai.id,
    'scheduled',
    'completed',
    now() - INTERVAL '3 hours',
    now() - INTERVAL '2 hours 55 minutes',
    12,
    12
  FROM agent_instances ai
  WHERE ai.name = 'Weekly Team Pulse'
  LIMIT 1;

  RAISE NOTICE 'AI Agents seed data created successfully';
END $$;
