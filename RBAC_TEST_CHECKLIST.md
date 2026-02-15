# PayPilot RBAC Test Checklist - AI Agents System

## Test Setup

Run the database migrations first:
```bash
npx supabase migration up
# Or via SQL editor in Supabase dashboard
```

Create two test users:
1. **Admin User**: Role = `owner`, `admin`, or `hr_manager`
2. **Member User**: Role = `member`

---

## Frontend UI Gating Tests

### /agents page (Agent Management)

| Test | Admin Expected | Member Expected | Status |
|------|---------------|-----------------|--------|
| Can view /agents page | Yes | Yes (view only) | |
| Sees "Create Agent" button | Yes | No (shows "View Only" badge) | |
| Can click Create Agent dialog | Yes | No | |
| Sees dropdown menu on agent cards | Yes | No | |
| Can trigger "Run Now" from menu | Yes | No | |
| Can pause/activate agent from menu | Yes | No | |
| Can view agent stats (conversations, messages) | Yes | Yes | |
| Sees "Run" button on cards | Yes | Disabled | |

### /messages page (Employee Conversations)

| Test | Admin Expected | Member Expected | Status |
|------|---------------|-----------------|--------|
| Can view /messages page | Yes | Yes | |
| Sees all company conversations (admin view) | Yes | No | |
| Sees only own conversations (employee view) | No | Yes | |
| Can send messages in own conversations | Yes | Yes | |
| Can view messages in any conversation | Yes | No | |

### /admin/insights (Admin Dashboard)

| Test | Admin Expected | Member Expected | Status |
|------|---------------|-----------------|--------|
| Can access insights data | Yes | No (403 error) | |
| Sees sentiment distribution | Yes | N/A | |
| Sees escalation counts | Yes | N/A | |
| Sees engagement metrics | Yes | N/A | |

---

## API Route Tests

### GET /api/agents/instances

| Test | Admin Expected | Member Expected | Status |
|------|---------------|-----------------|--------|
| Returns agent instances | Yes (all company) | Yes (all company) | |
| Returns 401 if not authenticated | Yes | Yes | |

### POST /api/agents/instances (Create)

| Test | Admin Expected | Member Expected | Status |
|------|---------------|-----------------|--------|
| Can create agent instance | Yes | No (403) | |
| Creates audit log entry | Yes | N/A | |
| Creates schedule record | Yes | N/A | |

### PATCH /api/agents/instances/[id] (Update)

| Test | Admin Expected | Member Expected | Status |
|------|---------------|-----------------|--------|
| Can update status (active/paused) | Yes | No (403) | |
| Can update name | Yes | No (403) | |
| Can update config | Yes | No (403) | |

### DELETE /api/agents/instances/[id] (Archive)

| Test | Admin Expected | Member Expected | Status |
|------|---------------|-----------------|--------|
| Can archive agent instance | Yes (owner/admin only) | No (403) | |
| hr_manager cannot archive | N/A (403) | N/A | |

### POST /api/agents/instances/[id]/trigger (Run Now)

| Test | Admin Expected | Member Expected | Status |
|------|---------------|-----------------|--------|
| Can manually trigger agent | Yes | No (403) | |
| Creates agent_runs record | Yes | N/A | |
| Creates conversations | Yes | N/A | |
| Sends messages to employees | Yes | N/A | |
| Creates audit log | Yes | N/A | |

### GET /api/conversations

| Test | Admin Expected | Member Expected | Status |
|------|---------------|-----------------|--------|
| Returns all company conversations (view=admin) | Yes | Returns only own | |
| Returns own conversations (view=employee) | Yes | Yes | |

### GET /api/conversations/[id]

| Test | Admin Expected | Member Expected | Status |
|------|---------------|-----------------|--------|
| Can view any conversation in company | Yes | Only own | |
| Returns 404 for other user's conversation | N/A | Yes | |

### POST /api/conversations/[id]/messages

| Test | Admin Expected | Member Expected | Status |
|------|---------------|-----------------|--------|
| Can send message to own conversation | Yes | Yes | |
| Can send message to any conversation | Yes | No | |
| Agent responds automatically | Yes | Yes | |

