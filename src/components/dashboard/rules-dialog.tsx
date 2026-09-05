"use client";

import { FormEvent, useState } from "react";
import type { Referral, RewardRules } from "@/lib/crak-api";
import { Dialog } from "./dialog";
import {
  emptyRow,
  NoRulesNotice,
  parseRulesJson,
  RulesEditor,
  RuleWarnings,
  rowsToRules,
  rulesPlaceholder,
  rulesToRows,
  type RuleRow,
} from "./rules-editor";

function messageFrom(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback;
}

export function RulesDialog({
  referral,
  currency,
  onClose,
  onSave,
}: {
  referral: Referral;
  currency: string;
  onClose: () => void;
  onSave: (rules: RewardRules, autoReward: boolean) => Promise<string[]>;
}) {
  const initial = rulesToRows(referral.reward_rules ?? {});
  const [rows, setRows] = useState<RuleRow[]>(initial.rows.length ? initial.rows : [emptyRow()]);
  // A rule these controls cannot represent opens in JSON rather than being
  // silently simplified into something that pays a different amount.
  const [jsonMode, setJsonMode] = useState(!initial.supported);
  const [json, setJson] = useState(JSON.stringify(referral.reward_rules ?? {}, null, 2));
  const [autoReward, setAutoReward] = useState(referral.auto_reward !== false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[] | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setWarnings(null);
    try {
      const rules = jsonMode ? parseRulesJson(json) : rowsToRules(rows);
      const result = await onSave(rules, autoReward);
      setWarnings(result);
      if (!result.length) onClose();
    } catch (cause) {
      setError(messageFrom(cause, "Unable to save these rules."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog title={`Rules for ${referral.name}`} onClose={onClose} wide>
      <p className="mt-3 text-sm leading-6 text-[#758179]">
        A price list for this campaign. Your app tells CRAK <b>what happened</b>; these
        rules decide <b>what it pays</b>. Change them any time — no code changes needed.
      </p>

      {!Object.keys(referral.reward_rules ?? {}).length && <NoRulesNotice />}

      <form onSubmit={submit}>
        {jsonMode ? (
          <>
            <label className="mt-5 block text-xs font-bold">
              Rules (JSON)
              <textarea
                value={json}
                onChange={(event) => setJson(event.target.value)}
                spellCheck={false}
                rows={14}
                className="mt-2 w-full rounded-lg border border-[#d9e1da] bg-white p-3 font-mono text-xs outline-none focus:border-[#087a4f]"
                placeholder={rulesPlaceholder}
              />
            </label>
            {!initial.supported && (
              <p className="mt-2 text-[11px] text-[#8a5b16]">
                These rules use a condition the simple editor cannot show, so they are
                shown as JSON to avoid changing what they pay.
              </p>
            )}
          </>
        ) : (
          <RulesEditor rows={rows} onChange={setRows} currency={currency} disabled={saving} />
        )}

        <label className="mt-5 flex items-start gap-3 rounded-xl bg-[#f7faf8] p-4 text-xs leading-5">
          <input
            type="checkbox"
            checked={!autoReward}
            onChange={(event) => setAutoReward(!event.target.checked)}
            className="mt-0.5 size-4"
          />
          <span>
            <b>Review each reward before paying.</b>
            <span className="mt-1 block text-[#758179]">
              Conversions wait for your approval instead of paying straight away. Useful
              for a new campaign, or after a run of suspicious activity.
            </span>
          </span>
        </label>

        {error && <p role="alert" className="mt-4 rounded-xl bg-[#fff0ed] px-4 py-3 text-sm font-semibold text-[#a53c2c]">{error}</p>}
        {warnings && <RuleWarnings warnings={warnings} />}

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn-primary" disabled={saving}>{saving ? "Saving…" : "Save rules"}</button>
          <button type="button" onClick={onClose} className="btn-secondary">{warnings?.length ? "Done" : "Cancel"}</button>
          <button
            type="button"
            onClick={() => {
              // Keep whatever is on screen when switching views.
              if (jsonMode) {
                try {
                  const parsed = rulesToRows(parseRulesJson(json));
                  setRows(parsed.rows.length ? parsed.rows : [emptyRow()]);
                  if (!parsed.supported) { setError("Those rules are too detailed for the simple editor."); return; }
                  setError(null);
                  setJsonMode(false);
                } catch (cause) { setError(messageFrom(cause, "Fix the JSON first.")); }
              } else {
                try {
                  setJson(JSON.stringify(rowsToRules(rows), null, 2));
                  setError(null);
                  setJsonMode(true);
                } catch (cause) { setError(messageFrom(cause, "Fix the rules first.")); }
              }
            }}
            className="btn-secondary ml-auto text-xs"
          >
            {jsonMode ? "Simple editor" : "Advanced (JSON)"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
