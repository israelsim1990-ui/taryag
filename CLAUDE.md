# CLAUDE.md - Taryag Project

## Mission Progress

| Mission | Description | Status |
|---------|-------------|--------|
| Mission 01 | Project setup and DB schema | DONE |
| Mission 02 | Auth and user management | DONE |
| Mission 03 | Mitzvot catalog | DONE |
| Mission 04 | Real-time tracking | TODO |
| Mission 05 | UI/UX | TODO |

## Current Session
- Last completed: Mission 03 (613 mitzvot seed data inserted into public.mitzvot)
- - Next mission: Mission 04
 
  - ## Rules for Claude Code
  - - Do ONE mission per session only
    - - Commit after each mission
      - - Update this file after each mission
        - - Read docs/ before starting any mission
          - - Use ON CONFLICT (number) DO NOTHING in INSERT statements
            - - Insert seed data in batches of 50 rows
