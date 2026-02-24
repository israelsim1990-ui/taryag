# Mission 04: Real-time Tracking

## Status: DONE
## Date: 2026-02-24

## Goal
Set up real-time tracking infrastructure for mitzvot fulfillment using Supabase Realtime.

## What Was Done

### 1. Enable Supabase Realtime
Added `mitzvot_log` and `profiles` tables to the `supabase_realtime` publication so the frontend can subscribe to live changes:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.mitzvot_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
```

### 2. log_mitzvah() Function
Created a SECURITY DEFINER function to safely log a mitzvah fulfillment:
- Takes: `p_mitzvah_id`, optional `p_notes`, optional `p_location`
- - Validates authentication via `auth.uid()`
  - - Inserts into `mitzvot_log` and returns the new row
    - - Called from frontend: `supabase.rpc('log_mitzvah', { p_mitzvah_id: 1 })`
     
      - ### 3. unlog_mitzvah() Function
      - Created a SECURITY DEFINER function to remove a mitzvah log entry:
      - - Takes: `p_log_id` (UUID)
        - - Only deletes rows owned by the current user
          - - Returns boolean (true if deleted)
            - - Called from frontend: `supabase.rpc('unlog_mitzvah', { p_log_id: '...' })`
             
              - ### 4. realtime_mitzvot_stats View
              - Created a per-user stats view:
              - - `unique_mitzvot_fulfilled` - distinct mitzvot count
                - - `total_fulfillments` - all log entries
                  - - `last_fulfilled_at` - most recent timestamp
                    - - `positive_fulfilled` / `negative_fulfilled` - by category
                      - - `completion_percentage` - out of 613
                       
                        - ### 5. recent_mitzvot_activity View
                        - Created a joined view of `mitzvot_log` + `mitzvot` for the activity feed:
                        - - Includes Hebrew/English names, category, fulfillment time, notes, location
                          - - Ordered by `fulfilled_at DESC`
                           
                            - ### 6. get_my_stats() Function
                            - Created a SECURITY DEFINER function returning stats for the current authenticated user:
                            - - Returns a single row with all stats
                              - - Called from frontend: `supabase.rpc('get_my_stats')`
                               
                                - ## Frontend Usage (Supabase JS v2)
                               
                                - ### Subscribe to real-time updates:
                                - ```typescript
                                  const channel = supabase
                                    .channel('mitzvot-changes')
                                    .on('postgres_changes', {
                                      event: 'INSERT',
                                      schema: 'public',
                                      table: 'mitzvot_log',
                                      filter: `user_id=eq.${userId}`
                                    }, (payload) => {
                                      console.log('New mitzvah logged:', payload.new)
                                    })
                                    .subscribe()
                                  ```

                                  ### Log a mitzvah:
                                  ```typescript
                                  const { data, error } = await supabase.rpc('log_mitzvah', {
                                    p_mitzvah_id: 1,
                                    p_notes: 'Prayed Shacharit',
                                    p_location: 'Jerusalem'
                                  })
                                  ```

                                  ## Next Mission
                                  Mission 05: UI/UX - Next.js frontend application
