import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Referral, RewardRules } from "@/lib/crak-api";
import { RulesDialog } from "./rules-dialog";

function referral(rules: RewardRules = {}, overrides: Partial<Referral> = {}): Referral {
  return {
    id: "ref_1",
    business_id: "biz_1",
    code: "FRIENDS",
    name: "Refer a friend",
    description: null,
    status: "active",
    currency: "SLE",
    balance: { currency: "SLE", value: 200000, display: "SLE 2000.00" },
    default_reward_amount: null,
    reward_rules: rules,
    auto_reward: true,
    created_at: "2026-09-01T00:00:00Z",
    ...overrides,
  };
}

function setup(rules: RewardRules = {}, overrides: Partial<Referral> = {}) {
  const onSave = vi.fn<(rules: RewardRules, autoReward: boolean) => Promise<string[]>>(
    async () => [],
  );
  const onClose = vi.fn();
  render(
    <RulesDialog
      referral={referral(rules, overrides)}
      currency="SLE"
      onClose={onClose}
      onSave={onSave}
    />,
  );
  return { onSave, onClose, user: userEvent.setup() };
}

// The label changes to "Saving…" while a save is in flight, so match both.
const save = () => screen.getByRole("button", { name: /save rules|saving/i });

beforeEach(() => vi.clearAllMocks());