### GET /api/admin/agents/insights

| Test | Admin Expected | Member Expected | Status |
|------|---------------|-----------------|--------|
| Returns insights data | Yes | No (403) | |
| Includes sentiment distribution | Yes | N/A | |
| Includes escalation counts | Yes | N/A | |
| Includes engagement metrics | Yes | N/A | |
| Includes recent agent runs | Yes | N/A | |

---

## RLS (Row Level Security) Tests

Run these queries directly in Supabase SQL editor as each user:

### agents table (public read)

```sql
-- As any authenticated user
SELECT * FROM agents;
-- Should return all agent templates
```

### agent_instances table (admin only)

```sql
-- As admin
SELECT * FROM agent_instances WHERE company_id = '<company_id>';
-- Should return instances

-- As member
SELECT * FROM agent_instances WHERE company_id = '<company_id>';
-- Should return empty (RLS blocks)
```

### conversations table (participant OR admin)

```sql
-- As admin
SELECT * FROM conversations WHERE company_id = '<company_id>';
-- Should return all company conversations

-- As member
SELECT * FROM conversations WHERE company_id = '<company_id>';
-- Should return only conversations where participant_user_id = auth.uid()
```

### messages table (via can_access_conversation)

```sql
-- As admin
SELECT m.* FROM messages m
JOIN conversations c ON m.conversation_id = c.id
WHERE c.company_id = '<company_id>';
-- Should return all messages

-- As member
SELECT m.* FROM messages m
JOIN conversations c ON m.conversation_id = c.id
WHERE c.company_id = '<company_id>';
-- Should return only messages from own conversations
```

### feedback_summaries table (admin only)

```sql
-- As admin
SELECT * FROM feedback_summaries WHERE company_id = '<company_id>';
-- Should return summaries

-- As member
SELECT * FROM feedback_summaries WHERE company_id = '<company_id>';
-- Should return empty (RLS blocks)
```

### agent_escalations table (admin only)

```sql
-- As admin
SELECT * FROM agent_escalations WHERE company_id = '<company_id>';
-- Should return escalations

-- As member
SELECT * FROM agent_escalations WHERE company_id = '<company_id>';
-- Should return empty (RLS blocks)
```

### audit_logs table (admin only)

```sql
-- As admin
SELECT * FROM audit_logs WHERE company_id = '<company_id>';
-- Should return logs

-- As member
SELECT * FROM audit_logs WHERE company_id = '<company_id>';
-- Should return empty (RLS blocks)
```

---

## Helper Function Tests

Test SECURITY DEFINER functions work correctly:

```sql
-- Test is_company_admin
SELECT is_company_admin('<company_id>');
-- Returns true for admin, false for member

-- Test is_company_member
SELECT is_company_member('<company_id>');
-- Returns true for both admin and member

-- Test can_access_conversation
SELECT can_access_conversation('<conversation_id>');
-- Returns true if user is participant OR admin

-- Test get_user_company_ids
SELECT * FROM get_user_company_ids(auth.uid());
-- Returns company IDs user belongs to
```

---

## State Machine Tests

### Agent Instance Status Transitions

| From | To | Trigger | Who Can |
|------|-----|---------|---------|
| draft | active | PATCH status=active | Admin |
| active | paused | PATCH status=paused | Admin |
| paused | active | PATCH status=active | Admin |
| active | archived | DELETE | Owner/Admin |
| paused | archived | DELETE | Owner/Admin |
| archived | * | - | No transitions allowed |

### Conversation Status Transitions

| From | To | Trigger | Who Can |
|------|-----|---------|---------|
| active | closed | Status update | Admin |
| active | escalated | Escalation trigger | System/Admin |
| escalated | resolved | Status update | Admin |
| closed | * | - | No transitions allowed |

---

## Sign-off

| Tester | Date | Result |
|--------|------|--------|
| | | |
| | | |

---

## Notes

- All tests should be run after applying migration `20260215100000_rbac_agents_complete.sql`
- RLS policies use SECURITY DEFINER functions to avoid infinite recursion
- Admin roles: `owner`, `admin`, `hr_manager`
- Member roles: `member` (standard employee)
