/**
 * Scroll behaviour: what enters, where you are, and which formation the field
 * should be holding. All of it is observer-driven — nothing runs a layout
 * read on every scroll event.
 */

export function mountReveals() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      const shown = entries.filter((e) => e.isIntersecting);
      shown.forEach((entry, i) => {
        entry.target.style.setProperty("--reveal-delay", `${Math.min(i, 5) * 70}ms`);
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
  );

  items.forEach((el) => io.observe(el));
}

/**
 * The chapter rail, the reading progress hairline, the nav highlight and the
 * field formation all follow the same notion of "the chapter you are in".
 */
export function mountChapters(field) {
  const chapters = [...document.querySelectorAll(".chapter")];
  const rail = document.getElementById("chapter-rail");
  const bar = document.getElementById("progress-bar");
  const topbar = document.querySelector(".topbar");
  const navLinks = [...document.querySelectorAll(".topnav a")];

  if (rail) {
    rail.innerHTML = chapters
      .map((c) => `<li data-for="${c.id}"><span>${c.dataset.chapter ?? c.id}</span></li>`)
      .join("");
  }

  let current = "";

  function setCurrent(id) {
    if (id === current) return;
    current = id;

    rail?.querySelectorAll("li").forEach((li) => li.classList.toggle("is-current", li.dataset.for === id));
    navLinks.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === `#${id}`));

    const section = document.getElementById(id);
    if (section?.dataset.field) field?.setFormation(section.dataset.field);
  }

  const io = new IntersectionObserver(
    (entries) => {
      // whichever chapter owns the most of the viewport wins
      const best = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (best) setCurrent(best.target.id);
    },
    { threshold: [0.15, 0.35, 0.6] },
  );

  chapters.forEach((c) => io.observe(c));

  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? y / max : 0;

      if (bar) bar.style.transform = `scaleX(${p})`;
      field?.setScroll(p);

      // the bar gets out of the way going down, comes back coming up
      if (topbar) {
        const hide = y > lastY && y > window.innerHeight * 0.8;
        topbar.dataset.hidden = String(hide);
      }
      lastY = y;
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  setCurrent(chapters[0]?.id ?? "");
}
