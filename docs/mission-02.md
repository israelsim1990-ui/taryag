# Mission 02: Auth & User Management

## Status: DONE

## What was done

### Supabase Auth Configuration
- Email/password auth: already enabled by default
- - Confirm email: ON
  - - Allow new signups: ON
    - - Redirect URLs added:
      -   - http://localhost:3000/**
          -   - https://taryag.vercel.app/**
           
              - ### Database Changes (SQL executed)
           
              - 1. updated_at auto-trigger function (update_updated_at_column)
                2. 2. Trigger on profiles: update_profiles_updated_at
                   3. 3. Table: user_preferences (language, notifications, reminder time)
                      4.    - RLS policies: select/insert/update per user
                            -    - Trigger: update_prefs_updated_at
                                 - 4. View: user_stats (total mitzvot fulfilled, last activity per user)
                                  
                                   5. ### Tables after Mission 02
                                   6. - public.profiles
                                      - - public.mitzvot
                                        - - public.mitzvot_log
                                          - - public.user_preferences (NEW)
                                            - - View: public.user_stats (NEW)
                                             
                                              - ## Next: Mission 03 — Mitzvot Catalog
