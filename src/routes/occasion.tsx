import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { images, OCCASIONS, PREFS, type Look, type PrefKey } from "@/lib/styling-data";
import { recommendHairstyles } from "@/lib/stylist-service";
import { saveLook } from "@/lib/saved-looks";
import { Analyzing, BeforeAfter, ChipGroup, ImageUpload } from "@/components/style/controls";
import { AccessoryPanel, AccessorizedPreview, accessoryLabels, emptyAccessories, type AccessoryState } from "@/components/style/AccessoryPanel";

export const Route = createFileRoute("/occasion")({
  validateSearch: (s: Record<string, unknown>): { sample?: boolean | undefined } => ({
    sample: s["sample"] === true || s["sample"] === "true" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Occasion Stylist — StyleMirror AI" },
      { name: "description", content: "Guided bridal and occasion hairstyle recommendations based on your face, outfit and ceremony." },
      { property: "og:title", content: "Occasion Stylist — StyleMirror AI" },
      { property: "og:description", content: "Upload your face and outfit, pick your occasions, and preview your hairstyle." },
    ],
  }),
  component: OccasionStylist,
});

const STEPS = ["Face", "Outfit", "Occasion", "Hairstyle", "Accessories", "Instructions", "Recommendations", "Previews", "Accessorise", "Compare & save"];
type Prefs = Record<PrefKey, string[]>;