// ============================================================ opening state
describe("opening", () => {
  it("warns when a campaign has no rules, because it will pay nobody", () => {
    setup({});
    expect(screen.getByText(/nothing will be paid/i)).toBeInTheDocument();
  });

  it("does not nag when rules already exist", () => {
    setup({ signup: 5000 });
    expect(screen.queryByText(/nothing will be paid/i)).not.toBeInTheDocument();
  });

  it("loads existing rules into the editor", () => {
    setup({ signup: { pays: { fixed: 5000 } } });
    expect(screen.getByLabelText("Event name")).toHaveValue("signup");
    expect(screen.getByLabelText(/^Amount/)).toHaveValue(50);
  });

  it("starts with one empty row so there is something to type into", () => {
    setup({});
    expect(screen.getByLabelText("Event name")).toHaveValue("");
  });

  it("opens in JSON when a rule is too detailed for the simple controls", () => {
    // Drawing this with the simple controls would change what it pays.
    setup({
      order: {
        pays: { percent: 5 },
        when: { op: "and", all: [{ op: ">=", var: "amount", value: 1000 }] },
      },
    });
    expect(screen.getByLabelText(/Rules \(JSON\)/)).toBeInTheDocument();
    expect(screen.getByText(/cannot show/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Event name")).not.toBeInTheDocument();
  });
});

// ============================================================ saving
describe("saving", () => {
  it("sends what was typed, converted to minor units", async () => {
    const { onSave, user } = setup({});

    await user.type(screen.getByLabelText("Event name"), "signup");
    await user.type(screen.getByLabelText(/^Amount/), "50");
    await user.click(save());

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({ signup: { pays: { fixed: 5000 } } }, true),
    );
  });

  it("closes when the save came back clean", async () => {
    const { onClose, user } = setup({ signup: 5000 });
    await user.click(save());
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("stays open and shows the warnings when names do not line up", async () => {
    const { onSave, onClose, user } = setup({ signup: 5000 });
    onSave.mockResolvedValue([
      "rule 'first_order' has never matched a reported event",
      "event type 'frist_order' has been reported 12 time(s) but no rule prices it",
    ]);

    await user.click(save());

    // The warnings are the whole point - closing over them would hide the bug.
    expect(await screen.findByText(/check these names/i)).toBeInTheDocument();
    expect(screen.getByText(/frist_order/)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /^done$/i })).toBeInTheDocument();
  });

  it("shows the server's message and stays open when saving fails", async () => {
    const { onSave, onClose, user } = setup({ signup: 5000 });
    onSave.mockRejectedValue(new Error("rule 'signup': 'percent' must be between 0 and 100"));

    await user.click(save());

    expect(await screen.findByRole("alert")).toHaveTextContent(/between 0 and 100/);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("refuses to send input the editor knows is invalid", async () => {
    const { onSave, user } = setup({});

    await user.type(screen.getByLabelText("Event name"), "signup");
    // no amount typed
    await user.click(save());

    expect(await screen.findByRole("alert")).toHaveTextContent(/greater than zero/i);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("cannot be submitted twice while a save is in flight", async () => {
    const { onSave, user } = setup({ signup: 5000 });
    let release!: (value: string[]) => void;
    onSave.mockImplementation(() => new Promise((resolve) => (release = resolve)));

    await user.click(save());

    // Disabled and relabelled, so an impatient second click cannot double-post.
    expect(save()).toBeDisabled();
    expect(save()).toHaveTextContent(/saving/i);
    await user.click(save());
    expect(onSave).toHaveBeenCalledTimes(1);

    release([]);
    await waitFor(() => expect(save()).toBeEnabled());
  });
});

// ============================================================ approval toggle
describe("review before paying", () => {
  it("is off by default, so rewards pay straight away", async () => {
    const { onSave, user } = setup({ signup: 5000 });
    expect(screen.getByRole("checkbox")).not.toBeChecked();

    await user.click(save());
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.anything(), true));
  });

  it("sends auto_reward false when review is switched on", async () => {
    const { onSave, user } = setup({ signup: 5000 });

    await user.click(screen.getByRole("checkbox"));
    await user.click(save());

    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.anything(), false));
  });

  it("reflects a campaign that already requires approval", () => {
    setup({ signup: 5000 }, { auto_reward: false });
    expect(screen.getByRole("checkbox")).toBeChecked();
  });
});

// ============================================================ JSON escape hatch
describe("switching between the simple editor and JSON", () => {
  it("carries the typed rules into JSON", async () => {
    const { user } = setup({});

    await user.type(screen.getByLabelText("Event name"), "signup");
    await user.type(screen.getByLabelText(/^Amount/), "50");
    await user.click(screen.getByRole("button", { name: /advanced \(json\)/i }));

    expect(screen.getByLabelText(/Rules \(JSON\)/)).toHaveValue(
      JSON.stringify({ signup: { pays: { fixed: 5000 } } }, null, 2),
    );
  });

  it("carries edited JSON back into the simple editor", async () => {
    const { user } = setup({ signup: 5000 });

    await user.click(screen.getByRole("button", { name: /advanced \(json\)/i }));
    const box = screen.getByLabelText(/Rules \(JSON\)/);
    await user.clear(box);
    await user.click(box);
    await user.paste('{"order": 25000}');
    await user.click(screen.getByRole("button", { name: /simple editor/i }));

    expect(screen.getByLabelText("Event name")).toHaveValue("order");
    expect(screen.getByLabelText(/^Amount/)).toHaveValue(250);
  });

  it("will not leave JSON that does not parse", async () => {
    const { user } = setup({ signup: 5000 });

    await user.click(screen.getByRole("button", { name: /advanced \(json\)/i }));
    const box = screen.getByLabelText(/Rules \(JSON\)/);
    await user.clear(box);
    await user.click(box);
    await user.paste("{ broken");
    await user.click(screen.getByRole("button", { name: /simple editor/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/not valid JSON/i);
    expect(screen.getByLabelText(/Rules \(JSON\)/)).toBeInTheDocument();
  });

  it("will not simplify a rule the simple controls cannot express", async () => {
    const { user } = setup({ signup: 5000 });

    await user.click(screen.getByRole("button", { name: /advanced \(json\)/i }));
    const box = screen.getByLabelText(/Rules \(JSON\)/);
    await user.clear(box);
    await user.click(box);
    await user.paste('{"o": {"pays": {"fixed": 100}, "cap": {"per": "campaign", "amount": 500}}}');
    await user.click(screen.getByRole("button", { name: /simple editor/i }));

    // Silently dropping the campaign-wide cap would change what it pays.
    expect(await screen.findByRole("alert")).toHaveTextContent(/too detailed/i);
    expect(screen.getByLabelText(/Rules \(JSON\)/)).toBeInTheDocument();
  });

  it("saves what is in the JSON box when saved from JSON", async () => {
    const { onSave, user } = setup({ signup: 5000 });

    await user.click(screen.getByRole("button", { name: /advanced \(json\)/i }));
    const box = screen.getByLabelText(/Rules \(JSON\)/);
    await user.clear(box);
    await user.click(box);
    await user.paste('{"visit": 300}');
    await user.click(save());

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ visit: 300 }, true));
  });
});

// ============================================================ dismissing
describe("dismissing", () => {
  it("closes on Cancel without saving", async () => {
    const { onSave, onClose, user } = setup({ signup: 5000 });
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("closes from the dialog's own close control", async () => {
    const { onClose, user } = setup({ signup: 5000 });
    await user.click(screen.getByRole("button", { name: /close dialog/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("is announced as a modal dialog", () => {
    setup({ signup: 5000 });
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText(/Rules for Refer a friend/)).toBeInTheDocument();
  });
});
