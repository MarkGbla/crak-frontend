import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import type { RewardRules } from "@/lib/crak-api";
import {
  emptyRow,
  NoRulesNotice,
  parseRulesJson,
  RulesEditor,
  RuleWarnings,
  rowsToRules,
  rulesToRows,
  type RuleRow,
} from "./rules-editor";

const row = (patch: Partial<RuleRow> = {}): RuleRow => ({ ...emptyRow(), ...patch });

// ============================================================ conversion
describe("rowsToRules", () => {
  it("converts major units to the minor units the API stores", () => {
    // SLE 50.00 must reach the backend as 5000, never as 50.
    expect(rowsToRules([row({ event: "signup", amount: "50" })])).toEqual({
      signup: { pays: { fixed: 5000 } },
    });
  });

  // These specific values matter. In binary floating point 4.35 * 100 is
  // 434.99999999999994 and 1.15 * 100 is 114.99999999999999, so truncating
  // instead of rounding underpays by a cent. Values like 12.10 and 0.07 land
  // just ABOVE the integer and pass either way - they prove nothing.
  it.each([
    ["4.35", 435],
    ["1.15", 115],
    ["2.675", 268],
  ])("does not lose a cent converting %s to minor units", (typed, expected) => {
    expect(rowsToRules([row({ event: "a", amount: typed })])).toEqual({
      a: { pays: { fixed: expected } },
    });
  });

  it("rounds percentage ceilings and limits the same way", () => {
    expect(
      rowsToRules([row({ event: "o", mode: "percent", percent: "5", percentMax: "4.35" })]),
    ).toEqual({ o: { pays: { percent: 5, max: 435 } } });
    expect(
      rowsToRules([row({ event: "o", amount: "1", capKind: "amount", capValue: "4.35" })]),
    ).toEqual({
      o: { pays: { fixed: 100 }, cap: { per: "referrer", window: "month", amount: 435 } },
    });
  });

  it("builds a percentage rule with a ceiling and a threshold", () => {
    expect(
      rowsToRules([
        row({ event: "order", mode: "percent", percent: "5", percentMax: "500", minAmount: "100" }),
      ]),
    ).toEqual({
      order: {
        pays: { percent: 5, max: 50000 },
        when: { op: ">=", var: "amount", value: 10000 },
      },
    });
  });

  it("builds both kinds of per-referrer limit", () => {
    expect(
      rowsToRules([row({ event: "v", amount: "3", capKind: "count", capValue: "5", capWindow: "day" })]),
    ).toEqual({
      v: { pays: { fixed: 300 }, cap: { per: "referrer", window: "day", count: 5 } },
    });
    expect(
      rowsToRules([row({ event: "v", amount: "3", capKind: "amount", capValue: "2000" })]),
    ).toEqual({
      v: { pays: { fixed: 300 }, cap: { per: "referrer", window: "month", amount: 200000 } },
    });
  });

  it("omits optional parts rather than sending empty ones", () => {
    const rules = rowsToRules([row({ event: "signup", amount: "5" })]);
    expect(rules.signup).not.toHaveProperty("when");
    expect(rules.signup).not.toHaveProperty("cap");
  });

  it.each([
    [row({ event: "", amount: "5" }), /needs an event name/i],
    [row({ event: "a", amount: "0" }), /greater than zero/i],
    [row({ event: "a", amount: "-5" }), /greater than zero/i],
    [row({ event: "a", mode: "percent", percent: "0" }), /between 0 and 100/i],
    [row({ event: "a", mode: "percent", percent: "150" }), /between 0 and 100/i],
    [row({ event: "a", amount: "5", capKind: "count", capValue: "" }), /limit with no value/i],
  ])("refuses invalid input with a message a person can act on", (bad, expected) => {
    expect(() => rowsToRules([bad])).toThrow(expected);
  });

  it("refuses two rules for the same event", () => {
    expect(() =>
      rowsToRules([row({ event: "dup", amount: "1" }), row({ event: "dup", amount: "2" })]),
    ).toThrow(/listed twice/i);
  });

  it("trims whitespace from the event name", () => {
    expect(rowsToRules([row({ event: "  signup  ", amount: "5" })])).toHaveProperty("signup");
  });
});

describe("rulesToRows", () => {
  it("round-trips without drift", () => {
    const original: RewardRules = {
      signup: { pays: { fixed: 5000 } },
      order: {
        pays: { percent: 5, max: 50000 },
        when: { op: ">=", var: "amount", value: 10000 },
        cap: { per: "referrer", window: "week", count: 3 },
      },
    };
    const { rows, supported } = rulesToRows(original);
    expect(supported).toBe(true);
    expect(rowsToRules(rows)).toEqual(original);
  });

  it("reads the shorthand form the API also accepts", () => {
    const { rows, supported } = rulesToRows({ signup: 5000 });
    expect(supported).toBe(true);
    expect(rows[0]).toMatchObject({ event: "signup", mode: "fixed", amount: "50" });
  });

  it.each([
    ["a nested condition", { o: { pays: { fixed: 1 }, when: { op: "and", all: [] } } }],
    ["a metadata condition", { o: { pays: { fixed: 1 }, when: { op: "==", var: "metadata.x", value: 1 } } }],
    ["a campaign-wide cap", { o: { pays: { fixed: 1 }, cap: { per: "campaign", amount: 100 } } }],
    ["a percentage floor", { o: { pays: { percent: 5, min: 100 } } }],
  ])("reports %s as unsupported instead of silently dropping it", (_label, rules) => {
    // Simplifying a rule the editor cannot draw would change what it pays,
    // which is the worst possible outcome for a money form.
    expect(rulesToRows(rules as RewardRules).supported).toBe(false);
  });

  it("handles a campaign with no rules at all", () => {
    expect(rulesToRows({})).toEqual({ rows: [], supported: true });
  });
});

