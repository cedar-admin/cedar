-- Migration 009: RLS policies for ontology junction tables
-- kg_entity_domains and kg_entity_jurisdictions were created in 008 but
-- their RLS policies were omitted from that migration.

-- ── kg_entity_domains ────────────────────────────────────────────────────────
ALTER TABLE kg_entity_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kg_entity_domains_select"
    ON kg_entity_domains FOR SELECT
    TO authenticated USING (true);

CREATE POLICY "kg_entity_domains_admin"
    ON kg_entity_domains FOR ALL
    TO authenticated
    USING  ((auth.jwt() ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ── kg_entity_jurisdictions ──────────────────────────────────────────────────
ALTER TABLE kg_entity_jurisdictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kg_entity_jurisdictions_select"
    ON kg_entity_jurisdictions FOR SELECT
    TO authenticated USING (true);

CREATE POLICY "kg_entity_jurisdictions_admin"
    ON kg_entity_jurisdictions FOR ALL
    TO authenticated
    USING  ((auth.jwt() ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');
