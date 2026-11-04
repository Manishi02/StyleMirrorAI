import { useEffect, useState } from "react";

// Prototype storage in the browser. Swap for a backend table later.
export type SavedLook = {
  id: string;
  name: string;
  image: string;
  accessories: string[];
  intensity?: string;
  occasions?: string[];
  savedAt: number;
};

const KEY = "stylemirror.saved";
const EVENT = "stylemirror:saved";

export function readSaved(): SavedLook[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(list: SavedLook[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export function saveLook(look: Omit<SavedLook, "savedAt">) {
  write([{ ...look, savedAt: Date.now() }, ...readSaved().filter((l) => l.id !== look.id)]);
}
export function removeLook(id: string) {
  write(readSaved().filter((l) => l.id !== id));
}

export function useSavedLooks() {
  const [list, setList] = useState<SavedLook[]>([]);
  useEffect(() => {
    const sync = () => setList(readSaved());
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  return list;
}
