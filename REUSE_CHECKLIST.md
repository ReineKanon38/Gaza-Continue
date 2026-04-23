REUSE CHECKLIST (OTHER REPOSITORY)

1. Legal and origin
- Confirm permission to reuse the source project.
- Keep LICENSE and THIRD_PARTY_NOTICES.md.
- Document origin and major modifications in README.

2. Security
- Remove all real credentials from files and docs.
- Keep secrets only in local .env files.
- Restrict API keys by scope/IP when possible.

3. Technical
- Verify .gitignore blocks .env and node_modules.
- Validate backend/frontend startup in clean clone.
- Re-run tests and smoke checks.

4. Pre-release gates
- Rotate temporary development credentials before production.
- Re-check dependency licenses for redistribution.
