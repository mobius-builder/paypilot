-- ============================================================================
-- FIX RLS RECURSION BUG
-- The company_members policy causes infinite recursion because it queries
-- itself in the policy check. Fix by using a SECURITY DEFINER function.
-- ============================================================================

-- Create a function that gets user's company IDs without RLS
CREATE OR REPLACE FUNCTION get_user_company_ids(uid uuid)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT company_id FROM company_members WHERE user_id = uid;
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view members of their company" ON company_members;

-- Create a fixed policy that uses the SECURITY DEFINER function
CREATE POLICY "Users can view members of their company" ON company_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR company_id IN (SELECT get_user_company_ids(auth.uid()))
  );

-- Also fix the companies policy to use the same pattern
DROP POLICY IF EXISTS "Users can view their companies" ON companies;

CREATE POLICY "Users can view their companies" ON companies
  FOR SELECT USING (
    id IN (SELECT get_user_company_ids(auth.uid()))
  );

-- Fix time_entries policies
DROP POLICY IF EXISTS "Users can view their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can create their own time entries" ON time_entries;

-- Helper function to get user's company member IDs
CREATE OR REPLACE FUNCTION get_user_member_ids(uid uuid)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT id FROM company_members WHERE user_id = uid;
$$;

CREATE POLICY "Users can view their own time entries" ON time_entries
  FOR SELECT USING (
    employee_id IN (SELECT get_user_member_ids(auth.uid()))
  );

CREATE POLICY "Users can create their own time entries" ON time_entries
  FOR INSERT WITH CHECK (
    employee_id IN (SELECT get_user_member_ids(auth.uid()))
  );

-- Fix leave_requests policies
DROP POLICY IF EXISTS "Users can view their own leave requests" ON leave_requests;
DROP POLICY IF EXISTS "Users can create their own leave requests" ON leave_requests;

CREATE POLICY "Users can view their own leave requests" ON leave_requests
  FOR SELECT USING (
    employee_id IN (SELECT get_user_member_ids(auth.uid()))
  );

CREATE POLICY "Users can create their own leave requests" ON leave_requests
  FOR INSERT WITH CHECK (
    employee_id IN (SELECT get_user_member_ids(auth.uid()))
  );

-- Fix agent_instances_select policy
DROP POLICY IF EXISTS "agent_instances_select" ON agent_instances;

CREATE POLICY "agent_instances_select"
ON agent_instances FOR SELECT TO authenticated
USING (
  company_id IN (SELECT get_user_company_ids(auth.uid()))
);

-- Fix agent_schedules_select policy
DROP POLICY IF EXISTS "agent_schedules_select" ON agent_schedules;

CREATE POLICY "agent_schedules_select"
ON agent_schedules FOR SELECT TO authenticated
USING (
  agent_instance_id IN (
    SELECT id FROM agent_instances WHERE company_id IN (SELECT get_user_company_ids(auth.uid()))
  )
);

-- Fix conversations_select policy
DROP POLICY IF EXISTS "conversations_select" ON conversations;

CREATE POLICY "conversations_select"
ON conversations FOR SELECT TO authenticated
USING (
  participant_user_id = auth.uid()
  OR is_company_hr(company_id)
);

-- Recreate is_company_admin and is_company_hr to use SECURITY DEFINER
CREATE OR REPLACE FUNCTION is_company_admin(cid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = cid
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION is_company_hr(cid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = cid
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin', 'hr_manager')
  );
$$;

-- Grant execute on functions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_company_ids(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_member_ids(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_company_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_company_hr(uuid) TO authenticated;
