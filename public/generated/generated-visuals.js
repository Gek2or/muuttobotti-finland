(() => {
  const current = document.currentScript?.src;
  if (!current) return;
  const base = new URL("./", current);
  Promise.all(
    [0, 1, 2, 3, 4].map((i) =>
      fetch(new URL(`pack-${i}.txt`, base)).then((r) => {
        if (!r.ok) throw new Error(`visual chunk ${i}`);
        return r.text();
      })
    )
  )
    .then((parts) => {
      const b64 = parts.join("").replace(/\s+/g, "");
      const raw = atob(b64);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([bytes], { type: "image/webp" }));
      document.documentElement.style.setProperty("--mb-visual-pack", `url("${url}")`);
    })
    .catch(() => undefined);
})();
