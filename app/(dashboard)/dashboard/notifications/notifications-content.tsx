"use client";

import { useState } from "react";
import { Bell, Sparkles, CreditCard, Coins, Settings, Check } from "lucide-react";

type Kind = "bill" | "win" | "insight";
type Filter = "all" | "unread" | "win" | "bill" | "insight";

type Notif = {
  id: string;
  kind: Kind;
  title: string;
  body: string;
  day: string;
  time: string;
  read: boolean;
  accent: "primary" | "success" | "warn" | "danger";
  xp?: string;
};

const SEED: Notif[] = [
  { id: "n1", kind: "bill",    title: "Visa Platinum payment due in 5 days",         body: "Auto-pay is on. $215 will move from Chase Checking on May 18.",                           day: "Today",     time: "2:14 PM", read: false, accent: "danger" },
  { id: "n2", kind: "win",     title: "You hit this week's save goal — +40 XP",       body: "$140 landed in your Emergency Fund. Nice rhythm.",                                        day: "Today",     time: "9:02 AM", read: false, accent: "success", xp: "+40 XP" },
  { id: "n3", kind: "insight", title: "You're spending 19% over on Entertainment",    body: "Mostly streaming bumps. Want a 30-day pause on Spotify Premium?",                        day: "Today",     time: "8:30 AM", read: false, accent: "warn" },
  { id: "n4", kind: "win",     title: "Streak protected — day 12 in the books",       body: "Quick check-in counted. Tomorrow keeps you alive in this streak.",                        day: "Yesterday", time: "7:32 PM", read: true,  accent: "primary", xp: "+25 XP" },
  { id: "n5", kind: "insight", title: "Lisbon goal is ahead of schedule",             body: "At this pace you'll hit it 22 days early. Want to redirect $50/mo to your Emergency Fund?", day: "Yesterday", time: "6:00 PM", read: true,  accent: "primary" },
  { id: "n6", kind: "bill",    title: "Rent posted",                                  body: "$1,280 to Sunset Apts · cleared from Chase Checking.",                                    day: "Yesterday", time: "9:00 AM", read: true,  accent: "primary" },
  { id: "n7", kind: "win",     title: "Lesson complete — Snowball vs Avalanche",      body: "You picked Avalanche. We updated your debt plan to match.",                               day: "May 11",    time: "8:42 PM", read: true,  accent: "success", xp: "+80 XP" },
  { id: "n8", kind: "insight", title: "A subscription you might have missed",         body: "$11.99 to 'Calm' — first time in 3 months. Keep or cancel?",                            day: "May 11",    time: "2:21 PM", read: true,  accent: "warn" },
  { id: "n9", kind: "bill",    title: "Care Credit minimum due Jun 2",                body: "$45 · autopay scheduled.",                                                                day: "May 10",    time: "10:05 AM", read: true,  accent: "primary" },
];

const CHANNEL_ROWS = [
  { name: "Bill due",          on: ["push", "email"] },
  { name: "Auto-payment",      on: ["push"] },
  { name: "Big win / XP",      on: ["push"] },
  { name: "Streak danger",     on: ["push"] },
  { name: "Spending insight",  on: ["email"] },
  { name: "Weekly digest",     on: ["email"] },
  { name: "Security alerts",   on: ["push", "email", "sms"] },
];

const CHANNEL_COLS = [
  { id: "push",  label: "Push" },
  { id: "email", label: "Email" },
  { id: "sms",   label: "SMS" },
];

const KIND_ICON: Record<Kind, React.FC<{ size?: number }>> = {
  bill:    CreditCard,
  win:     Sparkles,
  insight: Coins,
};

const ACCENT_COLOR: Record<string, string> = {
  success: "var(--success)",
  warn:    "var(--warn)",
  danger:  "var(--danger)",
  primary: "var(--primary-glow)",
};
const ACCENT_SOFT: Record<string, string> = {
  success: "var(--success-soft)",
  warn:    "var(--warn-soft)",
  danger:  "var(--danger-soft)",
  primary: "var(--primary-soft)",
};

function NotifRow({
  n,
  onToggle,
}: {
  n: Notif;
  onToggle: () => void;
}) {
  const Icon = KIND_ICON[n.kind];
  const color = ACCENT_COLOR[n.accent];
  const soft  = ACCENT_SOFT[n.accent];
  return (
    <div
      className="row"
      style={{
        padding: "14px 18px",
        gap: 14,
        borderTop: "1px solid var(--line)",
        background: n.read ? "transparent" : "oklch(0.66 0.18 282 / 0.03)",
        position: "relative",
        cursor: "pointer",
      }}
      onClick={onToggle}
    >
      {!n.read && (
        <span style={{
          position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
          width: 6, height: 6, borderRadius: 9, background: "var(--primary-glow)",
          boxShadow: "0 0 6px var(--primary-glow)",
        }} />
      )}
      <span style={{
        width: 32, height: 32, flexShrink: 0, borderRadius: 9,
        background: soft, color,
        display: "grid", placeItems: "center",
      }}>
        <Icon size={15} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row between" style={{ gap: 12 }}>
          <span className="f-sm" style={{ fontWeight: n.read ? 460 : 520, color: "var(--fg)" }}>{n.title}</span>
          <span className="mono muted f-xs" style={{ flexShrink: 0 }}>{n.time}</span>
        </div>
        <div className="f-xs muted" style={{ marginTop: 3, lineHeight: 1.5 }}>{n.body}</div>
        {n.xp && (
          <span className="mono f-xs" style={{ color: "var(--xp)", marginTop: 6, display: "inline-block" }}>{n.xp}</span>
        )}
      </div>
    </div>
  );
}

