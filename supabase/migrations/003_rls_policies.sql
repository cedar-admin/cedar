-- Cedar MVP: Row Level Security + Append-Only Enforcement

-- ============================================================
-- Enable RLS on all sensitive tables
-- ============================================================
ALTER TABLE changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Sources: readable by all authenticated users, writable by service role only
-- ============================================================
CREATE POLICY "sources_read" ON sources
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "source_urls_read" ON source_urls
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- Config tables: readable by all authenticated users
-- ============================================================
CREATE POLICY "feature_flags_read" ON feature_flags
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "review_rules_read" ON review_rules
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "system_config_read" ON system_config
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "prompt_templates_read" ON prompt_templates
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- ============================================================
-- Practices: owners see only their own practice
-- ============================================================
CREATE POLICY "practices_own" ON practices
  FOR ALL USING (owner_email = (auth.jwt() ->> 'email'));

-- ============================================================
-- Changes: readable by all authenticated practices (shared resource)
-- Writable only by service role (Inngest pipeline)
-- ============================================================
CREATE POLICY "changes_read" ON changes
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- Practice acknowledgments: practice sees only their own acknowledgments
-- ============================================================
CREATE POLICY "acknowledgments_own" ON practice_acknowledgments
  FOR ALL USING (
    practice_id = (
      SELECT id FROM practices WHERE owner_email = (auth.jwt() ->> 'email')
    )
  );

-- ============================================================
-- Review actions: reviewers and admins only
-- ============================================================
CREATE POLICY "review_actions_reviewer" ON review_actions
  FOR SELECT USING (
    (auth.jwt() ->> 'role') IN ('reviewer', 'admin')
  );

-- ============================================================
-- Cost events: admin only
-- ============================================================
CREATE POLICY "cost_events_admin" ON cost_events
  FOR SELECT USING ((auth.jwt() ->> 'role') = 'admin');

-- ============================================================
-- APPEND-ONLY enforcement on changes table
-- Blocks UPDATE and DELETE at the database level — no exceptions
-- ============================================================
CREATE OR REPLACE FUNCTION enforce_changes_append_only()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'changes table is append-only. Use superseded_by to correct a change record.';
  END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'changes table is append-only. Records cannot be deleted.';
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER changes_append_only
  BEFORE UPDATE OR DELETE ON changes
  FOR EACH ROW EXECUTE FUNCTION enforce_changes_append_only();

-- ============================================================
-- Auto-update updated_at on system_config
-- ============================================================
CREATE OR REPLACE FUNCTION update_system_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER system_config_updated_at
  BEFORE UPDATE ON system_config
  FOR EACH ROW EXECUTE FUNCTION update_system_config_timestamp();
