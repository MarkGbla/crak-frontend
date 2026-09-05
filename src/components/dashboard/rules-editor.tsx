"use client";

import { AlertTriangle, Info, Plus, Trash2 } from "lucide-react";
import type { RewardRule, RewardRules, RuleCap, RuleCondition } from "@/lib/crak-api";

/**
 * Editing reward rules.
 *
 * A campaign's rules are a price list: an event name your customer's app sends,
 * and what it pays. Most real rules are one of a handful of shapes, so those get
 * proper controls; anything more elaborate falls back to JSON rather than being
 * silently mangled by an editor that cannot express it.
 */

const fieldClass =
  "mt-2 h-11 w-full rounded-lg border border-[#d9e1da] bg-white px-3 text-sm outline-none focus:border-[#087a4f]";
const smallField =
  "h-10 rounded-lg border border-[#d9e1da] bg-white px-3 text-sm outline-none focus:border-[#087a4f]";

export type RuleRow = {
  key: string;
  event: string;
  mode: "fixed" | "percent";
  /** Major units, as typed. Converted to minor units on save. */
  amount: string;
  percent: string;
  percentMax: string;
  /** Optional "only when the order is at least this much", in major units. */
  minAmount: string;
  capKind: "none" | "count" | "amount";
  capValue: string;
  capWindow: NonNullable<RuleCap["window"]>;
};

let rowSeq = 0;
export function emptyRow(): RuleRow {
  rowSeq += 1;
  return {
    key: `row-${rowSeq}`,
    event: "",
    mode: "fixed",
    amount: "",
    percent: "",
    percentMax: "",
    minAmount: "",
    capKind: "none",
    capValue: "",
    capWindow: "month",
  };
}

const toMinor = (value: string) => Math.round(Number(value) * 100);
const toMajor = (value: number) => (value / 100).toString();

/** Rows -> the shape the API stores. Throws with a readable message if invalid. */
export function rowsToRules(rows: RuleRow[]): RewardRules {
  const rules: RewardRules = {};

  for (const row of rows) {
    const event = row.event.trim();
    if (!event) throw new Error("Every rule needs an event name.");
    if (rules[event]) throw new Error(`"${event}" is listed twice. Each event needs one rule.`);

    let pays: { fixed: number } | { percent: number; max?: number };
    if (row.mode === "fixed") {
      const amount = toMinor(row.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error(`"${event}" needs an amount greater than zero.`);
      }
      pays = { fixed: amount };
    } else {
      const percent = Number(row.percent);
      if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
        throw new Error(`"${event}" needs a percentage between 0 and 100.`);
      }
      pays = { percent };
      if (row.percentMax.trim()) pays.max = toMinor(row.percentMax);
    }

    const rule: Exclude<RewardRule, number> = { pays };

    if (row.minAmount.trim()) {
      rule.when = { op: ">=", var: "amount", value: toMinor(row.minAmount) };
    }

    if (row.capKind !== "none") {
      const capValue = Number(row.capValue);
      if (!Number.isFinite(capValue) || capValue <= 0) {
        throw new Error(`"${event}" has a limit with no value.`);
      }
      const cap: RuleCap = { per: "referrer", window: row.capWindow };
      if (row.capKind === "count") cap.count = Math.round(capValue);
      else cap.amount = toMinor(row.capValue);
      rule.cap = cap;
    }

    rules[event] = rule;
  }

  return rules;
}

/**
 * The API shape -> rows. `supported` is false when a rule uses something these
 * controls cannot represent (nested and/or, metadata conditions, campaign-wide
 * caps) - the caller then shows JSON instead of quietly dropping it.
 */
