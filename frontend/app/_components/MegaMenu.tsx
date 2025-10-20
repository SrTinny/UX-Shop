"use client";

import { useEffect, useRef } from "react";

type Column = { title: string; links: { label: string; href: string }[] };

export default function MegaMenu({ columns, highlight }: { columns: Column[]; highlight?: { title: string; href: string; image?: string } }) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  // basic keyboard support: close on Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        panelRef.current?.classList.remove("visible");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      ref={panelRef}
      role="menu"
      aria-label="Mega menu"
      className="absolute left-0 mt-3 w-[980px] rounded-md bg-white shadow-lg p-6 invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-all duration-150 z-50"
    >
      <div className="grid grid-cols-4 gap-6">
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold mb-2">{col.title}</h4>
            <ul className="space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-brand block">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {highlight && (
          <div className="col-span-1">
            <a href={highlight.href} className="block rounded-md overflow-hidden">
              {highlight.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={highlight.image} alt="" className="w-full h-28 object-cover mb-2" loading="lazy" />
              ) : null}
              <div className="text-sm font-medium">{highlight.title}</div>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
