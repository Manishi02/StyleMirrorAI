import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export const NAV = [
  { to: "/", label: "Home" },
  { to: "/occasion", label: "Occasion Stylist" },
  { to: "/haircut", label: "Haircut Studio" },
  { to: "/accessories", label: "Accessory Studio" },
  { to: "/stylist", label: "AI Stylist" },
  { to: "/saved", label: "Saved Looks" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="font-serif text-2xl tracking-tight">
          StyleMirror <span className="italic text-rose">AI</span>
        </Link>
        <nav className="hidden gap-6 text-sm lg:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="text-muted-foreground transition hover:text-foreground" activeProps={{ className: "!text-foreground underline decoration-rose underline-offset-8" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <button className="lg:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-border bg-background px-5 py-4 lg:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} activeOptions={{ exact: true }} className="py-2 font-serif text-2xl" activeProps={{ className: "text-rose" }}>
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-10 text-sm text-muted-foreground md:flex-row md:justify-between">
        <p className="font-serif text-lg text-foreground">StyleMirror <span className="italic text-rose">AI</span></p>
        <p>Prototype · previews are simulated with sample imagery.</p>
      </div>
    </footer>
  );
}