export function rulesToRows(rules: RewardRules): { rows: RuleRow[]; supported: boolean } {
  const rows: RuleRow[] = [];
  let supported = true;

  for (const [event, rule] of Object.entries(rules ?? {})) {
    const row = { ...emptyRow(), event };

    if (typeof rule === "number") {
      row.mode = "fixed";
      row.amount = toMajor(rule);
      rows.push(row);
      continue;
    }

    if ("fixed" in rule.pays) {
      row.mode = "fixed";
      row.amount = toMajor(rule.pays.fixed);
    } else {
      row.mode = "percent";
      row.percent = String(rule.pays.percent);
      if (rule.pays.max !== undefined) row.percentMax = toMajor(rule.pays.max);
      if (rule.pays.min !== undefined) supported = false;
    }

    if (rule.when) {
      const when = rule.when as RuleCondition;
      const simple =
        "op" in when && when.op === ">=" && "var" in when && when.var === "amount";
      if (simple && typeof (when as { value: unknown }).value === "number") {
        row.minAmount = toMajor((when as { value: number }).value);
      } else {
        supported = false;
      }
    }

    if (rule.cap) {
      if (rule.cap.per === "campaign") supported = false;
      row.capWindow = rule.cap.window ?? "month";
      if (rule.cap.count !== undefined) {
        row.capKind = "count";
        row.capValue = String(rule.cap.count);
      } else if (rule.cap.amount !== undefined) {
        row.capKind = "amount";
        row.capValue = toMajor(rule.cap.amount);
      }
      if (rule.cap.count !== undefined && rule.cap.amount !== undefined) supported = false;
    }

    rows.push(row);
  }

  return { rows, supported };
}

