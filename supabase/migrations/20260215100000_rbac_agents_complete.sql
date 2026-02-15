-- ============================================================================
-- MIGRATION: Complete RBAC for AI Agents System
-- Date: 2026-02-15
--
-- This migration:
-- 1. Adds missing columns to existing tables
-- 2. Creates helper functions for RBAC (SECURITY DEFINER to avoid recursion)
-- 3. Creates comprehensive RLS policies
-- 4. Ensures all FKs and indexes are in place
-- ============================================================================

-- ============================================================================
-- PART 1: ENSURE ALL TABLES HAVE REQUIRED COLUMNS
-- ============================================================================

-- Add computed_at to feedback_summaries if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback_summaries' AND column_name = 'computed_at'
  ) THEN
    ALTER TABLE feedback_summaries ADD COLUMN computed_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Add created_at to agent_escalations if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_escalations' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE agent_escalations ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Add status to agent_escalations if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_escalations' AND column_name = 'status'
  ) THEN
    ALTER TABLE agent_escalations ADD COLUMN status TEXT DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'dismissed'));
  END IF;
END $$;

-- Add company_id to feedback_summaries if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback_summaries' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE feedback_summaries ADD COLUMN company_id UUID REFERENCES companies(id);
  END IF;
END $$;

-- Ensure conversations has last_message_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'last_message_at'
  ) THEN
    ALTER TABLE conversations ADD COLUMN last_message_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- ============================================================================
-- PART 2: CREATE HELPER FUNCTIONS (SECURITY DEFINER)
-- ============================================================================

-- Function: Check if user is admin/owner of a company
-- Uses SECURITY DEFINER to bypass RLS and avoid infinite recursion
CREATE OR REPLACE FUNCTION is_company_admin(cid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_id = cid
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin', 'hr_manager')
      AND status = 'active'
  );
$$;

-- Function: Check if user can access a conversation
-- True if: user is participant OR user is admin of conversation's company
CREATE OR REPLACE FUNCTION can_access_conversation(conv_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM conversations c
    WHERE c.id = conv_id
      AND (
        c.participant_user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM company_members cm
          WHERE cm.company_id = c.company_id
            AND cm.user_id = auth.uid()
            AND cm.role IN ('owner', 'admin', 'hr_manager')
            AND cm.status = 'active'
        )
      )
  );
$$;

-- Function: Get user's company IDs (SECURITY DEFINER to avoid recursion)
CREATE OR REPLACE FUNCTION get_user_company_ids(uid uuid)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT company_id FROM company_members WHERE user_id = uid AND status = 'active';
$$;

-- Function: Check if user is member of a company
CREATE OR REPLACE FUNCTION is_company_member(cid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_id = cid
      AND user_id = auth.uid()
      AND status = 'active'
  );
$$;

-- ============================================================================
-- PART 3: DROP EXISTING POLICIES AND CREATE NEW ONES
-- ============================================================================

-- AGENTS TABLE: Read for all authenticated (templates are not sensitive)
DROP POLICY IF EXISTS "agents_select" ON agents;
DROP POLICY IF EXISTS "agents_select_all" ON agents;
DROP POLICY IF EXISTS "Authenticated users can read agents" ON agents;

CREATE POLICY "agents_select_authenticated"
  ON agents FOR SELECT
  TO authenticated
  USING (true);

-- AGENT_INSTANCES: Admin only for all operations
DROP POLICY IF EXISTS "agent_instances_select" ON agent_instances;
DROP POLICY IF EXISTS "agent_instances_insert" ON agent_instances;
DROP POLICY IF EXISTS "agent_instances_update" ON agent_instances;
DROP POLICY IF EXISTS "agent_instances_delete" ON agent_instances;
DROP POLICY IF EXISTS "Users can view agent instances for their company" ON agent_instances;
DROP POLICY IF EXISTS "Admins can insert agent instances" ON agent_instances;
DROP POLICY IF EXISTS "Admins can update agent instances" ON agent_instances;
DROP POLICY IF EXISTS "Admins can delete agent instances" ON agent_instances;

CREATE POLICY "agent_instances_select_admin"
  ON agent_instances FOR SELECT
  TO authenticated
  USING (is_company_admin(company_id));

CREATE POLICY "agent_instances_insert_admin"
  ON agent_instances FOR INSERT
  TO authenticated
  WITH CHECK (is_company_admin(company_id));

CREATE POLICY "agent_instances_update_admin"
  ON agent_instances FOR UPDATE
  TO authenticated
  USING (is_company_admin(company_id))
  WITH CHECK (is_company_admin(company_id));

CREATE POLICY "agent_instances_delete_admin"
  ON agent_instances FOR DELETE
  TO authenticated
  USING (is_company_admin(company_id));

-- AGENT_SCHEDULES: Admin only (via instance's company_id)
DROP POLICY IF EXISTS "agent_schedules_select" ON agent_schedules;
DROP POLICY IF EXISTS "agent_schedules_insert" ON agent_schedules;
DROP POLICY IF EXISTS "agent_schedules_update" ON agent_schedules;
DROP POLICY IF EXISTS "agent_schedules_delete" ON agent_schedules;

CREATE POLICY "agent_schedules_select_admin"
  ON agent_schedules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agent_instances ai
      WHERE ai.id = agent_schedules.agent_instance_id
        AND is_company_admin(ai.company_id)
    )
  );