function OccasionStylist() {
  const { sample } = Route.useSearch();
  const [step, setStep] = useState(0);
  const [face, setFace] = useState<string | null>(null);
  const [outfit, setOutfit] = useState<string | null>(null);
  const [occasions, setOccasions] = useState<string[]>([]);
  const [occasionOther, setOccasionOther] = useState("");
  const [prefs, setPrefs] = useState<Prefs>({ aesthetic: [], arrangement: [], length: [], texture: [] });
  const [prefOther, setPrefOther] = useState<Record<PrefKey, string>>({ aesthetic: "", arrangement: "", length: "", texture: "" });
  const [accPrefs, setAccPrefs] = useState<AccessoryState>(emptyAccessories);
  const [instructions, setInstructions] = useState("");
  const [looks, setLooks] = useState<Look[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [accByLook, setAccByLook] = useState<Record<string, AccessoryState>>({});
  const [activeLook, setActiveLook] = useState<string | null>(null);

  useEffect(() => {
    if (sample) {
      setFace(images.lookWaves); setOutfit(images.lookBraid);
      setOccasions(["Wedding", "Reception"]);
      setPrefs({ aesthetic: ["Traditional", "Elegant"], arrangement: ["Bun", "Braid"], length: ["Long"], texture: ["Wavy"] });
      setAccPrefs({ ...emptyAccessories, types: ["floral", "kundan"] });
    }
  }, [sample]);

  useEffect(() => {
    if (step === 6 && !looks) {
      recommendHairstyles({ faceImage: face, outfitImage: outfit, occasions, prefs, accessories: accPrefs.types, instructions }).then((r) => {
        setLooks(r); setSelected(r.slice(0, 2).map((l) => l.id));
      });
    }
  }, [step, looks]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  const chosen = (looks ?? []).filter((l) => selected.includes(l.id));
  const current = chosen.find((l) => l.id === activeLook) ?? chosen[0];
  const accFor = (id: string) => accByLook[id] ?? accPrefs;

  const canContinue = [
    !!face, !!outfit, occasions.length > 0 && (!occasions.includes("Other") || occasionOther.trim().length > 0),
    true, true, true, !!looks && selected.length > 0, true, true, true,
  ][step];

  const occasionList = occasions.map((o) => (o === "Other" ? occasionOther : o));

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-10">
        <div className="flex items-baseline justify-between gap-4">
          <p className="eyebrow">Occasion Stylist · Step {step + 1} of {STEPS.length}</p>
          <p className="hidden text-sm text-muted-foreground sm:block">{STEPS[step]}</p>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="mt-3 h-1 bg-muted [&>div]:bg-rose" />
        <div className="mt-4 hidden gap-1 md:flex">
          {STEPS.map((s, i) => (
            <button key={s} disabled={i > step} onClick={() => setStep(i)}
              className={cn("flex-1 truncate rounded-full px-2 py-1 text-[11px] transition", i === step ? "bg-secondary text-secondary-foreground" : i < step ? "text-foreground hover:bg-muted" : "text-muted-foreground/60")}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[28rem] animate-in fade-in" key={step}>
        {step === 0 && (
          <Split title="Begin with your face" body="A clear, front-facing photo in natural light helps us read face shape, hairline and current length.">
            <ImageUpload label="Face photograph" hint="Front-facing, hair visible" value={face} onChange={setFace} sample={images.lookWaves} />
          </Split>
        )}
        {step === 1 && (
          <Split title="Now, your outfit" body="Your lehenga, saree or gown guides neckline, colour and how much the hairstyle should carry.">
            <ImageUpload label="Outfit photograph" hint="Full outfit, including neckline" value={outfit} onChange={setOutfit} sample={images.lookBraid} />
          </Split>
        )}
        {step === 2 && (
          <Section title="Which occasions are you styling for?" body="Select every ceremony — we'll tailor looks for each.">
            <ChipGroup options={OCCASIONS} value={occasions} onChange={setOccasions} other={occasionOther} onOther={setOccasionOther} label="Occasions" />
          </Section>
        )}
        {step === 3 && (
          <Section title="Your hairstyle preferences" body="Leave anything blank and our stylist will decide.">
            <div className="grid gap-10 md:grid-cols-2">
              {(Object.keys(PREFS) as PrefKey[]).map((k) => (
                <ChipGroup key={k} label={PREFS[k].label} multi={PREFS[k].multi} options={PREFS[k].options}
                  value={prefs[k]} onChange={(v) => setPrefs({ ...prefs, [k]: v })}
                  other={prefOther[k]} onOther={(v) => setPrefOther({ ...prefOther, [k]: v })} />
              ))}
            </div>
          </Section>
        )}
        {step === 4 && (
          <Section title="Accessory preferences" body="Set a starting point — you can experiment per look later.">
            <AccessoryPanel value={accPrefs} onChange={setAccPrefs} />
          </Section>
        )}
        {step === 5 && (
          <Section title="Anything else your stylist should know?" body="Hair concerns, family traditions, dupatta placement, comfort needs…">
            <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={6}
              placeholder="e.g. I'll wear a heavy dupatta on my head for the pheras, and I want my hair to last 10 hours."
              className="rounded-3xl bg-card p-5 text-base" />
          </Section>
        )}
        {step === 6 && (!looks ? (
          <Analyzing steps={["Reading face shape", "Matching outfit neckline", `Considering ${occasionList.join(", ") || "your occasion"}`, "Curating hairstyles"]} />
        ) : (
          <Section title="Recommended for you" body="Select the looks you'd like to preview and accessorise.">
            <div className="grid gap-6 md:grid-cols-3">
              {looks.map((l) => {
                const on = selected.includes(l.id);
                return (
                  <button key={l.id} type="button" onClick={() => setSelected(on ? selected.filter((x) => x !== l.id) : [...selected, l.id])}
                    className={cn("group overflow-hidden rounded-3xl border bg-card text-left transition", on ? "border-rose shadow-soft" : "border-border")}>
                    <div className="relative">
                      <img src={l.image} alt={l.name} loading="lazy" className="aspect-[4/5] w-full object-cover" />
                      <span className="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold">{l.match}% match</span>
                      <span className={cn("absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card", on ? "bg-rose" : "bg-card/40")}>
                        {on && <Check className="h-4 w-4 text-accent-foreground" />}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-2xl">{l.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{l.summary}</p>
                      <ul className="mt-3 space-y-1 text-sm">{l.why.map((w) => <li key={w}>· {w}</li>)}</ul>
                    </div>
                  </button>
                );
              })}
            </div>
          </Section>
        ))}
        {step === 7 && current && (
          <Section title="Your previews" body="Drag the slider to compare your photo with each recommended look.">
            <LookTabs looks={chosen} active={current.id} onPick={setActiveLook} />
            <div className="mt-6 grid gap-8 md:grid-cols-2">
              <BeforeAfter before={face ?? images.lookWaves} after={current.image} />
              <div className="space-y-4">
                <h3 className="text-4xl">{current.name}</h3>
                <p className="text-muted-foreground">{current.summary}</p>
                <div className="flex flex-wrap gap-2">{current.tags.map((t) => <span key={t} className="rounded-full bg-secondary px-3 py-1 text-xs">{t}</span>)}</div>
                <div className="rounded-3xl bg-blush-gradient p-5">
                  <p className="eyebrow">Alternatives</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>· Same look with a centre parting</li>
                    <li>· Softer version with face-framing tendrils</li>
                    <li>· Higher placement for a taller silhouette</li>
                  </ul>
                </div>
              </div>
            </div>
          </Section>
        )}
        {step === 8 && current && (
          <Section title="Accessorise each look" body="Changes apply to the selected look only — switch tabs to style the others.">
            <LookTabs looks={chosen} active={current.id} onPick={setActiveLook} />
            <div className="mt-6 grid gap-8 md:grid-cols-[1fr_1.2fr]">
              <div className="md:sticky md:top-24 md:self-start"><AccessorizedPreview image={current.image} name={current.name} acc={accFor(current.id)} /></div>
              <AccessoryPanel lookName={current.name} showReference={false} value={accFor(current.id)} onChange={(v) => setAccByLook({ ...accByLook, [current.id]: v })} />
            </div>
          </Section>
        )}
        {step === 9 && (
          <Section title="Compare & save your final looks" body={`Styled for ${occasionList.join(", ")}.`}>
            <div className={cn("grid gap-6", chosen.length > 1 ? "md:grid-cols-2 lg:grid-cols-3" : "max-w-sm")}>
              {chosen.map((l) => (
                <div key={l.id} className="space-y-3">
                  <AccessorizedPreview image={l.image} name={l.name} acc={accFor(l.id)} />
                  <Button variant="rose" className="w-full" onClick={() => {
                    const a = accFor(l.id);
                    saveLook({ id: `${l.id}-${Date.now()}`, name: l.name, image: l.image, accessories: accessoryLabels(a), intensity: a.none ? undefined : a.intensity, occasions: occasionList });
                    toast.success(`${l.name} saved to your looks`);
                  }}>
                    <Heart /> Save this look
                  </Button>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
              See everything you've saved in <Link to="/saved" className="text-rose underline">Saved Looks</Link>.
            </p>
          </Section>
        )}
      </div>

      <div className="sticky bottom-0 -mx-5 mt-10 flex items-center justify-between border-t border-border bg-background/90 px-5 py-4 backdrop-blur">
        <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft /> Back</Button>
        {step < STEPS.length - 1 ? (
          <Button variant="rose" disabled={!canContinue} onClick={() => setStep(step + 1)}>Continue <ArrowRight /></Button>
        ) : (
          <Button asChild variant="rose"><Link to="/saved">View saved looks <ArrowRight /></Link></Button>
        )}
      </div>
    </div>
  );
}

function Split({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="grid items-center gap-10 md:grid-cols-2">
      <div><h2 className="text-4xl md:text-6xl">{title}</h2><p className="mt-4 max-w-md text-muted-foreground">{body}</p></div>
      <div className="mx-auto w-full max-w-sm">{children}</div>
    </div>
  );
}
function Section({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-4xl md:text-5xl">{title}</h2>
      <p className="mb-8 mt-3 text-muted-foreground">{body}</p>
      {children}
    </div>
  );
}
function LookTabs({ looks, active, onPick }: { looks: Look[]; active: string; onPick: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {looks.map((l) => (
        <button key={l.id} onClick={() => onPick(l.id)} className={cn("flex items-center gap-2 rounded-full border py-1 pl-1 pr-4 text-sm transition", l.id === active ? "border-rose bg-secondary" : "border-border bg-card")}>
          <img src={l.image} alt="" className="h-8 w-8 rounded-full object-cover" /> {l.name}
        </button>
      ))}
    </div>
  );
}

