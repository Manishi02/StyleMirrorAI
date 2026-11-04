import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Gem, MessageCircle, Scissors, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { images } from "@/lib/styling-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StyleMirror AI — See your hairstyle before you wear it" },
      { name: "description", content: "AI hairstyle previews for Indian bridal and occasion styling. Upload your face and outfit to get personalised looks." },
      { property: "og:title", content: "StyleMirror AI — AI Personal Hair Stylist" },
      { property: "og:description", content: "Visualise bridal and occasion hairstyles with your face and outfit before your big day." },
    ],
  }),
  component: Home,
});

const FEATURES = [
  { to: "/occasion", icon: Sparkles, title: "Occasion Stylist", body: "A guided journey from face and outfit to your final bridal look." },
  { to: "/haircut", icon: Scissors, title: "Haircut Studio", body: "Try a new cut on your own photo, for men and women." },
  { to: "/accessories", icon: Gem, title: "Accessory Studio", body: "Gajra, kundan, pearls or clips — layer and compare combinations." },
  { to: "/stylist", icon: MessageCircle, title: "AI Stylist", body: "Talk through your look with a stylist who knows your outfit." },
] as const;

function Home() {
  return (
    <>
      <section className="bg-blush-gradient">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 md:grid-cols-[1.1fr_1fr] md:py-20">
          <div>
            <p className="eyebrow">Bridal & occasion styling</p>
            <h1 className="mt-4 text-5xl leading-[1.02] md:text-7xl">
              See your hairstyle <em className="text-rose">before</em> the big day.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Upload your face and outfit. StyleMirror AI recommends hairstyles, previews them on you, and helps you accessorise every ceremony.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="rose" size="lg"><Link to="/occasion">Start styling <ArrowRight /></Link></Button>
              <Button asChild variant="soft" size="lg"><Link to="/occasion" search={{ sample: true }}>Explore with sample photos</Link></Button>
            </div>
          </div>
          <div className="relative">
            <img src={images.heroBridal} alt="Bride with jasmine gajra low bun" width={1024} height={1280} className="aspect-[4/5] w-full rounded-[2rem] object-cover shadow-soft" />
            <div className="absolute -bottom-5 -left-3 rounded-2xl bg-card p-4 shadow-soft md:-left-8">
              <p className="eyebrow">96% match</p>
              <p className="font-serif text-xl">Gajra Low Bun</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="max-w-xl text-4xl md:text-5xl">Your personal stylist, in four studios.</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Link key={f.to} to={f.to} className="group rounded-3xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:shadow-soft">
              <f.icon className="h-6 w-6 text-rose" />
              <h3 className="mt-6 text-2xl">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              <ArrowRight className="mt-6 h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 md:grid-cols-3">
        {[
          { img: images.lookBraid, t: "Reception", n: "Rose Temple Braid" },
          { img: images.lookWaves, t: "Sangeet", n: "Pearl Half-up Waves" },
          { img: images.lookMen, t: "Everyday", n: "Textured Quiff Taper" },
        ].map((l) => (
          <figure key={l.n} className="overflow-hidden rounded-3xl">
            <img src={l.img} alt={l.n} loading="lazy" width={832} height={1024} className="aspect-[4/5] w-full object-cover transition duration-700 hover:scale-105" />
            <figcaption className="pt-3"><span className="eyebrow">{l.t}</span><p className="font-serif text-2xl">{l.n}</p></figcaption>
          </figure>
        ))}
      </section>
    </>
  );
}