CREATE POLICY "agent_schedules_insert_admin"
  ON agent_schedules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agent_instances ai
      WHERE ai.id = agent_schedules.agent_instance_id
        AND is_company_admin(ai.company_id)
    )
  );

CREATE POLICY "agent_schedules_update_admin"
  ON agent_schedules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agent_instances ai
      WHERE ai.id = agent_schedules.agent_instance_id
        AND is_company_admin(ai.company_id)
    )
  );

CREATE POLICY "agent_schedules_delete_admin"
  ON agent_schedules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agent_instances ai
      WHERE ai.id = agent_schedules.agent_instance_id
        AND is_company_admin(ai.company_id)
    )
  );

-- CONVERSATIONS: Select for participant OR admin
DROP POLICY IF EXISTS "conversations_select" ON conversations;
DROP POLICY IF EXISTS "conversations_insert" ON conversations;
DROP POLICY IF EXISTS "conversations_update" ON conversations;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Admins can view all company conversations" ON conversations;

CREATE POLICY "conversations_select_participant_or_admin"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    participant_user_id = auth.uid()
    OR is_company_admin(company_id)
  );

-- Insert: admin only (conversations created by agent runs server-side)
CREATE POLICY "conversations_insert_admin"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (is_company_admin(company_id));

-- Update: admin or participant (for status updates)
CREATE POLICY "conversations_update_participant_or_admin"
  ON conversations FOR UPDATE
  TO authenticated
  USING (
    participant_user_id = auth.uid()
    OR is_company_admin(company_id)
  );

-- MESSAGES: Select via can_access_conversation
DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;

CREATE POLICY "messages_select_can_access"
  ON messages FOR SELECT
  TO authenticated
  USING (can_access_conversation(conversation_id));

-- Insert: employees can only insert into their own conversations
CREATE POLICY "messages_insert_own_conversation"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (
          c.participant_user_id = auth.uid()
          OR is_company_admin(c.company_id)
        )
    )
  );

-- FEEDBACK_SUMMARIES: Admin only
DROP POLICY IF EXISTS "feedback_summaries_select" ON feedback_summaries;
DROP POLICY IF EXISTS "feedback_summaries_insert" ON feedback_summaries;
DROP POLICY IF EXISTS "feedback_summaries_update" ON feedback_summaries;

CREATE POLICY "feedback_summaries_select_admin"
  ON feedback_summaries FOR SELECT
  TO authenticated
  USING (is_company_admin(company_id));

CREATE POLICY "feedback_summaries_insert_admin"
  ON feedback_summaries FOR INSERT
  TO authenticated
  WITH CHECK (is_company_admin(company_id));

CREATE POLICY "feedback_summaries_update_admin"
  ON feedback_summaries FOR UPDATE
  TO authenticated
  USING (is_company_admin(company_id));

-- AGENT_ESCALATIONS: Admin only
DROP POLICY IF EXISTS "agent_escalations_select" ON agent_escalations;
DROP POLICY IF EXISTS "agent_escalations_insert" ON agent_escalations;
DROP POLICY IF EXISTS "agent_escalations_update" ON agent_escalations;

CREATE POLICY "agent_escalations_select_admin"
  ON agent_escalations FOR SELECT
  TO authenticated
  USING (is_company_admin(company_id));

CREATE POLICY "agent_escalations_insert_admin"
  ON agent_escalations FOR INSERT
  TO authenticated
  WITH CHECK (is_company_admin(company_id));

CREATE POLICY "agent_escalations_update_admin"
  ON agent_escalations FOR UPDATE
  TO authenticated
  USING (is_company_admin(company_id));

-- AUDIT_LOGS: Admin only
DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;

CREATE POLICY "audit_logs_select_admin"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (is_company_admin(company_id));

-- ============================================================================
-- PART 4: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Indexes for agent system queries
CREATE INDEX IF NOT EXISTS idx_agent_instances_company ON agent_instances(company_id);
CREATE INDEX IF NOT EXISTS idx_agent_instances_agent ON agent_instances(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_instances_created_by ON agent_instances(created_by);
CREATE INDEX IF NOT EXISTS idx_agent_schedules_instance ON agent_schedules(agent_instance_id);
CREATE INDEX IF NOT EXISTS idx_conversations_company ON conversations(company_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant ON conversations(participant_user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agent_instance ON conversations(agent_instance_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_company ON messages(company_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_summaries_conversation ON feedback_summaries(conversation_id);
CREATE INDEX IF NOT EXISTS idx_feedback_summaries_company ON feedback_summaries(company_id);
CREATE INDEX IF NOT EXISTS idx_feedback_summaries_computed ON feedback_summaries(computed_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_escalations_conversation ON agent_escalations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_agent_escalations_company ON agent_escalations(company_id);
CREATE INDEX IF NOT EXISTS idx_agent_escalations_created ON agent_escalations(created_at DESC);

-- ============================================================================
-- PART 5: ENSURE RLS IS ENABLED ON ALL TABLES
-- ============================================================================

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 6: GRANT USAGE ON FUNCTIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION is_company_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION can_access_conversation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_company_ids(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_company_member(uuid) TO authenticated;

-- ============================================================================
-- DONE
-- ============================================================================
