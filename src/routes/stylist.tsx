import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { images, OCCASIONS } from "@/lib/styling-data";
import { stylistReply } from "@/lib/stylist-service";
import { Chip } from "@/components/style/controls";

export const Route = createFileRoute("/stylist")({
  head: () => ({
    meta: [
      { title: "AI Stylist — StyleMirror AI" },
      { name: "description", content: "Chat with an AI hair stylist that considers your photos, outfit, occasion and accessories." },
      { property: "og:title", content: "AI Stylist — StyleMirror AI" },
      { property: "og:description", content: "A conversational hair stylist for every ceremony." },
    ],
  }),
  component: Stylist,
});

type Msg = { role: "user" | "ai"; text: string; image?: string | undefined };
const PROMPTS = ["What suits a heavy lehenga?", "Ideas for Mehendi and Haldi", "Minimal accessories please", "Short hair options for men"];

function Stylist() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "Namaste! I'm your StyleMirror stylist. Share a photo, your outfit or the occasion and I'll suggest hairstyles and accessories." },
  ]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [ctx, setCtx] = useState<{ face: string | null; outfit: string | null; occasion: string[] }>({ face: images.lookWaves, outfit: images.lookBraid, occasion: ["Wedding"] });
  const end = useRef<HTMLDivElement>(null);
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), [msgs, typing]);

  const send = async (t: string, image?: string) => {
    if (!t.trim() && !image) return;
    const next = [...msgs, { role: "user" as const, text: t, image }];
    setMsgs(next); setText(""); setTyping(true);
    const r = await stylistReply(t, next.length);
    setTyping(false);
    setMsgs((m) => [...m, { role: "ai", text: r }]);
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[18rem_1fr]">
      <aside className="space-y-6 rounded-3xl bg-blush-gradient p-6 md:self-start">
        <div><p className="eyebrow">Styling context</p><h2 className="mt-1 text-3xl">What I know</h2></div>
        <div className="grid grid-cols-2 gap-3">
          {(["face", "outfit"] as const).map((k) => (
            <div key={k} className="space-y-1">
              {ctx[k] ? <img src={ctx[k]!} alt={k} className="aspect-square w-full rounded-2xl object-cover" /> : <div className="aspect-square rounded-2xl bg-card" />}
              <p className="text-xs capitalize text-muted-foreground">{k}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Occasion</p>
          <div className="flex flex-wrap gap-1.5">
            {OCCASIONS.slice(0, 8).map((o) => (
              <Chip key={o} active={ctx.occasion.includes(o)} onClick={() => setCtx({ ...ctx, occasion: ctx.occasion.includes(o) ? ctx.occasion.filter((x) => x !== o) : [...ctx.occasion, o] })}>{o}</Chip>
            ))}
          </div>
        </div>
      </aside>

      <section className="flex min-h-[70vh] flex-col rounded-3xl border border-border bg-card">
        <div className="flex-1 space-y-4 overflow-y-auto p-5 md:p-8">
          {msgs.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[85%] rounded-3xl px-5 py-3", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary")}>
                {m.role === "ai" && <Sparkles className="mb-1 h-4 w-4 text-rose" />}
                {m.image && <img src={m.image} alt="Shared" className="mb-2 max-h-48 rounded-2xl" />}
                <p className="leading-relaxed">{m.text}</p>
              </div>
            </div>
          ))}
          {typing && <div className="flex gap-1 px-2">{[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-rose" style={{ animationDelay: `${i * 120}ms` }} />)}</div>}
          <div ref={end} />
        </div>
        <div className="border-t border-border p-4">
          <div className="mb-3 flex gap-2 overflow-x-auto">
            {PROMPTS.map((p) => <button key={p} onClick={() => send(p)} className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs hover:border-rose">{p}</button>)}
          </div>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send(text); }}>
            <Button type="button" size="icon" variant="soft" aria-label="Attach photo" onClick={() => file.current?.click()}><ImagePlus /></Button>
            <input ref={file} type="file" accept="image/*" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0]; if (!f) return;
              const u = URL.createObjectURL(f); setCtx({ ...ctx, face: u }); send("Here's my photo — what would suit me?", u);
            }} />
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about hairstyles, accessories, outfits…" className="h-10 flex-1 rounded-full px-5" />
            <Button type="submit" size="icon" variant="rose" aria-label="Send"><Send /></Button>
          </form>
        </div>
      </section>
    </div>
  );
}
