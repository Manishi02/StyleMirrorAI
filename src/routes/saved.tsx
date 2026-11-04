import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeLook, useSavedLooks } from "@/lib/saved-looks";
import { PageHero } from "@/components/style/controls";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved Looks — StyleMirror AI" },
      { name: "description", content: "Your saved hairstyle and accessory looks, ready to share with your stylist." },
      { property: "og:title", content: "Saved Looks — StyleMirror AI" },
      { property: "og:description", content: "All your favourite hairstyles in one lookbook." },
    ],
  }),
  component: Saved,
});

function Saved() {
  const looks = useSavedLooks();
  return (
    <>
      <PageHero eyebrow="Saved Looks" title="Your lookbook">Saved on this device. Share them with your hair artist.</PageHero>
      <div className="mx-auto max-w-6xl px-5">
        {looks.length === 0 ? (
          <div className="rounded-3xl bg-blush-gradient p-12 text-center">
            <h2 className="text-3xl">No looks saved yet</h2>
            <p className="mt-2 text-muted-foreground">Create your first look in the Occasion Stylist.</p>
            <Button asChild variant="rose" className="mt-6"><Link to="/occasion" search={{ sample: true }}>Try with sample photos</Link></Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {looks.map((l) => (
              <article key={l.id} className="group">
                <div className="relative overflow-hidden rounded-3xl">
                  <img src={l.image} alt={l.name} loading="lazy" className="aspect-[4/5] w-full object-cover" />
                  <button aria-label="Remove look" onClick={() => removeLook(l.id)} className="absolute right-3 top-3 rounded-full bg-card/90 p-2"><Trash2 className="h-4 w-4" /></button>
                </div>
                <h3 className="mt-3 text-2xl">{l.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {[l.accessories.join(", ") || "No accessories", l.intensity, l.occasions?.join(", ")].filter(Boolean).join(" · ")}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
