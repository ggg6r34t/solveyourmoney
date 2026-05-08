begin;

-- Smoke-test checklist for local verification:
-- 1. set auth context for user A and confirm only user A rows are visible
-- 2. set auth context for user B and confirm user A rows are hidden
-- 3. verify inserts fail when user_id does not match auth.uid()

rollback;
