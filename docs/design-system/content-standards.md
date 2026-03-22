# Cedar Content Standards

`content-standards.md` — Prescriptive content and copy rules for every text surface in the Cedar platform. Written for an AI coding agent with perfect recall and zero writing instinct. Every rule is testable: you can evaluate whether copy satisfies it without subjective judgment.

> **How to use this document.** Before writing or editing *any* user-facing string, find the relevant section below. Match the surface type, apply the formula, check the anti-patterns, and verify copy length. If two sections apply (e.g., a button inside a confirmation dialog), both sections' rules apply simultaneously.

---

## Document boundary map

| Concern | Document |
|---|---|
| Colors, typography, spacing, elevation, iconography, component visual specs | `design-standards.md` |
| HTML semantics, component structure, ARIA roles, DOM hierarchy, responsive breakpoints | `frontend-standards.md` |
| Interaction patterns, animations, focus management, navigation flows, loading states | `ux-standards.md` |
| **Every human-readable text string**: wording, voice, tone, capitalization, terminology, length, copy formulas, accessibility labels, disclaimers | **`content-standards.md`** (this file) |

When in doubt: if it is about *what text says* or *how text is phrased*, this document governs. If it is about *where text is rendered* or *how text looks*, defer to the other three.

---

## 1. Voice and tone

### Principle

Cedar's voice is constant. Tone adapts to context. Voice is *who we are*; tone is *how we adjust to the situation*.

### Voice attributes (always present)

Cedar has **four voice attributes**. Every string must satisfy all four simultaneously.

| Attribute | Definition | It sounds like | It does NOT sound like |
|---|---|---|---|
| **Clear** | Direct, plain language. No jargon, no ambiguity. Front-load the point. | "Your license renewal is due by March 31." | "It is advisable to be mindful of upcoming licensure deadlines." |
| **Credible** | Factual, precise, source-grounded. Cite regulations by number. Distinguish requirements from recommendations. | "Florida Statutes § 458.331 requires…" | "You basically need to…" |
| **Calm** | Measured, professional. Never alarmist, never flippant. Even urgent messages stay composed. | "Action required: This compliance deadline is 14 days away." | "⚠️ URGENT!!! Your deadline is coming up FAST!" |
| **Human** | Warm but not casual. Uses contractions, addresses the user as "you," sounds like a competent colleague. | "We couldn't save your changes. Try again." | "SAVE OPERATION FAILED. ERROR CODE 5012." |

**Self-test**: Read the string aloud. Does it sound like a trusted, composed colleague explaining something important? Ship it. Does it sound like a chatbot, a lawyer, a marketer, or a robot? Rewrite it.

### Tone spectrum by context

Tone shifts along a single axis from **warmer** to **more direct** depending on the stakes and the user's emotional state.

| Context | Tone shift | Example |
|---|---|---|
| **Onboarding / first-run** | Warmer, encouraging, slightly more verbose. Explain *why* things matter. | "Add your first practice location to start receiving regulatory alerts tailored to your services." |
| **Routine workflow** | Neutral, efficient. Minimal explanation — the user knows what they're doing. | "3 regulations updated this week" |
| **Success / completion** | Briefly affirming. Acknowledge the action, then get out of the way. No exclamation points. | "Changes saved" |
| **Warning / attention** | Direct, factual. State the risk. Offer the next step. | "This regulation takes effect in 30 days. Review changes to confirm your practice is compliant." |
| **Error / failure** | Empathetic but efficient. Say what happened, why, and what to do. Never blame the user. | "We couldn't load your compliance dashboard. Check your connection and try again." |
| **Destructive / irreversible** | Serious, precise. Name exactly what will happen. State irreversibility. | "This will permanently delete your practice profile and all associated data. This action cannot be undone." |
| **AI-generated content** | Factual, explicitly hedged. Always signal the source and limitations. | "This AI-generated summary is based on the regulation text above. Verify accuracy before relying on it." |

### Tone anti-patterns

Never use:
- Exclamation points in error, warning, or failure messages
- "Oops," "Uh oh," "Whoops," or any false-casual interjection
- "Please" unless the user has been genuinely inconvenienced (e.g., "Connection timed out. Please try again.")
- "Sorry" unless Cedar caused the problem (e.g., system outage). Never apologize for the user's own input errors.
- Humor, puns, or wordplay anywhere in the product UI
- Marketing language ("Supercharge your compliance!", "Unlock the power of…")
- All-caps for emphasis. Use bold if emphasis is needed.
- Passive constructions that obscure who did what ("An error was encountered" → "We couldn't complete the request")

---

## 2. Capitalization and casing

### Principle

**Sentence case everywhere.** Capitalize only the first word and proper nouns. This is the universal standard across Atlassian, Shopify Polaris, IBM Carbon, GitHub Primer, GitLab Pajamas, Salesforce, Microsoft, and Google Material Design. Cedar follows it without exception.

### Rules by surface

| Surface | Casing rule | Example ✅ | Anti-pattern ❌ |
|---|---|---|---|
| Page titles | Sentence case | "Regulatory updates" | "Regulatory Updates" |
| Navigation labels | Sentence case | "Practice settings" | "Practice Settings" |
| Tab labels | Sentence case | "Compliance timeline" | "Compliance Timeline" |
| Button labels | Sentence case | "Export report" | "Export Report" |
| Column headers | Sentence case | "Effective date" | "Effective Date" |
| Card titles | Sentence case | "License requirements" | "License Requirements" |
| Dialog titles | Sentence case | "Delete practice profile?" | "Delete Practice Profile?" |
| Badge text | Sentence case | "Attorney reviewed" | "ATTORNEY REVIEWED" |
| Toast messages | Sentence case | "Changes saved" | "Changes Saved" |
| Error messages | Sentence case | "Email address is required" | "Email Address Is Required" |
| Tooltip text | Sentence case | "Filter by regulation type" | "Filter By Regulation Type" |
| Placeholder text | Sentence case | "Search regulations…" | "Search Regulations…" |
| Form labels | Sentence case | "Practice name" | "Practice Name" |
| Menu items | Sentence case | "Manage team members" | "Manage Team Members" |
| Section headings | Sentence case | "Recent regulatory changes" | "Recent Regulatory Changes" |

### What to capitalize

- **First word** of any label, heading, sentence, or standalone phrase
- **Proper nouns**: Cedar, Florida, HIPAA, Medicare, Medicaid, CMS
- **Official names of regulatory bodies**: Florida Board of Medicine, Florida Department of Health, Drug Enforcement Administration
- **Statute titles on first reference**: Health Insurance Portability and Accountability Act
- **Acronyms and initialisms**: HIPAA, DEA, PHI, ePHI, CMS, OIG, FDA
- **Subscription tier names**: Monitor, Intelligence (these are Cedar product names)
- **Role names when used as product labels**: Admin, Intelligence, Monitor (when referring to Cedar roles)

