# CLAUDE.md - Taryag Project

## Mission Progress

| Mission | Description | Status |
|---------|-------------|--------|
| Mission 01 | Project setup and DB schema | DONE |
| Mission 02 | Auth and user management | DONE |
| Mission 03 | Mitzvot catalog | DONE |
| Mission 04 | Real-time tracking | DONE |
| Mission 05 | UI/UX | TODO |

## Current Session
- Last completed: Mission 04 (Realtime enabled, log_mitzvah/unlog_mitzvah functions, stats views)
- - Next mission: Mission 05
 
  - ## Rules for Claude Code
  - - Do ONE mission per session only
    - - Commit after each mission
      - - Update this file after each mission
        - - Read docs/ before starting any mission
          - - Use ON CONFLICT (number) DO NOTHING in INSERT statements
            - - Insert seed data in batches of 50 rows