describe("parseRulesJson", () => {
  it("explains bad JSON in plain language", () => {
    expect(() => parseRulesJson("{ nope")).toThrow(/not valid JSON/i);
  });

  it("refuses an array or a bare value", () => {
    expect(() => parseRulesJson("[]")).toThrow(/must be an object/i);
    expect(() => parseRulesJson('"signup"')).toThrow(/must be an object/i);
  });

  it("accepts a valid rule set", () => {
    expect(parseRulesJson('{"signup": 5000}')).toEqual({ signup: 5000 });
  });
});

// ============================================================ the component
function Harness({ initial }: { initial?: RuleRow[] }) {
  const [rows, setRows] = useState<RuleRow[]>(initial ?? [emptyRow()]);
  return (
    <>
      <RulesEditor rows={rows} onChange={setRows} currency="SLE" />
      <output data-testid="json">{JSON.stringify(safe(rows))}</output>
    </>
  );
}
const safe = (rows: RuleRow[]) => {
  try {
    return rowsToRules(rows);
  } catch {
    return null;
  }
};

describe("<RulesEditor>", () => {
  it("turns what a person types into the rule the backend stores", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText("Event name"), "signup");
    await user.type(screen.getByLabelText(/^Amount/), "50");

    expect(JSON.parse(screen.getByTestId("json").textContent!)).toEqual({
      signup: { pays: { fixed: 5000 } },
    });
  });

  it("swaps the controls when paying a percentage", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    expect(screen.getByLabelText(/^Amount/)).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Payment type"), "percent");

    expect(screen.queryByLabelText(/^Amount/)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Percent of order/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Never more than/)).toBeInTheDocument();
  });

  it("only shows limit inputs once a limit is chosen", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    expect(screen.queryByLabelText(/How many/)).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Limit per referrer"), "count");
    expect(screen.getByLabelText(/How many/)).toBeInTheDocument();
    expect(screen.getByLabelText("Per")).toBeInTheDocument();
  });

  it("adds and removes rules", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText("Event name"), "signup");
    await user.click(screen.getByRole("button", { name: /add a rule/i }));
    expect(screen.getAllByLabelText("Event name")).toHaveLength(2);

    await user.type(screen.getAllByLabelText("Event name")[1], "order");
    await user.click(screen.getByRole("button", { name: /remove rule for signup/i }));

    const remaining = screen.getAllByLabelText("Event name");
    expect(remaining).toHaveLength(1);
    expect(remaining[0]).toHaveValue("order");
  });

  it("keeps each row's edits separate", async () => {
    const user = userEvent.setup();
    render(<Harness initial={[row({ event: "a", amount: "1" }), row({ event: "b", amount: "2" })]} />);

    await user.clear(screen.getAllByLabelText(/^Amount/)[0]);
    await user.type(screen.getAllByLabelText(/^Amount/)[0], "9");

    expect(JSON.parse(screen.getByTestId("json").textContent!)).toEqual({
      a: { pays: { fixed: 900 } },
      b: { pays: { fixed: 200 } },
    });
  });

  it("builds a full percentage rule end to end", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText("Event name"), "order");
    await user.selectOptions(screen.getByLabelText("Payment type"), "percent");
    await user.type(screen.getByLabelText(/Percent of order/), "5");
    await user.type(screen.getByLabelText(/Never more than/), "500");
    await user.type(screen.getByLabelText(/Only if order is at least/), "100");
    await user.selectOptions(screen.getByLabelText("Limit per referrer"), "count");
    await user.type(screen.getByLabelText(/How many/), "3");
    await user.selectOptions(screen.getByLabelText("Per"), "week");

    expect(JSON.parse(screen.getByTestId("json").textContent!)).toEqual({
      order: {
        pays: { percent: 5, max: 50000 },
        when: { op: ">=", var: "amount", value: 10000 },
        cap: { per: "referrer", window: "week", count: 3 },
      },
    });
  });

  it("labels every control for screen readers and keyboard users", () => {
    render(<Harness />);
    // Each control is reachable by an accessible name, not just by position.
    expect(screen.getByLabelText("Event name")).toBeInTheDocument();
    expect(screen.getByLabelText("Payment type")).toBeInTheDocument();
    expect(screen.getByLabelText("Limit per referrer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /remove rule/i })).toBeInTheDocument();
  });
});

describe("warnings", () => {
  it("shows nothing when the vocabularies agree", () => {
    const { container } = render(<RuleWarnings warnings={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("lists every mismatch the backend reported", () => {
    render(
      <RuleWarnings
        warnings={[
          "rule 'first_order' has never matched a reported event",
          "event type 'frist_order' has been reported 12 time(s) but no rule prices it",
        ]}
      />,
    );
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[1]).toHaveTextContent("frist_order");
  });

  it("tells someone with no rules why nothing will be paid", () => {
    render(<NoRulesNotice />);
    expect(screen.getByText(/nothing will be paid/i)).toBeInTheDocument();
  });
});