### What NOT to capitalize

- Generic feature names: "compliance dashboard," "regulatory alerts," "practice profile"
- Descriptive terms: "regulation," "requirement," "alert," "update"
- Job titles without a name: "the practice administrator," "your compliance officer"
- The word after a slash when it starts a path segment: "/settings"

### Never use

- **Title Case For Headings Or Labels** — this is the single most common AI copy mistake
- **ALL CAPS** for any UI text (screen readers may read individual letters; slower to read)
- **camelCase or PascalCase** in user-facing strings

---

## 3. Terminology and vocabulary (Cedar glossary)

### Principle

One concept, one term, everywhere. Synonym drift destroys trust in a compliance platform. If the glossary says "regulation," never write "rule," "statute," "law," or "ordinance" as a synonym in the same context where "regulation" is the correct term.

### Controlled vocabulary

| Preferred term | Never use | Notes |
|---|---|---|
| regulation | rule, ordinance (when referring to state/federal regulations) | Umbrella term for regulatory requirements Cedar surfaces |
| requirement | mandate, obligation | What a regulation demands of a practice |
| practice | clinic, office, facility | Cedar's term for the customer's medical practice entity |
| practice administrator | admin, office manager, user | Describes Cedar's primary user persona |
| regulatory update | regulatory change, reg update, law change | When a regulation is added, amended, or repealed |
| compliance status | compliance state, compliance level | The practice's adherence posture |
| alert | notification (in UI labels) | The in-product notification about a regulatory change. Use "notification" only for email/push channels. |
| effective date | enforcement date, go-live date | When a regulation takes effect |
| Attorney reviewed | Lawyer reviewed, Legal reviewed, Expert reviewed | The specific badge name for human-reviewed AI content |
| AI-generated | AI-created, auto-generated, machine-generated | Standard label for AI content per MIT Sloan research |
| Monitor (tier) | Basic, Starter, Free | Cedar's ~$99/mo subscription tier |
| Intelligence (tier) | Pro, Premium, Advanced | Cedar's ~$199/mo subscription tier |
| sign in | log in, login, sign on | Per GitHub Primer convention; "sign in" is the verb, "sign-in" is the adjective |
| sign out | log out, logout | Consistent with "sign in" |
| set up (verb) | setup (verb) | "Set up your practice" (verb) vs. "practice setup" (noun) |
| OK | Ok, Okay, ok | Per IBM Carbon, Shopify Polaris |
| email | e-mail, Email | Always lowercase, never hyphenated |
| cannot | can not, can't (in formal compliance content) | Use "cannot" in compliance-adjacent text; "can't" is acceptable in general UI |

### Regulatory body references

**First mention**: Full official name with abbreviation in parentheses.
"The Florida Board of Medicine (the Board) requires…"

**Subsequent mentions**: Use the established short form.
"The Board issued updated guidance…"

**Common Cedar abbreviations** (define on first use per page/screen):

| Full name | Short form |
|---|---|
| Florida Board of Medicine | the Board |
| Florida Department of Health | DOH |
| Centers for Medicare & Medicaid Services | CMS |
| Office of Inspector General | OIG |
| Drug Enforcement Administration | DEA |
| Health Insurance Portability and Accountability Act | HIPAA |
| Protected Health Information | PHI |
| Electronic Protected Health Information | ePHI |
| Agency for Health Care Administration | AHCA |

### Statute citation format

Use this format for Florida statute references: **F.S. § [section number]**

- Always include a space between § and the number
- First mention: Provide plain-language context alongside the citation
  - ✅ "Florida law requires physicians to meet continuing education requirements (F.S. § 458.331)."
  - ❌ "F.S. § 458.331"
- For Florida Administrative Code: **Fla. Admin. Code r. [rule number]**
- For federal regulations: **[Title] C.F.R. § [section]** (e.g., "45 C.F.R. § 164.502")
- Hyperlink citations to official sources whenever technically possible

### Pluralization rules

| Count | Pattern | Example |
|---|---|---|
| 0 | "No [plural noun]" | "No regulations found" |
| 1 | "1 [singular noun]" | "1 regulation" |
| 2+ | "[n] [plural noun]" | "5 regulations" |
| Unknown/loading | Omit the count | "Loading regulations…" |

Never write: "regulation(s)" or "0 regulation" or "1 regulations."

### Number formatting

- Use numerals for all numbers in the UI, including 1–9 (Google Material convention). "3 alerts" not "three alerts."
- Exception: never start a sentence with a numeral. Reword if necessary.
- Use commas for numbers ≥ 1,000: "1,250 regulations"
- Currency: dollar sign, no decimal for whole dollars. "$99/mo" or "$199.00"
- Percentages: numeral + % symbol. "85% compliant"

---

## 4. Button and action labels

### Principle

Buttons are commitments. The label must tell the user exactly what will happen when they click. Verb-first. Specific over generic. Concise — **1–3 words**.

### Formula

**[Verb]** or **[Verb] + [noun]**

Use the verb alone when context makes the object obvious. Add the noun when disambiguation is needed.

### Patterns by action type

| Action type | Pattern | Example ✅ | Anti-pattern ❌ |
|---|---|---|---|
| **Primary / create** | Specific verb + noun | "Add practice," "Create alert" | "Submit," "Done," "OK" |
| **Save** | "Save" or "Save [noun]" | "Save changes," "Save" | "Apply," "Confirm" (when saving) |
| **Cancel / dismiss** | "Cancel" | "Cancel" | "Never mind," "Go back," "No" |
| **Destructive** | Specific destructive verb + noun | "Delete practice," "Remove member" | "Delete," "Remove" (without noun for destructive actions) |
| **Navigation** | Specific destination or action | "View regulation," "Go to dashboard" | "Click here," "Next," "Continue" |
| **Filter / search** | Action verb | "Apply filters," "Search" | "Go," "Find" |
| **Export / download** | "Export [noun]" or "Download [noun]" | "Export report," "Download PDF" | "Get," "Grab" |
| **Confirmation dialog: confirm** | Restate the destructive action | "Delete practice profile" | "Yes," "OK," "Confirm" |
| **Confirmation dialog: cancel** | Name the safe alternative | "Keep profile," "Cancel" | "No," "Go back" |
| **Upgrade / upsell** | "Upgrade to [tier name]" | "Upgrade to Intelligence" | "Learn more," "Unlock," "Go Pro" |

