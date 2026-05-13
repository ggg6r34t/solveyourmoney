"use client";

import { useState } from "react";
import {
  Sparkles,
  Settings,
  CreditCard,
  Shield,
  Coins,
  Lock,
  Check,
  Plus,
} from "lucide-react";

type Tab = "profile" | "prefs" | "accounts" | "security" | "plan" | "danger";

const SECTIONS: { id: Tab; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { id: "profile",   label: "Profile",         Icon: Sparkles },
  { id: "prefs",     label: "Preferences",     Icon: Settings },
  { id: "accounts",  label: "Linked accounts", Icon: CreditCard },
  { id: "security",  label: "Security",        Icon: Shield },
  { id: "plan",      label: "Plan & billing",  Icon: Coins },
  { id: "danger",    label: "Data & danger",   Icon: Lock },
];

function SCard({
  title,
  sub,
  action,
  children,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="card-head" style={{ marginBottom: 16 }}>
        <div>
          <div className="card-title">{title}</div>
          {sub && <div className="card-sub">{sub}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  mono,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  mono?: boolean;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span className="f-xs muted" style={{ letterSpacing: 0.02 }}>{label}</span>
      <input
        className={mono ? "mono" : ""}
        defaultValue={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        style={{
          height: 36,
          background: "oklch(1 0 0 / 0.04)",
          border: 0,
          color: "var(--fg)",
          font: "inherit",
          padding: "0 12px",
          borderRadius: 8,
          boxShadow: "0 0 0 1px var(--line)",
          outline: "none",
          fontSize: mono ? 12.5 : 13,
          width: "100%",
        }}
        onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 1px oklch(0.66 0.18 282 / 0.6), 0 0 0 4px oklch(0.66 0.18 282 / 0.15)"; }}
        onBlur={(e) => { e.currentTarget.style.boxShadow = "0 0 0 1px var(--line)"; }}
      />
    </label>
  );
}

function SwitchRow({
  label,
  sub,
  value,
  onChange,
}: {
  label: string;
  sub?: string;
  value?: boolean;
  onChange?: (v: boolean) => void;
}) {
  const [v, setV] = useState(value ?? false);
  function toggle() { const nv = !v; setV(nv); onChange?.(nv); }
  return (
    <div className="row between" style={{ padding: "10px 0", borderTop: "1px solid var(--line)" }}>
      <div style={{ maxWidth: "70%" }}>
        <div className="f-sm fw-500">{label}</div>
        {sub && <div className="f-xs muted">{sub}</div>}
      </div>
      <button
        onClick={toggle}
        aria-pressed={v}
        style={{
          width: 38, height: 22, borderRadius: 999, border: 0, cursor: "pointer",
          background: v
            ? "linear-gradient(180deg, oklch(0.7 0.18 282), oklch(0.58 0.18 282))"
            : "oklch(1 0 0 / 0.08)",
          boxShadow: v
            ? "0 0 0 1px oklch(0.7 0.18 282 / 0.6), 0 0 0 4px oklch(0.66 0.18 282 / 0.12)"
            : "0 0 0 1px var(--line)",
          position: "relative", transition: "background 120ms ease", flexShrink: 0,
        }}
      >
        <span style={{
          position: "absolute", top: 2, left: v ? 18 : 2,
          width: 18, height: 18, borderRadius: 999,
          background: "oklch(0.98 0 0)",
          boxShadow: "0 1px 2px oklch(0 0 0 / 0.4)",
          transition: "left 140ms ease",
        }} />
      </button>
    </div>
  );
}

const THEMES = [
  { id: "dark",  name: "Default", bg: "#15121f", accent: "oklch(0.66 0.18 282)" },
  { id: "oled",  name: "OLED",    bg: "#000000", accent: "oklch(0.66 0.18 282)" },
  { id: "cool",  name: "Cool",    bg: "#0e151c", accent: "oklch(0.68 0.13 200)" },
  { id: "warm",  name: "Warm",    bg: "#1b1410", accent: "oklch(0.78 0.13 50)"  },
];

function ThemePicker() {
  const [sel, setSel] = useState("dark");
  return (
    <div>
      <div className="f-xs muted" style={{ marginBottom: 8 }}>Theme</div>
      <div className="g-3" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {THEMES.map((th) => (
          <div
            key={th.id}
            onClick={() => setSel(th.id)}
            style={{
              cursor: "pointer", borderRadius: 12, overflow: "hidden",
              boxShadow: sel === th.id
                ? "0 0 0 1px var(--line), 0 0 0 2px oklch(0.66 0.18 282)"
                : "0 0 0 1px var(--line)",
            }}
          >
            <div style={{ height: 60, background: th.bg, position: "relative" }}>
              <div style={{ position: "absolute", left: 10, top: 10, width: 18, height: 6, borderRadius: 9, background: th.accent }} />
              <div style={{ position: "absolute", left: 10, top: 22, width: 46, height: 5, borderRadius: 9, background: "oklch(1 0 0 / 0.18)" }} />
              <div style={{ position: "absolute", left: 10, top: 34, width: 30, height: 5, borderRadius: 9, background: "oklch(1 0 0 / 0.10)" }} />
            </div>
            <div className="row between" style={{ padding: "8px 10px", fontSize: 11.5 }}>
              <span>{th.name}</span>
              {sel === th.id && <Check size={12} style={{ color: "var(--primary-glow)" }} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccountRow({
  name, type, last, balance, tone, sync,
}: {
  name: string; type: string; last: string;
  balance: string; tone: string; sync: string;
}) {
  const negative = balance.startsWith("−");
  const color =
    tone === "danger"  ? "var(--danger)"  :
    tone === "warn"    ? "var(--warn)"    :
    tone === "success" ? "var(--success)" : "var(--primary)";
  return (
    <div className="row between" style={{ padding: "12px 0", borderTop: "1px solid var(--line)" }}>
      <div className="row gap-12">
        <span className="cat-ico" style={{ background: "oklch(1 0 0 / 0.04)" }}>
          <CreditCard size={15} />
        </span>
        <div>
          <div className="row gap-8">
            <span className="f-sm fw-500">{name}</span>
            <span className="pill">{type}</span>
          </div>
          <div className="f-xs muted mono">{last} · synced {sync}</div>
        </div>
      </div>
      <div className="row gap-12">
        <span className="mono" style={{ fontSize: 14, color: negative ? color : "var(--fg)" }}>{balance}</span>
        <button className="btn sm ghost">···</button>
      </div>
    </div>
  );
}

function DeviceRow({
  name, location, last, current,
}: {
  name: string; location: string; last: string; current?: boolean;
}) {
  return (
    <div className="row between" style={{ padding: "12px 0", borderTop: "1px solid var(--line)" }}>
      <div>
        <div className="row gap-8">
          <span className="f-sm fw-500">{name}</span>
          {current && <span className="pill success">This device</span>}
        </div>
        <div className="f-xs muted">{location} · last seen {last}</div>
      </div>
      {!current && <button className="btn sm">Sign out</button>}
    </div>
  );
}

function PlanPerk({ label, v, sub }: { label: string; v: string; sub: string }) {
  return (
    <div style={{
      padding: "14px 16px", borderRadius: 12,
      background: "oklch(1 0 0 / 0.025)",
      boxShadow: "0 0 0 1px var(--line)",
    }}>
      <div className="muted f-xs">{label}</div>
      <div className="mono" style={{ fontSize: 22, letterSpacing: "-0.025em", marginTop: 4 }}>{v}</div>
      <div className="f-xs muted">{sub}</div>
    </div>
  );
}

function InvoiceRow({ d, desc }: { d: string; desc: string }) {
  return (
    <tr>
      <td className="mono muted">{d}</td>
      <td>{desc}</td>
      <td className="num" style={{ textAlign: "right" }}>$9.99</td>
      <td><span className="pill success"><Check size={10} /> Paid</span></td>
      <td style={{ textAlign: "right" }}>
        <a style={{ fontSize: 11, color: "var(--primary-glow)", cursor: "pointer" }}>Download</a>
      </td>
    </tr>
  );
}

export function SettingsContent({ email }: { email?: string }) {
  const [tab, setTab] = useState<Tab>("profile");
  const [name, setName] = useState("Maya Aroon");
  const [twoFa, setTwoFa] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  return (
    <>
      <div className="page-hd">
        <div>
          <h1>Settings</h1>
          <div className="sub">Identity, money, and how SolveYourMoney behaves.</div>
        </div>
        <div className="row gap-8">
          <button className="btn ghost">Discard</button>
          <button className="btn primary">
            <Check size={14} /> Save changes
          </button>
        </div>
      </div>

      <div className="g-12">
        {/* Left rail */}
        <div style={{ gridColumn: "span 3" }}>
          <div className="card flat" style={{ padding: 8 }}>
            {SECTIONS.map(({ id, label, Icon }) => (
              <div
                key={id}
                onClick={() => setTab(id)}
                className={"nav-item" + (tab === id ? " active" : "")}
                style={{ margin: 2 }}
              >
                <Icon size={16} />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginTop: 14, padding: 16 }}>
            <div className="row gap-8" style={{ marginBottom: 8 }}>
              <span className="cat-ico" style={{ background: "var(--primary-soft)", color: "oklch(0.85 0.10 282)" }}>
                <Sparkles size={14} />
              </span>
              <span className="f-sm fw-500">Tip</span>
            </div>
            <div className="f-xs muted" style={{ lineHeight: 1.55 }}>
              Settings sync across devices. Sensitive changes ask for a passkey or your biometric.
            </div>
          </div>
        </div>

        {/* Right pane */}
        <div style={{ gridColumn: "span 9", display: "flex", flexDirection: "column", gap: 16 }}>

          {tab === "profile" && (
            <>
              <SCard title="Profile" sub="How you appear inside SolveYourMoney.">
                <div className="row gap-16" style={{ alignItems: "center", marginBottom: 18 }}>
                  <div
                    className="avatar"
                    style={{ width: 64, height: 64, fontSize: 20, borderRadius: 18, flexShrink: 0 }}
                  >
                    MA
                  </div>
                  <div>
                    <div className="f-sm fw-500">Profile photo</div>
                    <div className="f-xs muted">PNG or JPG, square, up to 2MB.</div>
                    <div className="row gap-8" style={{ marginTop: 10 }}>
                      <button className="btn sm">Upload</button>
                      <button className="btn sm ghost">Remove</button>
                    </div>
                  </div>
                </div>
                <div className="g-2">
                  <Field label="Full name"     value={name}          onChange={setName} />
                  <Field label="Display name"  value="Maya" />
                  <Field label="Email"         value={email ?? "maya@protonmail.com"} mono />
                  <Field label="Phone"         value="+1 (415) 555-0143"              mono />
                </div>
              </SCard>

              <SCard title="Identity" sub="Used for personalisation, never shared.">
                <div className="g-2">
                  <Field label="Time zone" value="America / Los Angeles" />
                  <Field label="Birthday"  value="1998-03-12"             mono />
                  <Field label="Pronouns"  value="she / her" />
                  <Field label="Headline"  value="Saving for Lisbon ✦" />
                </div>
              </SCard>
            </>
          )}

          {tab === "prefs" && (
            <>
              <SCard title="Money preferences" sub="Currency, week start, rounding.">
                <div className="g-2">
                  <Field label="Primary currency"   value="USD — US Dollar" mono />
                  <Field label="Secondary currency" value="EUR — Euro"      mono />
                  <Field label="Week starts on"     value="Monday" />
                  <Field label="Rounding"           value="Nearest dollar" />
                </div>
                <div className="divider" />
                <SwitchRow label="Show cents on dashboard"     sub="When off, balances round to the dollar."    value={true} />
                <SwitchRow label="Hide net worth on home screen" sub="Useful for shoulder-surfing safety."      value={false} />
              </SCard>

              <SCard title="Appearance" sub="Theme and motion.">
                <ThemePicker />
                <div className="divider" />
                <SwitchRow label="Reduce motion"  sub="Mute transitions and confetti."      value={false} />
                <SwitchRow label="Larger text"    sub="14px → 15.5px throughout the app."   value={false} />
              </SCard>

              <SCard title="Notifications" sub="What we ping you about — manage channels in Notifications.">
                <SwitchRow label="Daily check-in reminder" sub="7:30 PM, your time."                         value={true} />
                <SwitchRow label="Weekly money digest"     sub="Sundays, 9:00 AM."                           value={weeklyDigest} onChange={setWeeklyDigest} />
                <SwitchRow label="Bill due soon"           sub="48h before each due date."                   value={true} />
                <SwitchRow label="Unusual spending"        sub="Sends a heads-up, never a guilt trip."       value={true} />
                <SwitchRow label="Big wins"                sub="When you hit milestones."                    value={true} />
              </SCard>
            </>
          )}

          {tab === "accounts" && (
            <>
              <SCard
                title="Linked accounts"
                sub="6 connected · last sync 12 min ago"
                action={
                  <button className="btn primary sm">
                    <Plus size={12} /> Link new
                  </button>
                }
              >
                <AccountRow name="Chase Total Checking"  type="Checking"  last="•••• 2294" balance="$3,140.22"  tone="primary" sync="2 min ago" />
                <AccountRow name="Ally Online Savings"   type="Savings"   last="•••• 8081" balance="$4,184.28"  tone="success" sync="2 min ago" />
                <AccountRow name="Visa Platinum"         type="Credit"    last="•••• 4421" balance="−$3,210.00" tone="danger"  sync="5 min ago" />
                <AccountRow name="Care Credit"           type="Credit"    last="•••• 9102" balance="−$1,030.00" tone="warn"    sync="12 min ago" />
                <AccountRow name="Nelnet Student Loan"   type="Loan"      last="•••• 7715" balance="−$4,180.00" tone="primary" sync="1 day ago" />
                <AccountRow name="Robinhood"             type="Brokerage" last="•••• 5530" balance="$1,820.18"  tone="success" sync="2 hours ago" />
              </SCard>

              <SCard title="Import sources" sub="Files and statements you've imported.">
                {[
                  ["CSV uploads",       "3 files · 248 rows"],
                  ["PDF statements",    "5 files · auto-parsed"],
                  ["Apple Wallet pass", "Connected"],
                ].map(([label, val], i) => (
                  <div
                    key={label}
                    className="row between f-sm"
                    style={{ padding: "10px 0", borderTop: i > 0 ? "1px solid var(--line)" : undefined }}
                  >
                    <span>{label}</span>
                    <span className="mono muted">{val}</span>
                  </div>
                ))}
              </SCard>
            </>
          )}

          {tab === "security" && (
            <>
              <SCard title="Sign-in" sub="Keep your money behind a real lock.">
                <SwitchRow label="Two-factor authentication"    sub="Authenticator app · enabled May 4, 2026" value={twoFa}    onChange={setTwoFa} />
                <SwitchRow label="Biometric unlock on this device" sub="Face ID or fingerprint"               value={biometric} onChange={setBiometric} />
                <SwitchRow label="Auto-lock after 10 minutes"  sub="Locks the dashboard, keeps you signed in." value={true} />
                <div className="divider" />
                <div className="row between">
                  <div>
                    <div className="f-sm fw-500">Password</div>
                    <div className="f-xs muted">Last changed 3 months ago</div>
                  </div>
                  <button className="btn sm">Change password</button>
                </div>
              </SCard>

              <SCard title="Devices" sub="Where you're currently signed in.">
                <DeviceRow name="MacBook Pro · Safari"          location="San Francisco, CA" last="Right now"   current />
                <DeviceRow name="iPhone 15 · SolveYourMoney iOS" location="San Francisco, CA" last="2 hours ago" />
                <DeviceRow name="Chrome · Windows"             location="Oakland, CA"        last="3 days ago"  />
              </SCard>
            </>
          )}

          {tab === "plan" && (
            <>
              <SCard
                title="Your plan"
                sub="You're on Clarity Plus — unlocks Learn library, advanced simulator, and unlimited imports."
                action={
                  <span className="pill primary">
                    <span style={{ width: 6, height: 6, borderRadius: 9, background: "var(--primary-glow)", display: "inline-block" }} />Active
                  </span>
                }
              >
                <div className="row between" style={{ margin: "4px 0 14px" }}>
                  <div>
                    <div className="mono" style={{ fontSize: 28, letterSpacing: "-0.025em" }}>
                      $9.99<span className="muted" style={{ fontSize: 14 }}> / month</span>
                    </div>
                    <div className="f-xs muted">Renews June 4 on Visa •••• 4421</div>
                  </div>
                  <div className="row gap-8">
                    <button className="btn ghost">Switch to yearly · save 20%</button>
                    <button className="btn">Manage</button>
                  </div>
                </div>
                <div className="g-3" style={{ marginTop: 6 }}>
                  <PlanPerk label="Unlimited imports"    v="∞"  sub="CSV, PDF, OFX" />
                  <PlanPerk label="Learn modules"        v="44" sub="All levels" />
                  <PlanPerk label="Simulator scenarios"  v="∞"  sub="Stack as many as you want" />
                </div>
              </SCard>

              <SCard title="Invoices" sub="Past 6 months.">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Date</th><th>Description</th>
                      <th style={{ textAlign: "right" }}>Amount</th>
                      <th>Status</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <InvoiceRow d="May 04, 2026" desc="Clarity Plus · monthly" />
                    <InvoiceRow d="Apr 04, 2026" desc="Clarity Plus · monthly" />
                    <InvoiceRow d="Mar 04, 2026" desc="Clarity Plus · monthly" />
                    <InvoiceRow d="Feb 04, 2026" desc="Clarity Plus · monthly" />
                  </tbody>
                </table>
              </SCard>
            </>
          )}

          {tab === "danger" && (
            <>
              <SCard title="Your data" sub="You own everything. Export or delete any time.">
                {[
                  ["Export everything",  "CSV + JSON · transactions, budgets, goals, lessons", "Download .zip"],
                  ["Pause syncing",      "Stops new transactions; keeps the dashboard intact.", "Pause"],
                ].map(([label, helper, btn], i) => (
                  <div
                    key={label}
                    className="row between"
                    style={{ padding: "8px 0", borderTop: i > 0 ? "1px solid var(--line)" : undefined }}
                  >
                    <div>
                      <div className="f-sm fw-500">{label}</div>
                      <div className="f-xs muted">{helper}</div>
                    </div>
                    <button className="btn">{btn}</button>
                  </div>
                ))}
              </SCard>

              <div className="card" style={{
                boxShadow: "0 0 0 1px oklch(0.68 0.15 24 / 0.4), 0 1px 0 var(--inner-hl) inset",
                padding: 20,
              }}>
                <div className="card-head">
                  <div>
                    <div className="card-title" style={{ color: "oklch(0.84 0.10 24)" }}>Danger zone</div>
                    <div className="card-sub">These actions are slow on purpose.</div>
                  </div>
                </div>
                {[
                  ["Disconnect all linked accounts", "Keeps your data, severs the bank link.", "Disconnect", false],
                  ["Delete account", "Permanent · 30-day cooling-off period.", "Delete account", true],
                ].map(([label, helper, btn, red], i) => (
                  <div
                    key={label as string}
                    className="row between"
                    style={{ padding: "8px 0", borderTop: i > 0 ? "1px solid var(--line)" : undefined }}
                  >
                    <div>
                      <div className="f-sm fw-500">{label}</div>
                      <div className="f-xs muted">{helper}</div>
                    </div>
                    <button
                      className="btn"
                      style={red ? {
                        background: "oklch(0.68 0.15 24 / 0.18)",
                        color: "oklch(0.92 0.06 24)",
                        boxShadow: "0 0 0 1px oklch(0.68 0.15 24 / 0.5)",
                      } : {
                        boxShadow: "0 0 0 1px oklch(0.68 0.15 24 / 0.4)",
                        color: "oklch(0.84 0.10 24)",
                      }}
                    >
                      {btn}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
