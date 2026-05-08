# RLS Notes

All financial data is modeled as user-owned rows and protected with `auth.uid()`-based row level security.

Core expectations:
- no cross-user reads
- no cross-user writes
- dashboard reads use the authenticated user client
- admin/service-role access is reserved for explicit operational flows only