function ChannelMatrix() {
  return (
    <div>
      <div className="row" style={{ padding: "6px 0", fontSize: 11, color: "var(--fg-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        <span style={{ flex: 1 }} />
        {CHANNEL_COLS.map((c) => (
          <span key={c.id} style={{ width: 48, textAlign: "center" }}>{c.label}</span>
        ))}
      </div>
      {CHANNEL_ROWS.map((r) => (
        <div key={r.name} className="row" style={{ padding: "10px 0", borderTop: "1px solid var(--line)" }}>
          <span className="f-sm" style={{ flex: 1 }}>{r.name}</span>
          {CHANNEL_COLS.map((c) => {
            const on = r.on.includes(c.id);
            return (
              <span key={c.id} style={{ width: 48, display: "grid", placeItems: "center" }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 5,
                  background: on ? "oklch(0.66 0.18 282 / 0.6)" : "oklch(1 0 0 / 0.04)",
                  boxShadow: on ? "0 0 0 1px oklch(0.7 0.18 282)" : "0 0 0 1px var(--line)",
                  display: "grid", placeItems: "center", color: "oklch(0.98 0 0)",
                }}>
                  {on && <Check size={11} />}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function QuietBand({ from, to }: { from: number; to: number }) {
  const r = 56, cx = 80, cy = 80;

  const ticks = Array.from({ length: 24 }, (_, h) => {
    const a = (h / 24) * Math.PI * 2 - Math.PI / 2;
    return {
      h,
      x1: cx + (r - 4) * Math.cos(a),
      y1: cy + (r - 4) * Math.sin(a),
      x2: cx + (r + 4) * Math.cos(a),
      y2: cy + (r + 4) * Math.sin(a),
    };
  });

  function arcPath(start: number, end: number) {
    const a1 = (start / 24) * Math.PI * 2 - Math.PI / 2;
    const a2 = (end   / 24) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const span = end > start ? end - start : (24 - start) + end;
    const large = span > 12 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  }

  return (
    <div style={{ display: "grid", placeItems: "center", padding: "4px 0" }}>
      <svg viewBox="0 0 160 160" style={{ width: 170, height: 170 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="oklch(1 0 0 / 0.06)" strokeWidth="8" />
        <path d={arcPath(from, to)} stroke="oklch(0.66 0.18 282)" strokeWidth="8" fill="none" strokeLinecap="round" />
        {ticks.map((s) => (
          <line
            key={s.h}
            x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
            stroke={s.h % 6 === 0 ? "oklch(1 0 0 / 0.4)" : "oklch(1 0 0 / 0.12)"}
            strokeWidth={s.h % 6 === 0 ? 1.5 : 1}
          />
        ))}
        <text x={cx} y={cy - 4}  textAnchor="middle" fontSize="10" fill="oklch(0.62 0.012 280)">Quiet</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontFamily="Geist Mono, monospace" fontSize="16" letterSpacing="-0.03em" fill="oklch(0.97 0 0)">9 hrs</text>
        <text x={cx} y={18}      textAnchor="middle" fontSize="9" fontFamily="Geist Mono, monospace" fill="oklch(0.62 0.012 280)">0</text>
        <text x={cx} y={154}     textAnchor="middle" fontSize="9" fontFamily="Geist Mono, monospace" fill="oklch(0.62 0.012 280)">12</text>
        <text x={154} y={cy + 3} textAnchor="end"    fontSize="9" fontFamily="Geist Mono, monospace" fill="oklch(0.62 0.012 280)">6</text>
        <text x={6}   y={cy + 3} fontSize="9"        fontFamily="Geist Mono, monospace" fill="oklch(0.62 0.012 280)">18</text>
      </svg>
    </div>
  );
}

export function NotificationsContent() {
  const [filter, setFilter]  = useState<Filter>("all");
  const [items,  setItems]   = useState<Notif[]>(SEED);
  const [digest, setDigest]  = useState<"off" | "daily" | "weekly" | "monthly">("weekly");

  const counts = {
    all:     items.length,
    unread:  items.filter((i) => !i.read).length,
    wins:    items.filter((i) => i.kind === "win").length,
    bills:   items.filter((i) => i.kind === "bill").length,
    insight: items.filter((i) => i.kind === "insight").length,
  };

  const filtered =
    filter === "all"    ? items :
    filter === "unread" ? items.filter((i) => !i.read) :
    items.filter((i) => i.kind === filter);

  const groups: Record<string, Notif[]> = {};
  filtered.forEach((n) => { (groups[n.day] ??= []).push(n); });

  function markAll() { setItems(items.map((i) => ({ ...i, read: true }))); }
  function toggleRead(id: string) { setItems(items.map((i) => i.id === id ? { ...i, read: !i.read } : i)); }

  const FILTERS: { id: Filter; label: string; count: number }[] = [
    { id: "all",     label: "All",      count: counts.all },
    { id: "unread",  label: "Unread",   count: counts.unread },
    { id: "win",     label: "Wins",     count: counts.wins },
    { id: "bill",    label: "Bills",    count: counts.bills },
    { id: "insight", label: "Insights", count: counts.insight },
  ];

  return (
    <>
      <div className="page-hd">
        <div>
          <h1>Notifications</h1>
          <div className="sub">A quiet inbox. We only ping when it matters.</div>
        </div>
        <div className="row gap-8">
          <button className="btn ghost" onClick={markAll}>Mark all read</button>
          <button className="btn"><Settings size={13} /> Preferences</button>
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="metric accent">
          <div className="lbl"><span className="ico"><Bell size={13} /></span>Unread</div>
          <div className="val">{counts.unread}</div>
          <span className="delta neut">3 from this week</span>
        </div>
        <div className="metric">
          <div className="lbl"><span className="ico"><Sparkles size={13} /></span>Big wins</div>
          <div className="val">{counts.wins}</div>
          <span className="delta up">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 14l5-5 5 5"/></svg>
            +225 XP this week
          </span>
        </div>
        <div className="metric">
          <div className="lbl"><span className="ico"><CreditCard size={13} /></span>Bills upcoming</div>
          <div className="val">3</div>
          <span className="delta neut">Next in 5 days</span>
        </div>
        <div className="metric">
          <div className="lbl"><span className="ico"><Coins size={13} /></span>Insights</div>
          <div className="val">{counts.insight}</div>
          <span className="delta neut">Personalised this month</span>
        </div>
      </div>

      <div className="g-12" style={{ marginTop: 16 }}>
        {/* Inbox */}
        <div style={{ gridColumn: "span 8" }}>
          <div className="row between" style={{ margin: "4px 4px 12px" }}>
            <div className="seg">
              {FILTERS.map(({ id, label, count }) => (
                <button
                  key={id}
                  className={filter === id ? "on" : ""}
                  onClick={() => setFilter(id)}
                >
                  {label}{" "}
                  <span className="mono" style={{ color: "var(--fg-dim)", marginLeft: 4, fontSize: 11 }}>{count}</span>
                </button>
              ))}
            </div>
            <span className="muted f-xs">Sorted by newest</span>
          </div>

          <div className="card flat" style={{ padding: 0 }}>
            {Object.keys(groups).length === 0 ? (
              <div style={{ padding: "56px 20px", textAlign: "center", color: "var(--fg-mute)" }}>
                Nothing here. Quietest inbox in fintech.
              </div>
            ) : (
              Object.entries(groups).map(([day, list], gi) => (
                <div key={day}>
                  <div style={{
                    padding: "10px 18px 6px",
                    fontSize: 11, color: "var(--fg-dim)", textTransform: "uppercase", letterSpacing: "0.08em",
                    borderTop: gi === 0 ? undefined : "1px solid var(--line)",
                  }}>
                    {day}
                  </div>
                  {list.map((n, idx) => (
                    <NotifRow
                      key={n.id}
                      n={n}
                      onToggle={() => toggleRead(n.id)}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ gridColumn: "span 4", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Channels */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">Channels</div>
              <span className="muted f-xs">Per category</span>
            </div>
            <ChannelMatrix />
          </div>

          {/* Quiet hours */}
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Quiet hours</div>
                <div className="card-sub">No pings while you sleep.</div>
              </div>
              <span className="pill primary">On</span>
            </div>
            <QuietBand from={22} to={7} />
            <div className="row between mt-12">
              <div>
                <div className="muted f-xs">Start</div>
                <div className="mono f-sm">10:00 PM</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="muted f-xs">End</div>
                <div className="mono f-sm">7:00 AM</div>
              </div>
            </div>
            <div className="divider" />
            <div className="f-xs muted">Bill-due alerts still come through. Everything else waits.</div>
          </div>

          {/* Digest cadence */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">Digest cadence</div>
            </div>
            <div className="seg" style={{ width: "100%" }}>
              {(["off", "daily", "weekly", "monthly"] as const).map((v) => (
                <button
                  key={v}
                  style={{ flex: 1 }}
                  className={digest === v ? "on" : ""}
                  onClick={() => setDigest(v)}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
            <div className="f-xs muted mt-12" style={{ marginTop: 10 }}>
              Next digest <span className="mono soft">Sunday 9:00 AM</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