### Loading state labels

When a button triggers an async action, replace the label with the progressive form:
- "Save" → "Saving…"
- "Export report" → "Exporting…"
- "Delete practice" → "Deleting…"

Use an ellipsis (…) character, not three periods. The button must be disabled during this state.

### Button label anti-patterns

- Generic labels: "Submit," "OK," "Done," "Yes," "No," "Confirm"
- Noun-first labels: "Report export" (should be "Export report")
- Labels > 4 words (convert to a link instead per Microsoft guidance)
- Redundant verbs: "View" or "Go to" when the link text itself implies navigation
- Branded/jargon verbs: "Boost," "Supercharge," "Unlock"
- Different verbs for the same action across the product (e.g., "Remove" on one screen, "Delete" on another for the same operation)

### Feedback consistency rule (GitHub Primer)

Toast and status messages must use **the same verb** that appeared on the triggering button.
- Button: "Archive regulation" → Toast: "Regulation archived" ✅
- Button: "Archive regulation" → Toast: "Moved to archive" ❌

---

## 5. Link text

### Principle

Every link must describe its destination or action without surrounding context. A screen reader user tabbing through links should understand each one independently.

### Rules

1. **Never use**: "Click here," "here," "Read more," "Learn more" as standalone link text.
2. **Describe the destination**: "View Florida Board of Medicine guidelines" not "Click here to view guidelines."
3. **If "Learn more" is needed**: add `aria-label` with full context. Visible text: "Learn more." `aria-label`: "Learn more about HIPAA compliance requirements." Limit to one "Learn more" link per screen.
4. **Link relevant keywords** within a natural sentence. Don't wrap the entire sentence.
5. **Keep punctuation outside the link** unless the link is a standalone sentence.
6. **Do not duplicate links**: If two links on the same screen go to the same destination, consolidate.
7. **External links**: Append "(opens in new tab)" as visually hidden text or via `aria-label` for links that open new windows.

### Examples

| ✅ Correct | ❌ Incorrect |
|---|---|
| "Review the [Florida telemedicine regulations]" | "Click [here] to see the regulations" |
| "See [HIPAA Privacy Rule requirements]" | "[Read more]" |
| "[Florida Board of Medicine guidelines] cover scope of practice" | "For more info, [click here]" |

---

## 6. Empty states

### Principle

An empty state is a teaching moment. Tell the user *what belongs here*, *why it's empty*, and *what to do next*. Never leave a blank screen.

### Structure formula

```
[Optional icon/illustration]
[Headline — what this space is for]
[Description — 1-2 sentences: why it's empty + what to do]
[Primary action button — verb-first]
[Optional secondary link — e.g., "Learn more about regulatory alerts"]
```

### Patterns by empty state category

**No-data-yet (first run):**
The user hasn't taken the setup action yet. Tone: encouraging, explanatory.

```
Headline: "Track your regulatory requirements"
Description: "Add your practice details and services to receive personalized compliance alerts for Florida regulations that affect your practice."
Button: "Add practice details"
```

**No-results (filtered/searched):**
The user searched or filtered and got zero results. Tone: helpful, neutral.

```
Headline: "No regulations match your filters"
Description: "Try adjusting your filters or search terms."
Button: "Clear filters"
```

**Feature gated (higher tier required):**
Content is available on a higher subscription tier. Tone: informative, not salesy.

```
Headline: "AI regulatory analysis"
Description: "Automated analysis of how regulatory changes affect your practice is available on the Intelligence plan."
Button: "Upgrade to Intelligence"
```

**Permission restricted:**
The user's role doesn't include this feature. Tone: factual, helpful.

