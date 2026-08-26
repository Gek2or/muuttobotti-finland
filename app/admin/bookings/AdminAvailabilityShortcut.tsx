"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays } from "lucide-react";

export default function AdminAvailabilityShortcut() {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let attempts = 0;
    const find = () => {
      const node = document.querySelector<HTMLElement>(".admin-health");
      if (node) { setTarget(node); return; }
      attempts += 1;
      if (attempts < 40) window.setTimeout(find, 150);
    };
    find();
  }, []);

  if (!target) return null;
  return createPortal(
    <a className="admin-availability-shortcut" href="/admin/availability"><CalendarDays /> Календарь занятости</a>,
    target,
  );
}
