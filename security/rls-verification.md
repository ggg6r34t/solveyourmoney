# RLS Verification

Verify each user-owned table with two test accounts:

- `financial_profiles`
- `debts`
- `expenses`
- `savings_goals`
- `learning_progress`
- `activity_logs`
- `money_intakes`
- `financial_snapshots`

Checks:
- user A cannot read user B rows
- user A cannot mutate user B rows
- dashboard DAL does not use admin bypass clients for normal reads
