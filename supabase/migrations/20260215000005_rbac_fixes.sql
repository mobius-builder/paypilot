-- ============================================================================
-- RBAC FIXES FOR AI AGENTS
-- Proper role-based access control for agent management and messaging
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if user is company admin (owner or admin role)
CREATE OR REPLACE FUNCTION is_company_admin(cid uuid)
RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = cid
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
  );
$$;

-- Check if user is company HR (owner, admin, or hr_manager)
CREATE OR REPLACE FUNCTION is_company_hr(cid uuid)
RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = cid
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin', 'hr_manager')
  );
$$;

-- Check if user can access a conversation
CREATE OR REPLACE FUNCTION can_access_conversation(conv_id uuid)
RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1
    FROM conversations c
    LEFT JOIN company_members cm
      ON cm.company_id = c.company_id
     AND cm.user_id = auth.uid()
    WHERE c.id = conv_id
      AND (
        c.participant_user_id = auth.uid()
        OR cm.role IN ('owner', 'admin', 'hr_manager')
      )
  );
$$;

-- ============================================================================
-- DROP EXISTING POLICIES (to recreate with proper logic)
-- ============================================================================

-- Agent instances
DROP POLICY IF EXISTS "agent_instances_read" ON agent_instances;
DROP POLICY IF EXISTS "agent_instances_insert" ON agent_instances;
DROP POLICY IF EXISTS "agent_instances_update" ON agent_instances;

-- Agent schedules
DROP POLICY IF EXISTS "agent_schedules_read" ON agent_schedules;
DROP POLICY IF EXISTS "agent_schedules_manage" ON agent_schedules;

-- Agent runs
DROP POLICY IF EXISTS "agent_runs_read" ON agent_runs;
DROP POLICY IF EXISTS "agent_runs_insert" ON agent_runs;

-- Conversations
DROP POLICY IF EXISTS "conversations_read_own" ON conversations;
DROP POLICY IF EXISTS "conversations_insert" ON conversations;
DROP POLICY IF EXISTS "conversations_update" ON conversations;

-- Messages
DROP POLICY IF EXISTS "messages_read" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;

-- ============================================================================
-- AGENT INSTANCES - Only admin can create/manage, all members can read
-- ============================================================================

CREATE POLICY "agent_instances_select"
ON agent_instances FOR SELECT TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM company_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "agent_instances_insert"
ON agent_instances FOR INSERT TO authenticated
WITH CHECK (
  is_company_hr(company_id)
);

CREATE POLICY "agent_instances_update"
ON agent_instances FOR UPDATE TO authenticated
USING (
  is_company_hr(company_id)
)
WITH CHECK (
  is_company_hr(company_id)
);

CREATE POLICY "agent_instances_delete"
ON agent_instances FOR DELETE TO authenticated
USING (
  is_company_admin(company_id)
);

-- ============================================================================
-- AGENT SCHEDULES - Only admin can manage
-- ============================================================================

CREATE POLICY "agent_schedules_select"
ON agent_schedules FOR SELECT TO authenticated
USING (
  agent_instance_id IN (
    SELECT id FROM agent_instances WHERE company_id IN (
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "agent_schedules_insert"
ON agent_schedules FOR INSERT TO authenticated
WITH CHECK (
  agent_instance_id IN (
    SELECT id FROM agent_instances WHERE is_company_hr(company_id)
  )
);

CREATE POLICY "agent_schedules_update"
ON agent_schedules FOR UPDATE TO authenticated
USING (
  agent_instance_id IN (
    SELECT id FROM agent_instances WHERE is_company_hr(company_id)
  )
);

CREATE POLICY "agent_schedules_delete"
ON agent_schedules FOR DELETE TO authenticated
USING (
  agent_instance_id IN (
    SELECT id FROM agent_instances WHERE is_company_admin(company_id)
  )
);

-- ============================================================================
-- AGENT RUNS - Only admin can create and view
-- ============================================================================

CREATE POLICY "agent_runs_select"
ON agent_runs FOR SELECT TO authenticated
USING (
  agent_instance_id IN (
    SELECT id FROM agent_instances WHERE is_company_hr(company_id)
  )
);

CREATE POLICY "agent_runs_insert"
ON agent_runs FOR INSERT TO authenticated
WITH CHECK (
  agent_instance_id IN (
    SELECT id FROM agent_instances WHERE is_company_hr(company_id)
  )
);

-- ============================================================================
-- CONVERSATIONS - Employees see their own, admins see all in company
-- ============================================================================

CREATE POLICY "conversations_select"
ON conversations FOR SELECT TO authenticated
USING (
  participant_user_id = auth.uid()
  OR is_company_hr(company_id)
);

-- Only service role or HR can create conversations (agents create them)
CREATE POLICY "conversations_insert"
ON conversations FOR INSERT TO authenticated
WITH CHECK (
  is_company_hr(company_id)
);

CREATE POLICY "conversations_update"
ON conversations FOR UPDATE TO authenticated
USING (
  participant_user_id = auth.uid()
  OR is_company_hr(company_id)
);

-- ============================================================================
-- MESSAGES - Employees see/send only in their conversations, admins see all
-- ============================================================================

CREATE POLICY "messages_select"
ON messages FOR SELECT TO authenticated
USING (
  can_access_conversation(conversation_id)
);

-- Employee can only insert messages in their own conversation
CREATE POLICY "messages_insert_employee"
ON messages FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id
      AND c.participant_user_id = auth.uid()
  )
);

-- Service role bypasses RLS for agent messages (handled in code)

-- ============================================================================
-- FEEDBACK SUMMARIES - Only HR can see
-- ============================================================================

DROP POLICY IF EXISTS "feedback_summaries_admin_read" ON feedback_summaries;

CREATE POLICY "feedback_summaries_select"
ON feedback_summaries FOR SELECT TO authenticated
USING (
  conversation_id IN (
    SELECT id FROM conversations WHERE is_company_hr(company_id)
  )
);

-- ============================================================================
-- ESCALATIONS - Only HR can see and manage
-- ============================================================================

DROP POLICY IF EXISTS "escalations_read" ON agent_escalations;
DROP POLICY IF EXISTS "escalations_manage" ON agent_escalations;

CREATE POLICY "escalations_select"
ON agent_escalations FOR SELECT TO authenticated
USING (
  is_company_hr(company_id)
);

CREATE POLICY "escalations_insert"
ON agent_escalations FOR INSERT TO authenticated
WITH CHECK (
  is_company_hr(company_id)
);

CREATE POLICY "escalations_update"
ON agent_escalations FOR UPDATE TO authenticated
USING (
  is_company_hr(company_id)
);

-- ============================================================================
-- GRANT SERVICE ROLE BYPASS FOR AGENT MESSAGES
-- Server-side code uses service role to insert agent messages
-- ============================================================================

-- Note: Service role already bypasses RLS by default in Supabase
-- Just ensure the API routes use the service role for agent-authored messages
