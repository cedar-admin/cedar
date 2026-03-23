/**
 * Cedar UI Audit — Authenticated Staging Run
 *
 * Signs in via WorkOS AuthKit, visits every key screen, exercises available
 * interactions, captures full-page screenshots, and writes a structured JSON
 * report to research/ui-audit/report.json.
 *
 * Run:
 *   npx playwright test tests/ui-audit.spec.ts --project=chromium
 *
 * Artifacts:
 *   research/ui-audit/screenshots/*.png
 *   research/ui-audit/report.json
 */

import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ── Config ─────────────────────────────────────────────────────────────────────

const BASE_URL   = 'https://cedar-beta.vercel.app';
const LOGIN_URL  = 'https://sensational-purity-22-staging.authkit.app/';
const EMAIL      = 'anthony@cedar.design';
const PASSWORD   = '9EBaQXY3ezcJ$TeD2a&ap%XB%3bTC5NC';

const OUT_DIR        = path.resolve('research/ui-audit/screenshots');
const REPORT_PATH    = path.resolve('research/ui-audit/report.json');

// ── Types ──────────────────────────────────────────────────────────────────────

interface ScreenReport {
  route: string;
  title: string;
  loaded: boolean;
  auth_required: boolean;
  url_after_load: string;
  screenshots: string[];
  interactions_attempted: string[];
  interactions_succeeded: string[];
  interactions_failed: string[];
  console_errors: string[];
  empty_states: string[];
}

interface AuditReport {
  generated_at: string;
  auth_succeeded: boolean;
  auth_note: string;
  screens: ScreenReport[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function ensureDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function screenshot(page: Page, slug: string): Promise<string> {
  const filename = `${slug}.png`;
  await page.screenshot({ path: path.join(OUT_DIR, filename), fullPage: true });
  return filename;
}

async function tryInteraction(
  label: string,
  screen: ScreenReport,
  fn: () => Promise<void>
): Promise<boolean> {
  screen.interactions_attempted.push(label);
  try {
    await fn();
    screen.interactions_succeeded.push(label);
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message.split('\n')[0] : String(err);
    screen.interactions_failed.push(`${label}: ${msg}`);
    return false;
  }
}

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  return errors;
}

async function waitForSettle(page: Page) {
  await page.waitForLoadState('networkidle').catch(() => {
    // networkidle can time out on pages with long polls — ignore
  });
}

// ── Login ──────────────────────────────────────────────────────────────────────

async function login(page: Page): Promise<{ succeeded: boolean; note: string }> {
  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    // If the app immediately redirects to AuthKit
    if (page.url().includes('authkit.app')) {
      // Already on login page — proceed
    } else {
      // Navigate directly to the AuthKit login URL
      await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });
    }

    // Wait for the email field
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 15_000 });

    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    await emailField.fill(EMAIL);

    // Submit — some flows have Continue before the password field appears
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    // Wait a moment to see if a password field appears (two-step) or we redirect
    await page.waitForTimeout(1500);

    const passwordField = page.locator('input[type="password"]').first();
    if (await passwordField.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await passwordField.fill(PASSWORD);
      const submitBtn2 = page.locator('button[type="submit"]').first();
      await submitBtn2.click();
    }

    // Wait for redirect back to the Cedar app
    await page.waitForURL(/cedar-beta\.vercel\.app/, { timeout: 20_000 });
    await waitForSettle(page);

    return { succeeded: true, note: `Landed at ${page.url()}` };
  } catch (err) {
    const note = err instanceof Error ? err.message.split('\n')[0] : String(err);
    return { succeeded: false, note };
  }
}

// ── Screen helpers ─────────────────────────────────────────────────────────────

function makeScreen(route: string): ScreenReport {
  return {
    route,
    title: '',
    loaded: false,
    auth_required: true,
    url_after_load: '',
    screenshots: [],
    interactions_attempted: [],
    interactions_succeeded: [],
    interactions_failed: [],
    console_errors: [],
    empty_states: [],
  };
}

async function navigateTo(page: Page, route: string, screen: ScreenReport): Promise<boolean> {
  try {
    const resp = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
    await waitForSettle(page);
    screen.url_after_load = page.url();
    screen.title = await page.title();
    screen.loaded = true;
    // If we were bounced to login, note it
    if (page.url().includes('authkit.app') || page.url().includes('sign-in')) {
      screen.auth_required = true;
      screen.loaded = false;
      screen.empty_states.push('Redirected to login — not authenticated or session expired');
    }
    return screen.loaded;
  } catch (err) {
    screen.loaded = false;
    screen.empty_states.push(`Navigation error: ${(err as Error).message.split('\n')[0]}`);
    return false;
  }
}

