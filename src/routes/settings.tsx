import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getToken, setToken } from "@/lib/api";
import { Check, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — NetShort" }] }),
});

function SettingsPage() {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(getToken());
  }, []);

  return (
    <AppShell>
      <header className="px-4 py-4">
        <h1 className="text-lg font-bold">Settings</h1>
      </header>
      <section className="px-4">
        <label className="mb-2 block text-sm font-medium">Your Token</label>
        <p className="mb-3 text-xs text-muted-foreground">
          Required to watch locked episodes. Get yours from the bot below.
        </p>
        <textarea
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
          rows={4}
          placeholder="Paste your token..."
          className="w-full resize-none rounded-xl border border-border bg-input p-3 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={() => {
            setToken(value.trim());
            setSaved(true);
          }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
        >
          {saved ? <><Check className="h-4 w-4" /> Saved</> : "Save Token"}
        </button>
        <a
          href="https://t.me/nanomilkisbot"
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-medium"
        >
          Get Token <ExternalLink className="h-4 w-4" />
        </a>
      </section>
    </AppShell>
  );
}