```
Headline: "You don't have access to this feature"
Description: "Contact your practice administrator to request access."
```
(No action button — the user can't self-serve this.)

**Error / failed to load:**
Data should be here but couldn't load. Tone: empathetic, action-oriented.

```
Headline: "Couldn't load regulations"
Description: "Something went wrong on our end. Try refreshing the page."
Button: "Refresh"
```

### Empty state anti-patterns

- Blank white space with no text
- "No data" or "Nothing here" without explanation
- "Oops! Looks like there's nothing here yet 😅"
- Marketing copy in empty states ("Unlock the power of regulatory intelligence!")
- Questions that pressure the user ("Haven't set up your practice yet?")
- Technical IDs or error codes

---

## 7. Error messages

### Principle

Error messages must answer three questions: **What happened? Why? What should the user do?** Be specific. Be kind. Never blame the user.

### Structure formula

```
[What happened — specific, human-readable description]
[Why — cause, if known and useful]
[What to do — concrete next step]
```

Not every error needs all three parts. Inline field validation may only need part one. A full-page error state needs all three.

### Patterns by error type

**Form field validation:**
Display directly below the invalid field. One sentence. State the requirement, not the failure.

| ✅ Correct | ❌ Incorrect |
|---|---|
| "Email address is required" | "Field required" |
| "Email must include @ and a domain" | "Invalid email" |
| "Password must be at least 8 characters" | "Password too short" |
| "Practice name must be between 2 and 100 characters" | "Error in name field" |

**API / network errors:**
When a server request fails. Toast or banner depending on severity.

| ✅ Correct | ❌ Incorrect |
|---|---|
| "Couldn't save your changes. Check your connection and try again." | "Error 500" |
| "We couldn't load the compliance dashboard. Try refreshing the page." | "Something went wrong." |
| "The request timed out. Please try again." | "Timeout" |

**Permission errors:**
When the user lacks authorization. Inline or full-page.

| ✅ Correct | ❌ Incorrect |
|---|---|
| "You don't have permission to edit practice settings. Contact your administrator." | "403 Forbidden" |
| "This feature is available to Admin users. Contact your practice administrator for access." | "Access denied" |

**Not-found errors:**
When a resource doesn't exist or was deleted.

| ✅ Correct | ❌ Incorrect |
|---|---|
| "This regulation was removed or doesn't exist. Return to the regulations list." | "404 Not Found" |
| "We couldn't find that page. It may have been moved or deleted." | "Page not found" |

**Conflict / stale data errors:**
When data changed since the user last loaded it.

| ✅ Correct | ❌ Incorrect |
|---|---|
| "This record was updated by another user. Refresh to see the latest version." | "Conflict error" |
| "Your session has expired. Sign in again to continue." | "Session invalid" |

### Error message anti-patterns

- Error codes without human-readable text
- "Invalid" as a standalone word (use "must be" or "is required" instead)
- "An error has occurred" (what error?)
- "Oops!" / "Uh oh!" / "Whoops!" 
- Blaming the user: "You entered an invalid email" → "Enter a valid email address"
- "Please contact support" as the only remedy (first offer self-service options)
- Humor or casualness: "Looks like something broke! 😬"
- Double apologies: "Sorry, we're sorry…"
- Technical language: "Null pointer," "Uncaught exception," "CORS error"

### Accessibility requirements for errors

- Set `aria-invalid="true"` on invalid fields
- Link error text to the field with `aria-describedby`
- Use `role="alert"` on error containers so screen readers announce them
- For multi-field form errors, provide a summary at the top with links to each invalid field
- Preserve all user input when displaying errors — never clear correct fields

---

## 8. Success and confirmation messages

### Principle

Confirm the action. Use the same verb the user clicked. Keep it brief — success messages should be the shortest strings in the product.

### Formula

**"[Noun] [past-tense verb]"** or **"[Past-tense verb] [noun]"**

### Patterns

| Trigger | Toast message ✅ | Anti-pattern ❌ |
|---|---|---|
| Save button clicked | "Changes saved" | "Your changes have been saved successfully!" |
| Practice added | "Practice added" | "Success! You've added a new practice." |
| Member removed | "Member removed" | "The team member has been removed." |
| Report exported | "Report exported" | "Your report is now available for download!" |
| Filters applied | "Filters applied" | "Great! Your filters have been updated." |

### Rules

1. **2–3 words max** for standard toast messages (Shopify Polaris convention).
2. **Match the trigger verb**: If the button said "Archive," the toast says "Archived" or "[Item] archived."
3. **No exclamation points** in success toasts.
4. If the action is **undoable**, include an "Undo" action link in the toast.
5. **Auto-dismiss** toasts after 5–10 seconds. Minimum 5 seconds for accessibility. Include a dismiss button.
6. For **background processes** that take time, use a progress indicator rather than a premature success toast.
7. **Omit success messages** for trivial, expected actions (toggling a filter, sorting a column). Only confirm actions that modify data.

### Success message anti-patterns

- "Successfully" as an adverb ("Successfully saved" → "Saved")
- "!" in any success message
- Celebrating routine actions ("Great job saving those changes!")
- Long success messages (anything > 5 words in a toast)
- Generic "Done" or "Complete" without specifying what was done

---

## 9. Confirmation dialog body copy

### Principle

Confirmation dialogs exist to prevent irreversible mistakes. The body copy must make the consequence unmistakably clear so the user can make an informed decision. Reserve dialogs for **destructive or irreversible actions only**.

### Structure formula

```
Title: [Verb] [specific object]?
Body: [What will happen] + [What will be lost/affected] + [Reversibility statement]
Primary button: [Repeat the destructive verb + object] (danger styling)
Secondary button: [Safe alternative] or "Cancel"
```

### Examples

**Deleting a practice profile:**
```
Title: Delete "Coastal Med Spa"?
Body: This will permanently delete the practice profile, all associated compliance data, and team member access. This action cannot be undone.
Primary: Delete practice
Secondary: Keep practice
```

**Removing a team member:**
```
Title: Remove Jordan Lee?
Body: Jordan Lee will lose access to Cedar immediately. Their past activity will remain in your audit log.
Primary: Remove member
Secondary: Cancel
```

**Canceling a subscription:**
```
Title: Cancel your Intelligence subscription?
Body: Your subscription will remain active until March 31, 2026. After that, your account will revert to the Monitor plan. You'll lose access to AI regulatory analysis and priority alerts.
Primary: Cancel subscription
Secondary: Keep subscription
```

### Rules

1. **Title is always a question** ending with "?" — restates the action + names the specific object.
2. **Never use "Are you sure?"** — this is the #1 confirmation dialog anti-pattern. Users reflexively confirm without reading.
3. **Name the specific item** being affected — "Delete 'Coastal Med Spa'?" not "Delete this practice?"
4. **State reversibility explicitly**: "This action cannot be undone" or "You can restore this within 30 days."
5. **Primary button restates the destructive action** — "Delete practice," not "Yes" or "Confirm."
6. **Secondary button names the safe alternative** — "Keep practice" is better than "Cancel" (avoids the "cancel the cancellation" confusion).
7. **Focus lands on the safe option** (secondary button) by default, not the destructive option.
8. **Typed confirmation** for the most dangerous operations only (deleting an entire practice account). Prompt: "Type the practice name to confirm."

### Confirmation dialog anti-patterns

- "Are you sure you want to delete this?" (no specifics)
- "Yes" / "No" button labels
- "OK" / "Cancel" button labels
- Body copy that doesn't mention consequences
- Missing reversibility statement
- Confirmation dialogs for non-destructive actions (don't ask to confirm a save)

---

## 10. Timestamps and relative time

### Principle

Display time in the most human-useful format for the context. Recent events get relative time. Historical events get absolute dates. Compliance deadlines always get absolute dates.

### Relative time ladder

| Elapsed time | Display format | Example |
|---|---|---|
| < 1 minute | "Just now" | "Just now" |
| 1–59 minutes | "[n] minutes ago" | "13 minutes ago" |
| 1–23 hours (same day) | "[h:mm am/pm]" | "10:30 am" |
| Yesterday | "Yesterday at [h:mm am/pm]" | "Yesterday at 3:45 pm" |
| 2–6 days ago | "[Day] at [h:mm am/pm]" | "Friday at 10:30 am" |
| 7 days – 11 months | "[Mon DD] at [h:mm am/pm]" | "Aug 14 at 10:30 am" |
| ≥ 12 months | "[Mon DD, YYYY]" | "Aug 14, 2024" |

### Absolute date format

- **Full**: "March 21, 2026" (always spell out the month; never use numeric-only dates like 3/21/26)
- **Abbreviated** (when space-constrained): "Mar 21, 2026"
- **Never use**: ordinal suffixes (1st, 2nd, 3rd), numeric-only dates (3/21/2026), shortest month abbreviation (M, J, N)

### Time format

- **12-hour clock**: "10:30 am", "3:45 pm" (lowercase am/pm, no periods, with space)
- Use "noon" or "midnight" instead of "12:00 pm" or "12:00 am"
- Include time zone abbreviation when relevant for compliance deadlines: "March 31, 2026 at 11:59 pm ET"

### When to use absolute vs. relative

| Context | Format | Rationale |
|---|---|---|
| Feed/activity items | Relative time | Recency matters most |
| Compliance deadlines | Absolute date (always) | Ambiguity is dangerous |
| Regulation effective dates | Absolute date (always) | Precision required |
| "Last updated" timestamps | Absolute date + time | Audit trail clarity |
| "Attorney reviewed" dates | Absolute date | Trust and accountability |
| Email timestamps | Absolute date + time + timezone | Cross-timezone accuracy |
| Table columns with dates | Absolute date | Sortability and scanning |

### Date ranges

Use an en dash (–) without spaces: "January 23–April 1" or "Jan 23–Apr 1, 2026"

If spanning years, include year on both: "December 15, 2025–January 31, 2026"

---

## 11. Null and missing data display

### Principle

Never leave a cell, field, or display area visually empty. Explicitly communicate that data is absent and, if possible, why.

### Patterns

| Scenario | Display | Example |
|---|---|---|
| Data not yet entered | Descriptive placeholder | "Not provided" |
| Data doesn't apply | Em dash | "—" |
| Data is loading | Skeleton/shimmer state | (per `ux-standards.md`) |
| Data failed to load | Error micro-text | "Couldn't load" |
| Numeric value is zero | The number "0" | "0 alerts" |
| Date not set | "No date set" or "—" | "No date set" |
| Optional field left blank | "—" or "None" | "—" |

### Rules

1. **In tables**: Use an em dash "—" for cells where data doesn't exist or doesn't apply. Never leave a cell empty.
2. **In cards**: Use "Not provided" for user-entered fields that are empty. Use "—" for system fields that don't apply.
3. **Counts of zero**: Always display the numeral "0" — never hide the count or show "—" when the count is genuinely zero. "0 active alerts" is informative; "—" is ambiguous.
4. **Never display**: "null," "undefined," "N/A," "None" (as a data value in tables), or "—" for something that should have data but failed to load.

---

## 12. Tooltips and helper text

### Principle

Tooltips supplement — they never replace labels, and they never contain critical information. Users who can't hover (touch devices, keyboard users) may never see them.

### When to use tooltips

- Clarify an icon-only button's action
- Explain an unfamiliar term used in a label
- Provide secondary context that isn't essential for completing the task

### When NOT to use tooltips

- To hold information required to complete a task (put it in helper text instead)
- To explain poor label copy (fix the label)
- On elements that already have visible, descriptive labels
- To contain links, buttons, or interactive elements (they're inaccessible in tooltips)

### Tooltip copy rules

- **Max length**: 60 characters for a single-line tooltip; 130 characters absolute max (per Intuit Content Design guidelines)
- **No complete sentences required**: Fragment form is fine. "Filter by regulation type" not "This filter lets you narrow results by regulation type."
- **No period** unless the tooltip is a complete sentence
- **Sentence case**
- **No "this" or "the" at the start** when space is tight: "Filter by regulation type" not "This filters by regulation type"

### Helper text (below form fields)

Use helper text for:
- Format requirements: "Use format: MM/DD/YYYY"
- Input constraints: "Maximum 100 characters"
- Contextual guidance: "This name appears on all compliance reports"

Rules:
- Place below the form label and above the input, or below the input (be consistent; pick one and use it throughout)
- Use `aria-describedby` to associate helper text with the field
- Do not start with "This field is…" or "Use this to…" — just state the information directly
- If a field has both helper text and an error, the error replaces the helper text

---

## 13. Accessibility label copy

### Principle

Every interactive element must be perceivable and operable by screen reader users. Accessibility labels describe actions and state, not visual appearance.

### aria-label patterns

| Element | aria-label pattern | Example |
|---|---|---|
| Close button (✕) | "Close [context]" | `aria-label="Close dialog"` |
| Icon-only button | "[Action]" (describe the action, not the icon) | `aria-label="Search"` (not "Magnifying glass") |
| Icon-only button with context | "[Action] [object]" | `aria-label="Edit practice profile"` |
| Navigation landmark | "[Region] navigation" | `aria-label="Main navigation"` |
| Severity badge | "[Severity level]" | `aria-label="High severity"` |
| Status badge | "[Status name]" | `aria-label="Attorney reviewed"` |
| Ambiguous "Learn more" link | "Learn more about [topic]" | `aria-label="Learn more about HIPAA requirements"` |
| External link | "[Link text] (opens in new tab)" | `aria-label="Florida Board of Medicine website (opens in new tab)"` |
| Sort button | "Sort by [column name]" | `aria-label="Sort by effective date"` |
| Toggle | "[Feature name], currently [on/off]" | `aria-label="Email alerts, currently on"` |

### Alt text rules

- **Informational images**: Describe the meaning conveyed, max ~125 characters. "Compliance status chart showing 85% of requirements met."
- **Decorative images**: `alt=""` (empty string, not omitted)
- **Functional images** (images inside buttons/links): Describe the function. `alt="Search"` not `alt="magnifying glass icon"`
- **Complex charts**: Brief alt text + `aria-describedby` pointing to a detailed description
- **Never use**: "Image of…", "Photo of…", "Icon of…" — start directly with the content

### aria-live announcements

| Event | aria-live value | Announcement text |
|---|---|---|
| Toast notification | `assertive` | Same text as the toast |
| Form validation error | `assertive` (via `role="alert"`) | The error message text |
| Loading complete | `polite` | "Regulations loaded" or "[n] results found" |
| Status change | `polite` | "Compliance status updated" |
| Content filtered | `polite` | "[n] regulations match your filters" |

### Rules

1. `aria-label` must **start with the visible text** if the element has visible text (WCAG 2.5.3 Label in Name).
2. Never use directional language ("Click the button on the left") — screen readers don't convey spatial layout.
3. Use sentence case for all accessibility labels. All-caps text may be read letter-by-letter by some screen readers.
4. Spell out abbreviations in aria-labels on first use: `aria-label="Health Insurance Portability and Accountability Act (HIPAA) compliance"` (only needed once per page context).

---

## 14. System status and operational messages

### Principle

Users must always know the system's current state. Use progressive disclosure — show what's relevant now, provide detail on demand.

### Patterns

**Maintenance / downtime:**
```
Banner: "Scheduled maintenance on March 25 from 2:00–4:00 am ET. Cedar may be briefly unavailable."
```

**Degraded performance:**
```
Banner: "Some features are running slower than usual. We're working on it."
```

**System outage (current):**
```
Full-page: "Cedar is temporarily unavailable. We're aware of the issue and working to restore service. Check status.cedar.app for updates."
```

**Feature unavailable:**
```
Inline: "This feature is temporarily unavailable. Try again later."
```

### Rules

1. Always include a **time frame** if known: "back within the hour," "maintenance until 4:00 am ET."
2. Use "we" language — Cedar takes ownership: "We're working on it" not "The system is experiencing issues."
3. Provide a **status page link** for outages.
4. Banner messages persist until the condition resolves — they are not auto-dismissable.

---

## 15. AI-generated content and disclaimers

### Principle

Cedar surfaces AI-generated regulatory summaries, FAQs, and analysis. Users must always know when content is AI-generated, whether it has been reviewed by a human expert, and that it does not constitute legal or medical advice. **The architecture must prevent crossing the inform/advise boundary — disclaimers are a second layer of protection, not the primary one.**

### AI content labels

| Content type | Label | Badge |
|---|---|---|
| AI-generated, not yet reviewed | "AI-generated" | Gray badge: "AI-generated" |
| AI-generated, attorney reviewed | "Attorney reviewed" | Green badge: "Attorney reviewed" |
| Direct regulatory text (not AI) | No label needed | No badge |

### Disclaimer tiers

**Tier 1 — Per-section inline disclaimer** (required on every AI-generated content block):
> "This summary was generated by AI based on the regulation text. It is for informational purposes only and does not constitute legal advice. Verify critical details against the original regulation."

**Tier 2 — Attorney reviewed inline disclaimer** (replaces Tier 1 when applicable):
> "This summary was reviewed by a licensed attorney on [date]. It is for informational purposes only and does not constitute legal advice."

**Tier 3 — Page-level disclaimer** (on every page that contains regulatory information):
> "Cedar provides regulatory information for educational purposes only. It does not constitute legal, medical, or professional advice. Consult a qualified professional before making compliance decisions."

**Tier 4 — Platform-wide disclaimer** (footer link on every page, links to full legal page):
> "Disclaimer: Not legal advice"

### Confidence and certainty language

| Certainty level | Use for | Language pattern | Example |
|---|---|---|---|
| **Definitive** | Statutory requirements — what the law says | "requires," "must," "is required by" | "F.S. § 458.331 requires physicians to complete 40 hours of continuing education biennially." |
| **Strong guidance** | Well-established regulatory interpretations | "should," "is expected to," "regulatory guidance indicates" | "The Board expects practices to maintain documentation for a minimum of 5 years." |
| **Hedged** | Analysis, interpretation, evolving areas | "may," "consider whether," "depending on your circumstances" | "This requirement may apply to your practice depending on the services you offer." |
| **Informational** | Context, background, general patterns | "generally," "many practices," "this area is evolving" | "Many Florida med spas maintain additional liability coverage beyond state minimums." |

### Rules

1. **Never tell users what to do** in personalized, directive terms. "Your practice must do X" crosses the advise line. "F.S. § X requires covered practices to do Y" is information.
2. **Always link to the original regulation** when summarizing AI content.
3. **Display the review date** on attorney-reviewed content: "Reviewed by [name/title] on [date]."
4. **Display "Last updated"** on all AI-generated content with absolute date.
5. **Signal staleness**: If AI content hasn't been reviewed in > 90 days, display a banner: "This analysis was last reviewed on [date]. Regulatory changes may have occurred since then."
6. Use **"AI-generated"** as the standard label term (most widely understood per MIT Sloan research). Do not use: "auto-generated," "machine-generated," "bot-written."

### AI content anti-patterns

- AI-generated content without any disclaimer
- Disclaimers buried in page footers with no inline notice
- Language that sounds like personalized advice: "You should file this form by…"
- Definitive language for AI interpretations: "This regulation means you must…"
- Omitting the original source link alongside AI summaries
- Hiding the AI-generated label in a tooltip or behind a click

---

## 16. Notification and email copy

### Principle

Notifications pull users back to Cedar when something requires attention. Emails are the user's first touchpoint — they must earn the click with clarity, not cleverness. One email, one purpose.

### Email subject lines

**Formula**: [Action/status] + [specific object]

- Max 50 characters (mobile truncation threshold)
- Lead with the action or status, not the product name
- No emojis in subject lines
- Cedar's name appears in the "From" field — don't repeat it in the subject

| ✅ Correct | ❌ Incorrect |
|---|---|
| "New regulation affects telehealth services" | "Cedar Alert: New Regulation Update 📋" |
| "HIPAA guidance updated — review changes" | "Important compliance update from Cedar" |
| "Action required: License renewal due Mar 31" | "Don't miss this deadline!" |
| "Weekly regulatory digest — 3 updates" | "Your Weekly Cedar Digest is Here!" |

### Email body structure

```
1. One-line status summary (mirrors subject line, adds key detail)
2. Key details in scannable format (bold labels, short lines)
3. Single primary CTA button
4. Secondary context or links (optional)
5. Unsubscribe / manage preferences link (required)
```

### Push / in-app notification copy

- **Headline**: ≤ 60 characters. Action-oriented. Don't repeat app name.
- **Body** (if applicable): ≤ 120 characters. Key detail + CTA context.
- Deep-link to the relevant screen, not a generic landing page.

### Digest emails

- Group updates by category (regulatory updates, compliance reminders, practice alerts)
- Include count: "5 regulatory updates this week"
- Each item: one-line summary + link
- Keep total digest under 10 items. For longer, link to the full list in-app.

---

## 17. Placeholder and instructional text

### Principle

Placeholder text inside form fields disappears when the user types — it must never be the only source of information. Labels are always visible. Placeholder text is supplementary.

### Rules

1. **Never use placeholder text as a label replacement.** Every field must have a persistent, visible label.
2. Placeholder text is for **format hints only**: "Search regulations…", "MM/DD/YYYY", "e.g., Coastal Med Spa"
3. **Use the ellipsis (…)** at the end of search-type placeholders: "Search regulations…"
4. **Sentence case**, lowercase after the first word.
5. **Do not start with**: "Enter your…", "Type your…", "Input…" — just show the expected format or an example.
6. Keep placeholder text **under 40 characters** — it will be truncated on mobile.
7. Placeholder text is **not reliably announced** by screen readers — never put essential instructions in placeholders.

| Field | Placeholder ✅ | Anti-pattern ❌ |
|---|---|---|
| Search | "Search regulations…" | "Type here to search for regulations" |
| Email | "name@example.com" | "Enter your email address" |
| Practice name | "e.g., Coastal Med Spa" | "What is your practice called?" |
| Phone | "(555) 555-0100" | "Enter phone number" |
| Date | "MM/DD/YYYY" | "Select a date" |

---

## 18. Page titles and descriptions

### Principle

Page titles are the first thing screen readers announce and what appears in browser tabs. They must be unique, descriptive, and follow a consistent formula.

### Page title formula

**[Page-specific title] — Cedar**

- The page-specific portion comes first (screen readers announce left to right; tab overviews show leftmost characters)
- Sentence case
- Separated by an em dash with spaces: " — "

| Page | Title ✅ | Anti-pattern ❌ |
|---|---|---|
| Dashboard | "Dashboard — Cedar" | "Cedar" |
| Regulation detail | "Telehealth prescribing requirements — Cedar" | "Cedar - Regulation Details" |
| Practice settings | "Practice settings — Cedar" | "Settings" |
| Team management | "Team members — Cedar" | "Cedar | Team Management" |

### Meta descriptions (for SEO-relevant pages)

- 150–160 characters max
- Describe the page's content and purpose
- Include relevant keywords naturally (not stuffed)
- No duplicate descriptions across pages

### In-page headings

- Every page has exactly **one h1** that matches or closely mirrors the page title
- Section headings are **h2**, subsections **h3** — never skip levels
- Heading text should describe the content below, not just label it: "Active regulatory requirements" not "List"

---

## 19. Copy length constraints

### Principle

Every surface has a word budget. Exceeding it means the copy will be truncated, unread, or both. These are hard limits.

| Surface | Max length | Guideline |
|---|---|---|
| **Badge label** | 20 characters | 1–2 words. "Attorney reviewed," "AI-generated," "Action required" |
| **Button label** | 25 characters / 1–3 words | Verb + optional noun. "Export report," "Save" |
| **Toast message** | 30 characters / 3–5 words | Noun + past verb. "Changes saved," "Regulation archived" |
| **Toast action label** | 10 characters / 1 word | Single verb. "Undo," "View," "Retry" |
| **Tooltip (single line)** | 60 characters | Fragment. No period unless full sentence. |
| **Tooltip (max)** | 130 characters / 3 lines | Brief context, never critical info. |
| **Placeholder text** | 40 characters | Format hint or example value. |
| **Form field label** | 30 characters | Descriptive but concise. "Practice name," "Email address" |
| **Column header** | 25 characters | Abbreviated if necessary. "Eff. date," "Status" |
| **Error message (inline)** | 80 characters / 1 sentence | Specific requirement. "Email must include @ and a domain" |
| **Error message (banner)** | 200 characters / 2–3 sentences | What happened + why + what to do |
| **Empty state headline** | 50 characters / 5–8 words | What this space is for. "Track your regulatory requirements" |
| **Empty state description** | 150 characters / 1–2 sentences | Why it's empty + what to do next |
| **Dialog title** | 50 characters | Action question. "Delete 'Coastal Med Spa'?" |
| **Dialog body** | 250 characters / 2–4 sentences | Consequence + reversibility |
| **Page title (h1)** | 60 characters | Descriptive, unique per page |
| **Notification headline** | 60 characters | Action + object summary |
| **Notification body** | 120 characters | Key detail |
| **Email subject line** | 50 characters | Action/status + object |
| **Email pre-header** | 100 characters | Supplementary context |
| **Alt text** | 125 characters | Describe meaning, not appearance |
| **aria-label** | 80 characters | Action + context |

### Rules

1. These are **hard maximums**, not targets. Shorter is better.
2. If copy exceeds the limit, the fix is **rewriting** — never truncating with "…" in a way that cuts meaning.
3. When counting: count actual characters including spaces. Browser devtools character count is the source of truth.
4. **Sentences**: Max 20 words per sentence in UI copy. Max 25 words in longer-form content (help text, email body).
5. **Reading level**: Target grade 7–8 (Flesch-Kincaid). This is achievable with short sentences, common words, and active voice.

---

## 20. Shared copy components and utilities

### Principle

Identical strings that appear on multiple screens must be defined once and reused everywhere. If you write the same string twice, you've created a future inconsistency.

### String constant categories

**Category 1: Global actions** — Strings that appear across the entire product.

```typescript
// Shared action labels
export const ACTIONS = {
  save: 'Save',
  saveChanges: 'Save changes',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  close: 'Close',
  retry: 'Try again',
  refresh: 'Refresh',
  search: 'Search',
  clearFilters: 'Clear filters',
  applyFilters: 'Apply filters',
  exportReport: 'Export report',
  downloadPdf: 'Download PDF',
  upgradePlan: 'Upgrade to Intelligence',
  signIn: 'Sign in',
  signOut: 'Sign out',
  learnMore: 'Learn more',
  viewAll: 'View all',
  goBack: 'Go back',
  undo: 'Undo',
} as const;
```

**Category 2: Status labels** — Strings used in badges, tags, and status indicators.

```typescript
export const STATUS = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  expired: 'Expired',
  actionRequired: 'Action required',
  upToDate: 'Up to date',
  underReview: 'Under review',
  aiGenerated: 'AI-generated',
  attorneyReviewed: 'Attorney reviewed',
} as const;
```

**Category 3: Empty states** — Reusable headline/description pairs.

```typescript
export const EMPTY_STATES = {
  noResults: {
    headline: 'No results match your search',
    description: 'Try different keywords or adjust your filters.',
    action: 'Clear filters',
  },
  noRegulations: {
    headline: 'No regulations to display',
    description: 'Regulations matching your practice profile will appear here.',
  },
  genericError: {
    headline: 'Something went wrong',
    description: 'We couldn\'t load this content. Try refreshing the page.',
    action: 'Refresh',
  },
} as const;
```

**Category 4: Disclaimers** — Legal copy that must never be paraphrased.

```typescript
export const DISCLAIMERS = {
  aiContent: 'This summary was generated by AI based on the regulation text. It is for informational purposes only and does not constitute legal advice. Verify critical details against the original regulation.',
  attorneyReviewed: (date: string) =>
    `This summary was reviewed by a licensed attorney on ${date}. It is for informational purposes only and does not constitute legal advice.`,
  pageLevel: 'Cedar provides regulatory information for educational purposes only. It does not constitute legal, medical, or professional advice. Consult a qualified professional before making compliance decisions.',
  footerLink: 'Not legal advice',
} as const;
```

**Category 5: Error messages** — Reusable error strings.

```typescript
export const ERRORS = {
  network: 'Couldn\'t connect to Cedar. Check your connection and try again.',
  timeout: 'The request timed out. Please try again.',
  generic: 'Something went wrong. Try again, or contact support if the problem continues.',
  forbidden: 'You don\'t have permission to perform this action. Contact your administrator.',
  notFound: 'This page doesn\'t exist or has been removed.',
  sessionExpired: 'Your session has expired. Sign in again to continue.',
  staleData: 'This record was updated by another user. Refresh to see the latest version.',
} as const;
```

### Rules

1. **Before writing a new string**, search the string constants for an existing match. If a similar string exists, use it or update it — don't create a near-duplicate.
2. **Disclaimers are locked strings**: Never paraphrase, abbreviate, or modify disclaimer text. Always reference the constant.
3. **Parameterize, don't concatenate**: Use template functions for strings that vary by context: `"Delete ${itemName}?"` — never manually assemble `"Delete " + name + "?"`.
4. **Consistency audit**: When modifying a shared string, search the codebase for all usages and verify the change is appropriate everywhere.

---

## 21. Cross-surface consistency enforcement

### Principle

A user who reads "regulation" on the dashboard, "rule" in a tooltip, and "requirement" in an email will trust Cedar less — even unconsciously. Consistency across surfaces is non-negotiable.

### Cross-check rules

**Rule 1: Same concept, same word.**
Before writing copy for any component, check what adjacent components call the same thing. If the sidebar says "Regulatory updates" and you're building a page that displays the same content, the heading is "Regulatory updates" — not "Regulation changes" or "Compliance alerts."

**Rule 2: Same action, same verb.**
If "Export" is the verb used for generating reports on the dashboard, it's "Export" everywhere — not "Download" on one screen and "Generate" on another. Exception: "Download" is correct when the user is retrieving an already-generated file; "Export" is correct when the system generates the file on demand.

**Rule 3: Same pattern, same structure.**
If empty states follow the headline + description + button formula on the regulations page, they follow it on every page. Never improvise a different structure for a new empty state.

**Rule 4: Verify against the glossary.**
Every domain term in new copy must exist in the terminology table (Section 3). If it's not there, propose adding it before using it.

**Rule 5: Check copy length constraints.**
Before shipping, verify every string against the copy length table (Section 19). Truncated text is a bug.

### Consistency red flags

If you notice any of these, stop and fix before shipping:

- Two different labels for the same navigation destination
- A button and its confirmation dialog using different verbs for the same action
- A toast message that doesn't match the button that triggered it
- A term used in the UI that doesn't appear in the glossary
- An empty state that doesn't follow the standard formula
- An error message without a "what to do" component
- A disclaimer that's been paraphrased instead of using the constant
- An AI-generated content block without a visible disclaimer
- Title Case on any surface

---

## 22. QA checklist — content and copy

Run this checklist on every PR that adds or modifies user-facing text.

### Voice and tone

- [ ] Does the copy satisfy all four voice attributes? (Clear, Credible, Calm, Human)
- [ ] Is the tone appropriate for the context? (See tone spectrum table in Section 1)
- [ ] Are there any tone anti-patterns? (exclamation points in errors, "Oops," false apologies, humor, marketing language, all-caps)

### Capitalization

- [ ] Is every surface in sentence case? (Check page titles, nav labels, buttons, headers, badges, toasts, errors, tooltips, placeholders, dialog titles)
- [ ] Are proper nouns (Cedar, Florida, HIPAA, regulatory body names, subscription tier names) correctly capitalized?
- [ ] Is there any Title Case or ALL CAPS?

### Terminology

- [ ] Does every domain term match the glossary in Section 3?
- [ ] Are regulatory bodies referred to with the correct full name on first mention and standard abbreviation thereafter?
- [ ] Are statute citations in the correct format? (F.S. § [number])
- [ ] Are there any synonym drift violations? (e.g., "rule" instead of "regulation")

### Buttons and actions

- [ ] Does every button start with a verb?
- [ ] Is the label 1–3 words and ≤ 25 characters?
- [ ] Do destructive buttons restate the specific action + object?
- [ ] Does the confirmation dialog's primary button match the destructive action?
- [ ] Are loading states using the progressive form? ("Saving…")
- [ ] Does the toast/feedback message use the same verb as the button?

### Links

- [ ] Is every link text descriptive? (No "click here," "here," or standalone "Learn more")
- [ ] Does every "Learn more" instance have an appropriate `aria-label`?
- [ ] Do external links indicate they open in a new tab?

### Empty states

- [ ] Does every empty state follow the formula: headline + description + action?
- [ ] Is the correct category pattern used? (no-data-yet, no-results, gated, restricted, error)
- [ ] Is there any blank space that should have an empty state?

### Errors

- [ ] Does every error message answer: What happened? Why? What to do?
- [ ] Are inline field errors placed below the invalid field?
- [ ] Is `aria-invalid="true"` set on invalid fields?
- [ ] Does the error avoid blaming the user?
- [ ] Is the error free of technical jargon? (No "invalid," error codes, or stack trace details)

### Success messages

- [ ] Are toast messages ≤ 3–5 words?
- [ ] Does the toast verb match the triggering button verb?
- [ ] Are undoable actions offering an "Undo" action in the toast?

### Timestamps and null data

- [ ] Are relative times following the relative time ladder?
- [ ] Are compliance deadlines and effective dates using absolute format?
- [ ] Are empty table cells showing "—" and not blank?
- [ ] Do zero counts display "0" and not "—" or blank?

### Accessibility labels

- [ ] Does every icon-only button have an `aria-label`?
- [ ] Do `aria-label` values start with the visible text (WCAG 2.5.3)?
- [ ] Do informational images have descriptive alt text ≤ 125 characters?
- [ ] Do decorative images have `alt=""`?
- [ ] Do dynamic changes (toasts, errors, status updates) use appropriate `aria-live` regions?

### AI content and disclaimers

- [ ] Is every AI-generated content block labeled with the appropriate badge?
- [ ] Does every AI-generated content block include the inline disclaimer from the string constant?
- [ ] Does attorney-reviewed content show the review date and the "Attorney reviewed" badge?
- [ ] Does the content avoid personalized advice language? (No "You should…" or "Your practice must…")
- [ ] Is the original regulation linked alongside any AI summary?
- [ ] Is the page-level disclaimer present on every page containing regulatory information?

### Copy length

- [ ] Does every string meet the copy length constraints in Section 19?
- [ ] Are all sentences ≤ 20 words?
- [ ] Are email subject lines ≤ 50 characters?

### Shared copy

- [ ] Was the string constants file checked for existing strings before writing new ones?
- [ ] Are disclaimers using the exact text from the constants, not paraphrased?
- [ ] Are any new domain terms proposed for addition to the glossary?

---

## Appendix: Research sources informing this document

This document synthesizes content design patterns from nine enterprise design systems (Atlassian Design, Shopify Polaris, IBM Carbon, Salesforce Lightning, GitHub Primer, GitLab Pajamas, Microsoft Writing Style Guide, Google Material Design, Mailchimp Content Style Guide), UX writing research from Nielsen Norman Group and Content Design London, WCAG 2.1 accessibility guidelines, and regulatory/legal platform content patterns from LexisNexis, Bloomberg Law, Thomson Reuters, Compliance.ai, and healthcare compliance platforms. All rules were validated against multiple sources for consensus before inclusion.