// ── Sidebar audit ──────────────────────────────────────────────────────────────

async function auditSidebar(page: Page, screen: ScreenReport) {
  // Collapse
  await tryInteraction('sidebar_collapse', screen, async () => {
    const btn = page.locator('button[aria-label="Collapse sidebar"]');
    await expect(btn).toBeVisible({ timeout: 5_000 });
    await btn.click();
    await page.waitForTimeout(300);
    const shot = await screenshot(page, 'sidebar-collapsed');
    screen.screenshots.push(shot);
  });

  // Expand
  await tryInteraction('sidebar_expand', screen, async () => {
    const btn = page.locator('button[aria-label="Expand sidebar"]');
    await expect(btn).toBeVisible({ timeout: 5_000 });
    await btn.click();
    await page.waitForTimeout(300);
    const shot = await screenshot(page, 'sidebar-expanded');
    screen.screenshots.push(shot);
  });
}

// ── Nav links ──────────────────────────────────────────────────────────────────

async function auditNavLinks(page: Page, screen: ScreenReport) {
  const navLinks = [
    { label: 'Changes', href: '/changes' },
    { label: 'Regulation Library', href: '/library' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Sources', href: '/sources' },
    { label: 'Audit Trail', href: '/audit' },
  ];

  for (const link of navLinks) {
    await tryInteraction(`nav_link_${link.label.toLowerCase().replace(/\s+/g, '_')}`, screen, async () => {
      const el = page.locator(`nav a[href="${link.href}"]`).first();
      await expect(el).toBeVisible({ timeout: 5_000 });
      // Just verify visible/clickable, don't navigate (we audit each route separately)
    });
  }
}

// ── Theme toggle ───────────────────────────────────────────────────────────────

async function auditThemeToggle(page: Page, screen: ScreenReport) {
  await tryInteraction('theme_toggle_dark', screen, async () => {
    // ThemeToggle is in sidebar bottom section — look for a button near sign out
    const toggle = page.locator('button[aria-label*="theme"], button[aria-label*="dark"], button[aria-label*="light"], button[aria-label*="Dark"], button[aria-label*="Light"]').first();
    if (await toggle.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await toggle.click();
      await page.waitForTimeout(300);
      const shot = await screenshot(page, 'home-dark-mode');
      screen.screenshots.push(shot);
    } else {
      throw new Error('Theme toggle button not found');
    }
  });

  // Toggle back
  await tryInteraction('theme_toggle_light', screen, async () => {
    const toggle = page.locator('button[aria-label*="theme"], button[aria-label*="dark"], button[aria-label*="light"], button[aria-label*="Dark"], button[aria-label*="Light"]').first();
    if (await toggle.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await toggle.click();
      await page.waitForTimeout(300);
    } else {
      throw new Error('Theme toggle button not found');
    }
  });
}

// ── /home ──────────────────────────────────────────────────────────────────────

async function auditHome(page: Page): Promise<ScreenReport> {
  const screen = makeScreen('/home');
  const errors = collectConsoleErrors(page);

  if (!(await navigateTo(page, '/home', screen))) return screen;

  screen.screenshots.push(await screenshot(page, 'home-loaded'));
  screen.console_errors = errors;

  // Check for empty states
  const emptyIndicators = await page.locator('text=/no changes/i, text=/no data/i, text=/not linked/i').count();
  if (emptyIndicators > 0) {
    screen.empty_states.push('Empty/no-data state visible on home page');
  }

  await auditSidebar(page, screen);
  await auditNavLinks(page, screen);
  await auditThemeToggle(page, screen);

  screen.screenshots.push(await screenshot(page, 'home-final'));
  return screen;
}

// ── /changes ──────────────────────────────────────────────────────────────────

async function auditChanges(page: Page): Promise<ScreenReport> {
  const screen = makeScreen('/changes');
  const errors = collectConsoleErrors(page);

  if (!(await navigateTo(page, '/changes', screen))) return screen;

  screen.screenshots.push(await screenshot(page, 'changes-loaded'));
  screen.console_errors = errors;

  // Check for empty state
  const emptyText = page.locator('text=/no changes detected/i');
  if (await emptyText.isVisible({ timeout: 2_000 }).catch(() => false)) {
    screen.empty_states.push('No changes detected — data not yet populated');
  }

  // Check for practice-gate callout
  const practiceGate = page.locator('text=/not linked to a practice/i');
  if (await practiceGate.isVisible({ timeout: 2_000 }).catch(() => false)) {
    screen.empty_states.push('Practice gate shown — account not linked to a practice');
  }

  // Severity filter pills
  const filterLabels = ['All', 'Critical', 'High', 'Medium', 'Low', 'Informational'];
  for (const label of filterLabels) {
    await tryInteraction(`filter_pill_${label.toLowerCase()}`, screen, async () => {
      // Filter pills are <Link> elements with the label text
      const pill = page.locator(`a:has-text("${label}")`).first();
      await expect(pill).toBeVisible({ timeout: 5_000 });
      await pill.click();
      await waitForSettle(page);
      const slug = `changes-filter-${label.toLowerCase()}`;
      const shot = await screenshot(page, slug);
      screen.screenshots.push(shot);
    });
  }

  // Navigate back to All
  await page.goto(`${BASE_URL}/changes`, { waitUntil: 'domcontentloaded' });
  await waitForSettle(page);

  // Click first table row if data exists
  await tryInteraction('table_row_click', screen, async () => {
    const rowLink = page.locator('table a[href^="/changes/"]').first();
    await expect(rowLink).toBeVisible({ timeout: 5_000 });
    await rowLink.click();
    await waitForSettle(page);
    const shot = await screenshot(page, 'changes-detail');
    screen.screenshots.push(shot);
    // Navigate back
    await page.goBack();
    await waitForSettle(page);
  });

  // Pagination
  await tryInteraction('pagination_next', screen, async () => {
    const nextBtn = page.locator('a[aria-label="Go to next page"]');
    await expect(nextBtn).toBeVisible({ timeout: 3_000 });
    await nextBtn.click();
    await waitForSettle(page);
    const shot = await screenshot(page, 'changes-page-2');
    screen.screenshots.push(shot);
    const prevBtn = page.locator('a[aria-label="Go to previous page"]');
    await prevBtn.click();
    await waitForSettle(page);
  });

  screen.screenshots.push(await screenshot(page, 'changes-final'));
  return screen;
}

// ── /library ──────────────────────────────────────────────────────────────────

async function auditLibrary(page: Page): Promise<ScreenReport> {
  const screen = makeScreen('/library');
  const errors = collectConsoleErrors(page);

  if (!(await navigateTo(page, '/library', screen))) return screen;

  screen.screenshots.push(await screenshot(page, 'library-loaded'));
  screen.console_errors = errors;

  // Check for empty/loading state
  const emptyEl = page.locator('[data-testid="empty-state"], text=/no regulations/i, text=/no results/i');
  if (await emptyEl.isVisible({ timeout: 2_000 }).catch(() => false)) {
    screen.empty_states.push('Library empty or not yet populated');
  }

  // Try clicking a domain card or the first nav link in the library
  await tryInteraction('library_first_card_click', screen, async () => {
    // Library may have domain cards linking to /library/[slug]
    const card = page.locator('a[href^="/library/"]').first();
    await expect(card).toBeVisible({ timeout: 5_000 });
    const href = await card.getAttribute('href');
    await card.click();
    await waitForSettle(page);
    const shot = await screenshot(page, 'library-domain');
    screen.screenshots.push(shot);

    // Try clicking a regulation row within the domain
    await tryInteraction('library_regulation_row_click', screen, async () => {
      const regRow = page.locator('a[href*="/library/"]').nth(1);
      await expect(regRow).toBeVisible({ timeout: 5_000 });
      await regRow.click();
      await waitForSettle(page);
      const shot2 = await screenshot(page, 'library-regulation-detail');
      screen.screenshots.push(shot2);

      // Try tabs inside regulation detail
      await tryInteraction('library_regulation_tabs', screen, async () => {
        const tabs = page.locator('[role="tablist"] [role="tab"]');
        const count = await tabs.count();
        for (let i = 0; i < count; i++) {
          await tabs.nth(i).click();
          await page.waitForTimeout(300);
        }
        const shot3 = await screenshot(page, 'library-regulation-tabs');
        screen.screenshots.push(shot3);
      });

      await page.goBack();
      await waitForSettle(page);
    });

    await page.goto(`${BASE_URL}/library`, { waitUntil: 'domcontentloaded' });
    await waitForSettle(page);
  });

  screen.screenshots.push(await screenshot(page, 'library-final'));
  return screen;
}

// ── /faq ──────────────────────────────────────────────────────────────────────

async function auditFaq(page: Page): Promise<ScreenReport> {
  const screen = makeScreen('/faq');
  const errors = collectConsoleErrors(page);

  if (!(await navigateTo(page, '/faq', screen))) return screen;

  screen.screenshots.push(await screenshot(page, 'faq-loaded'));
  screen.console_errors = errors;

  // Check for upgrade banner (monitor tier gate)
  const upgradeBanner = page.locator('text=/upgrade/i, text=/intelligence plan/i').first();
  if (await upgradeBanner.isVisible({ timeout: 2_000 }).catch(() => false)) {
    screen.empty_states.push('FAQ gated behind Intelligence plan — upgrade banner visible');
    const shot = await screenshot(page, 'faq-upgrade-banner');
    screen.screenshots.push(shot);
  }

  // Try interacting with search field
  await tryInteraction('faq_search_field', screen, async () => {
    const searchField = page.locator('#faq-search');
    await expect(searchField).toBeVisible({ timeout: 5_000 });
    // It may be disabled for monitor tier
    const isDisabled = await searchField.isDisabled();
    if (isDisabled) {
      screen.empty_states.push('FAQ search field disabled (monitor tier)');
      throw new Error('Search field disabled — monitor tier gate');
    }
    await searchField.fill('telehealth');
    await page.waitForTimeout(500);
    const shot = await screenshot(page, 'faq-search-typed');
    screen.screenshots.push(shot);
    await searchField.clear();
  });

  // Click first FAQ card if available
  await tryInteraction('faq_first_card_click', screen, async () => {
    const card = page.locator('a[href^="/faq/"]').first();
    await expect(card).toBeVisible({ timeout: 5_000 });
    await card.click();
    await waitForSettle(page);
    const shot = await screenshot(page, 'faq-detail');
    screen.screenshots.push(shot);
    await page.goBack();
    await waitForSettle(page);
  });

  screen.screenshots.push(await screenshot(page, 'faq-final'));
  return screen;
}

// ── /sources ──────────────────────────────────────────────────────────────────

async function auditSources(page: Page): Promise<ScreenReport> {
  const screen = makeScreen('/sources');
  const errors = collectConsoleErrors(page);

  if (!(await navigateTo(page, '/sources', screen))) return screen;

  screen.screenshots.push(await screenshot(page, 'sources-loaded'));
  screen.console_errors = errors;

  // Check for empty state
  const emptyEl = page.locator('text=/no sources/i');
  if (await emptyEl.isVisible({ timeout: 2_000 }).catch(() => false)) {
    screen.empty_states.push('No sources listed');
  }

  // Try clicking the first source row/card
  await tryInteraction('sources_first_row_click', screen, async () => {
    const row = page.locator('table tr td a, [data-testid="source-row"] a, main a[href^="/sources/"]').first();
    await expect(row).toBeVisible({ timeout: 5_000 });
    await row.click();
    await waitForSettle(page);
    const shot = await screenshot(page, 'sources-detail');
    screen.screenshots.push(shot);
    await page.goBack();
    await waitForSettle(page);
  });

  // Check for filter/search controls
  await tryInteraction('sources_filter_controls', screen, async () => {
    const filter = page.locator('input[type="search"], input[placeholder*="filter"], input[placeholder*="search"]').first();
    await expect(filter).toBeVisible({ timeout: 3_000 });
    screen.interactions_succeeded.push('sources_filter_controls');
  });

  screen.screenshots.push(await screenshot(page, 'sources-final'));
  return screen;
}

// ── /audit ──────────────────────────────────────────────────────────────────────

async function auditAuditTrail(page: Page): Promise<ScreenReport> {
  const screen = makeScreen('/audit');
  const errors = collectConsoleErrors(page);

  if (!(await navigateTo(page, '/audit', screen))) return screen;

  screen.screenshots.push(await screenshot(page, 'audit-loaded'));
  screen.console_errors = errors;

  // Check for empty state
  const emptyEl = page.locator('text=/no validation/i, text=/no audit/i, text=/no records/i');
  if (await emptyEl.isVisible({ timeout: 2_000 }).catch(() => false)) {
    screen.empty_states.push('No audit records yet');
  }

  // Check for PDF export button
  await tryInteraction('audit_export_pdf_button', screen, async () => {
    const exportBtn = page.locator('a[href*="/audit/export"], button:has-text("Export"), a:has-text("PDF")').first();
    await expect(exportBtn).toBeVisible({ timeout: 5_000 });
    // Don't actually click export — just confirm it's visible/actionable
  });

  screen.screenshots.push(await screenshot(page, 'audit-final'));
  return screen;
}

// ── /settings ─────────────────────────────────────────────────────────────────

async function auditSettings(page: Page): Promise<ScreenReport> {
  const screen = makeScreen('/settings');
  const errors = collectConsoleErrors(page);

  if (!(await navigateTo(page, '/settings', screen))) return screen;

  screen.screenshots.push(await screenshot(page, 'settings-loaded'));
  screen.console_errors = errors;

  // Practice gate check
  const gate = page.locator('text=/no practice configured/i');
  if (await gate.isVisible({ timeout: 2_000 }).catch(() => false)) {
    screen.empty_states.push('No practice configured — callout visible');
  }

  // Email alerts switch
  await tryInteraction('settings_email_alerts_toggle', screen, async () => {
    const sw = page.locator('#email-alerts');
    await expect(sw).toBeVisible({ timeout: 5_000 });
    const checked = await sw.getAttribute('aria-checked');
    await sw.click();
    await page.waitForTimeout(800); // wait for optimistic save
    const shot = await screenshot(page, 'settings-email-alerts-toggled');
    screen.screenshots.push(shot);
    // Toggle back
    await sw.click();
    await page.waitForTimeout(800);
  });

  // Email threshold select
  await tryInteraction('settings_email_threshold_select', screen, async () => {
    // Radix Select.Trigger — find the trigger near the threshold label
    const trigger = page.locator('[data-radix-select-trigger]').first();
    await expect(trigger).toBeVisible({ timeout: 5_000 });
    await trigger.click();
    await page.waitForTimeout(400);
    const shot1 = await screenshot(page, 'settings-threshold-open');
    screen.screenshots.push(shot1);
    // Pick "Medium & above"
    const option = page.locator('[data-radix-select-item]:has-text("Medium")').first();
    if (await option.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await option.click();
      await page.waitForTimeout(800);
    } else {
      // Fallback: try text selector
      await page.locator('text=Medium & above').click();
      await page.waitForTimeout(800);
    }
    const shot2 = await screenshot(page, 'settings-threshold-changed');
    screen.screenshots.push(shot2);
    // Revert to "High & above"
    await trigger.click();
    await page.waitForTimeout(400);
    const revert = page.locator('[data-radix-select-item]:has-text("High"), text=High & above').first();
    if (await revert.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await revert.click();
      await page.waitForTimeout(800);
    }
  });

  // Weekly digest switch
  await tryInteraction('settings_weekly_digest_toggle', screen, async () => {
    const sw = page.locator('#weekly-digest');
    await expect(sw).toBeVisible({ timeout: 5_000 });
    await sw.click();
    await page.waitForTimeout(800);
    const shot = await screenshot(page, 'settings-weekly-digest-toggled');
    screen.screenshots.push(shot);
    await sw.click();
    await page.waitForTimeout(800);
  });

  // Invite email field
  await tryInteraction('settings_invite_email_field', screen, async () => {
    const field = page.locator('#invite-email');
    await expect(field).toBeVisible({ timeout: 5_000 });
    await field.fill('test@example.com');
    await page.waitForTimeout(300);
    const shot = await screenshot(page, 'settings-invite-field');
    screen.screenshots.push(shot);
    await field.clear();
  });

  // Invite button (should be disabled for non-intelligence tier)
  await tryInteraction('settings_invite_button_state', screen, async () => {
    const inviteBtn = page.locator('button:has-text("Invite")').first();
    await expect(inviteBtn).toBeVisible({ timeout: 5_000 });
    const isDisabled = await inviteBtn.isDisabled();
    if (isDisabled) {
      screen.empty_states.push('Invite button disabled (not on Intelligence plan)');
    }
  });

  // Manage Billing / Upgrade Plan button
  await tryInteraction('settings_billing_button', screen, async () => {
    const billingBtn = page.locator('button:has-text("Manage Billing"), a:has-text("Upgrade Plan")').first();
    await expect(billingBtn).toBeVisible({ timeout: 5_000 });
  });

  screen.screenshots.push(await screenshot(page, 'settings-final'));
  return screen;
}

// ── /pricing ──────────────────────────────────────────────────────────────────

async function auditPricing(page: Page): Promise<ScreenReport> {
  const screen = makeScreen('/pricing');
  screen.auth_required = false; // Pricing is public
  const errors = collectConsoleErrors(page);

  if (!(await navigateTo(page, '/pricing', screen))) return screen;

  screen.screenshots.push(await screenshot(page, 'pricing-loaded'));
  screen.console_errors = errors;

  // Plan cards
  await tryInteraction('pricing_plan_cards_visible', screen, async () => {
    const monitor = page.locator('text=Monitor').first();
    const intelligence = page.locator('text=Intelligence').first();
    await expect(monitor).toBeVisible({ timeout: 5_000 });
    await expect(intelligence).toBeVisible({ timeout: 5_000 });
  });

  // CTA buttons — look for Subscribe / Get Started / Upgrade forms
  await tryInteraction('pricing_cta_buttons', screen, async () => {
    const ctaBtns = page.locator('button[type="submit"]:has-text("Subscribe"), button[type="submit"]:has-text("Upgrade"), button[type="submit"]:has-text("Get started"), a:has-text("Subscribe"), a:has-text("Get started")');
    const count = await ctaBtns.count();
    if (count === 0) throw new Error('No CTA buttons found');
    // Verify first CTA is visible/enabled
    await expect(ctaBtns.first()).toBeVisible({ timeout: 5_000 });
    screen.empty_states.push(`${count} CTA button(s) visible`);
  });

  // "Current plan" badge if logged in
  await tryInteraction('pricing_current_plan_badge', screen, async () => {
    const badge = page.locator('text=/current plan/i').first();
    await expect(badge).toBeVisible({ timeout: 5_000 });
  });

  screen.screenshots.push(await screenshot(page, 'pricing-final'));
  return screen;
}

// ── Main test ─────────────────────────────────────────────────────────────────

test('Cedar full UI audit — authenticated staging run', async ({ page }) => {
  ensureDir();

  const report: AuditReport = {
    generated_at: new Date().toISOString(),
    auth_succeeded: false,
    auth_note: '',
    screens: [],
  };

  // ── 1. Authenticate ──────────────────────────────────────────────────────────
  const authResult = await login(page);
  report.auth_succeeded = authResult.succeeded;
  report.auth_note = authResult.note;

  if (!authResult.succeeded) {
    // Still attempt to capture what we can, but note auth failure
    console.error('⚠️  Auth failed:', authResult.note);
  } else {
    console.log('✅ Auth succeeded:', authResult.note);
  }

  // ── 2. Audit each screen ─────────────────────────────────────────────────────
  const auditors: Array<(p: Page) => Promise<ScreenReport>> = [
    auditHome,
    auditChanges,
    auditLibrary,
    auditFaq,
    auditSources,
    auditAuditTrail,
    auditSettings,
    auditPricing,
  ];

  for (const auditor of auditors) {
    try {
      const result = await auditor(page);
      report.screens.push(result);
      console.log(
        `${result.loaded ? '✅' : '❌'} ${result.route} — ` +
        `${result.interactions_succeeded.length} interactions OK, ` +
        `${result.interactions_failed.length} failed, ` +
        `${result.console_errors.length} console errors`
      );
    } catch (err) {
      const route = auditor.name.replace('audit', '').toLowerCase();
      console.error(`❌ Auditor for ${route} threw:`, err);
      report.screens.push({
        route: `/${route}`,
        title: '',
        loaded: false,
        auth_required: true,
        url_after_load: page.url(),
        screenshots: [],
        interactions_attempted: [],
        interactions_succeeded: [],
        interactions_failed: [`auditor_threw: ${(err as Error).message.split('\n')[0]}`],
        console_errors: [],
        empty_states: ['Auditor threw an unhandled error'],
      });
    }
  }

  // ── 3. Write report ──────────────────────────────────────────────────────────
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n📄 Report written to ${REPORT_PATH}`);
  console.log(`📸 Screenshots in ${OUT_DIR}`);

  // Loose assertion — the test itself is the audit, not a pass/fail gate.
  // We just verify at least one screen loaded successfully.
  const loadedCount = report.screens.filter((s) => s.loaded).length;
  expect(loadedCount).toBeGreaterThan(0);
});