export function RulesEditor({
  rows,
  onChange,
  currency,
  disabled,
}: {
  rows: RuleRow[];
  onChange: (rows: RuleRow[]) => void;
  currency: string;
  disabled?: boolean;
}) {
  const update = (key: string, patch: Partial<RuleRow>) =>
    onChange(rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  return (
    <div className="mt-5 flex flex-col gap-3">
      {rows.map((row) => (
        <div key={row.key} className="rounded-xl border border-[#e3e9e4] bg-[#fafbfa] p-4">
          <div className="flex items-end gap-3">
            <label className="min-w-0 flex-1 text-xs font-bold">
              When this happens
              <input
                value={row.event}
                onChange={(event) => update(row.key, { event: event.target.value })}
                placeholder="signup"
                aria-label="Event name"
                disabled={disabled}
                maxLength={64}
                className={`${fieldClass} font-mono`}
              />
            </label>
            <button
              type="button"
              onClick={() => onChange(rows.filter((entry) => entry.key !== row.key))}
              disabled={disabled}
              aria-label={`Remove rule for ${row.event || "new event"}`}
              className="mb-px grid size-11 shrink-0 place-items-center rounded-lg bg-[#f1f4f1] text-[#7b867e] hover:text-[#a53c2c] disabled:opacity-50"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <p className="mt-1 text-[11px] text-[#8b958d]">
            The exact word your app sends. It must match, character for character.
          </p>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="text-xs font-bold">
              Pay
              <select
                value={row.mode}
                onChange={(event) =>
                  update(row.key, { mode: event.target.value as RuleRow["mode"] })
                }
                disabled={disabled}
                aria-label="Payment type"
                className={`${smallField} mt-2 block`}
              >
                <option value="fixed">A fixed amount</option>
                <option value="percent">A percentage</option>
              </select>
            </label>

            {row.mode === "fixed" ? (
              <label className="text-xs font-bold">
                Amount ({currency})
                <input
                  value={row.amount}
                  onChange={(event) => update(row.key, { amount: event.target.value })}
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="50.00"
                  disabled={disabled}
                  className={`${smallField} mt-2 block w-32`}
                />
              </label>
            ) : (
              <>
                <label className="text-xs font-bold">
                  Percent of order
                  <input
                    value={row.percent}
                    onChange={(event) => update(row.key, { percent: event.target.value })}
                    type="number"
                    min="0.1"
                    max="100"
                    step="0.1"
                    placeholder="5"
                    disabled={disabled}
                    className={`${smallField} mt-2 block w-28`}
                  />
                </label>
                <label className="text-xs font-bold">
                  Never more than ({currency})
                  <input
                    value={row.percentMax}
                    onChange={(event) => update(row.key, { percentMax: event.target.value })}
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="optional"
                    disabled={disabled}
                    className={`${smallField} mt-2 block w-36`}
                  />
                </label>
              </>
            )}

            <label className="text-xs font-bold">
              Only if order is at least ({currency})
              <input
                value={row.minAmount}
                onChange={(event) => update(row.key, { minAmount: event.target.value })}
                type="number"
                min="0.01"
                step="0.01"
                placeholder="optional"
                disabled={disabled}
                className={`${smallField} mt-2 block w-40`}
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-[#e9eeea] pt-4">
            <label className="text-xs font-bold">
              Limit per referrer
              <select
                value={row.capKind}
                onChange={(event) =>
                  update(row.key, { capKind: event.target.value as RuleRow["capKind"] })
                }
                disabled={disabled}
                className={`${smallField} mt-2 block`}
              >
                <option value="none">No limit</option>
                <option value="count">Number of rewards</option>
                <option value="amount">Total paid</option>
              </select>
            </label>

            {row.capKind !== "none" && (
              <>
                <label className="text-xs font-bold">
                  {row.capKind === "count" ? "How many" : `How much (${currency})`}
                  <input
                    value={row.capValue}
                    onChange={(event) => update(row.key, { capValue: event.target.value })}
                    type="number"
                    min={row.capKind === "count" ? "1" : "0.01"}
                    step={row.capKind === "count" ? "1" : "0.01"}
                    disabled={disabled}
                    className={`${smallField} mt-2 block w-32`}
                  />
                </label>
                <label className="text-xs font-bold">
                  Per
                  <select
                    value={row.capWindow}
                    onChange={(event) =>
                      update(row.key, { capWindow: event.target.value as RuleRow["capWindow"] })
                    }
                    disabled={disabled}
                    className={`${smallField} mt-2 block`}
                  >
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="all">All time</option>
                  </select>
                </label>
              </>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...rows, emptyRow()])}
        disabled={disabled}
        className="btn-secondary self-start"
      >
        <Plus size={15} /> Add a rule
      </button>
    </div>
  );
}

/** Shown after saving: names in the rules and names in the events disagree. */
export function RuleWarnings({ warnings }: { warnings: string[] }) {
  if (!warnings.length) return null;
  return (
    <div className="mt-5 rounded-xl border border-[#f0dfc3] bg-[#fdf6ea] p-4">
      <p className="flex items-center gap-2 text-xs font-bold text-[#8a5b16]">
        <AlertTriangle size={14} /> Check these names
      </p>
      <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-xs leading-5 text-[#7c6338]">
        {warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-[#95805a]">
        A rule only pays when its name matches the word your app sends, exactly.
      </p>
    </div>
  );
}

export function NoRulesNotice() {
  return (
    <p className="mt-4 flex items-start gap-2 rounded-xl bg-[#fdf6ea] px-4 py-3 text-xs leading-5 text-[#7c6338]">
      <Info size={14} className="mt-px shrink-0" />
      <span>
        This campaign has no rules, so nothing will be paid. Add at least one rule
        below, then agree the exact event name with whoever integrates your app.
      </span>
    </p>
  );
}

/** Parse the JSON escape hatch, with errors a human can act on. */
export function parseRulesJson(text: string): RewardRules {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return (() => {
      throw new Error("That is not valid JSON. Check for a missing comma or quote.");
    })();
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error('Rules must be an object, like {"signup": 5000}.');
  }
  return parsed as RewardRules;
}

export const rulesPlaceholder = `{
  "signup": 5000,
  "order": {
    "pays": { "percent": 5, "max": 50000 },
    "when": { "op": ">=", "var": "amount", "value": 10000 }
  }
}`;
