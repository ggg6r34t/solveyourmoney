# Threat Model

Primary risks considered in this product state:

- cross-user financial data leakage
- accidental admin-client bypass of RLS
- webhook spoofing
- incomplete or inconsistent financial inputs producing misleading UI
- over-collection of sensitive personal finance details

Mitigations focus on authenticated server reads, row-level security, auditable mutations, and conservative fallback states.
