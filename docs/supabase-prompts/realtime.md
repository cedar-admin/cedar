# Supabase Realtime

## Implementation Rules

### Do

- Use `broadcast` for all realtime events (database changes via triggers, messaging, notifications, game state)
- Use `presence` sparingly for user state tracking (online status, user counters)
- Create indexes for all columns used in RLS policies
- Use topic names that correlate with concepts and tables: `scope:entity` (e.g., `room:123:messages`)
- Use snake_case for event names: `entity_action` (e.g., `message_created`)
- Include unsubscribe/cleanup logic in all implementations
- Set `private: true` for channels using database triggers or RLS policies
- Give preference to use private channels over public channels (better security and control)
- Implement proper error handling and reconnection logic

### Don't

- Use `postgres_changes` for new applications (single-threaded, doesn't scale well)
- Create multiple subscriptions without proper cleanup
- Write complex RLS queries without proper indexing
- Use generic event names like "update" or "change"
- Subscribe directly in render functions without state management
- Use database functions (`realtime.send`, `realtime.broadcast_changes`) in client code

## Naming Conventions

### Topics (Channels)
- Pattern: `scope:entity` or `scope:entity:id`
- Examples: `room:123:messages`, `game:456:moves`, `user:789:notifications`

### Events
- Pattern: `entity_action` (snake_case)
- Examples: `message_created`, `user_joined`, `game_ended`, `status_changed`
- Avoid: Generic names like `update`, `change`, `event`

## Client Setup

- Use `private: true` for channels
- Include proper cleanup/unsubscribe logic
- Check channel state before subscribing
- Set auth before subscribing with `supabase.realtime.setAuth()`
