import { useEffect, useRef } from "react";
import { createSignalField } from "./signalField.js";

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const labels = { monogram: "B/D", network: "NETWORK", frames: "FRAMES", strata: "STRATA", river: "RIVER", dual: "CHANNELS", ring: "SIGNAL" };
const aliases = { metrics: "home", foundations: "work", stack: "experience" };

export function useSignalMotion(language) {
  const canvasRef = useRef(null);
  const fieldRef = useRef(null);

  useEffect(() => {
    const field = createSignalField(canvasRef.current);
    fieldRef.current = field;
    field.init();
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => field.setReduced(query.matches);
    query.addEventListener("change", update);
    return () => { query.removeEventListener("change", update); field.destroy(); fieldRef.current = null; };
  }, []);

  useEffect(() => {
    const events = new AbortController();
    const listen = (node, type, handler, options = {}) => node.addEventListener(type, handler, { ...options, signal: events.signal });
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const work = document.getElementById("work");
    const track = document.getElementById("track");
    const timeline = document.getElementById("tlWrap");
    const heroTitle = document.getElementById("heroTitle");
    const sections = [...document.querySelectorAll("main > section[data-shape]")];
    let frame = 0, distance = 0, current = "", disposed = false;
    const timeouts = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timeouts.delete(id); fn(); }, ms); timeouts.add(id); };

    const reveal = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => { if (isIntersecting) { target.classList.add("in"); reveal.unobserve(target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    document.querySelectorAll(".rv, .split").forEach((node) => {
      if (query.matches) node.classList.add("in"); else reveal.observe(node);
    });

    function layout() {
      distance = window.innerWidth > 860 && !query.matches ? Math.max(0, track.scrollWidth - track.clientWidth) : 0;
      work.style.height = distance ? `${window.innerHeight + distance}px` : "";
      if (!distance) track.style.transform = "";
      update();
    }
    function update() {
      frame = 0;
      const y = window.scrollY, vh = window.innerHeight;
      const progress = clamp(y / Math.max(1, document.documentElement.scrollHeight - vh));
      document.getElementById("progress").style.transform = `scaleX(${progress})`;
      document.getElementById("hudPct").textContent = `${String(Math.round(progress * 100)).padStart(3, "0")}%`;
      document.getElementById("top").classList.toggle("scrolled", y > 40);
      heroTitle.style.setProperty("--hw", String(Math.round(640 - 330 * clamp(y / vh))));
      if (distance) {
        const p = clamp(-work.getBoundingClientRect().top / distance);
        track.style.transform = `translate3d(${-p * distance}px,0,0)`;
        document.getElementById("pinIdx").textContent = String(Math.min(track.children.length, Math.floor(p * track.children.length * 0.9999) + 1)).padStart(2, "0");
        document.getElementById("pinBar").style.transform = `scaleX(${p})`;
      }
      const marker = vh * 0.62;
      const rect = timeline.getBoundingClientRect();
      timeline.style.setProperty("--tp", clamp((marker - rect.top) / Math.max(1, rect.height)));
      timeline.querySelectorAll(".tli").forEach((item) => item.classList.toggle("lit", item.getBoundingClientRect().top + 10 < marker));
      const active = sections.find((section) => { const r = section.getBoundingClientRect(); return r.top <= vh * 0.5 && r.bottom > vh * 0.5; }) || sections[0];
      if (active.id !== current) {
        current = active.id;
        fieldRef.current?.setShape(active.dataset.shape, ["foundations", "experience", "stack"].includes(current));
        document.getElementById("hudShape").textContent = labels[active.dataset.shape];
        document.querySelectorAll("#nav a").forEach((link) => {
          if (link.hash === `#${aliases[current] || current}`) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      }
    }
    const queue = () => { if (!frame) frame = requestAnimationFrame(update); };
    listen(window, "scroll", queue, { passive: true });
    listen(window, "resize", layout);
    listen(query, "change", () => {
      if (query.matches) document.querySelectorAll(".rv, .split").forEach((node) => node.classList.add("in"));
      layout();
    });
    document.querySelectorAll(".card").forEach((card) => listen(card, "pointermove", (event) => {
      if (query.matches || !finePointer) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    }));
    document.querySelectorAll(".magnetic").forEach((button) => {
      listen(button, "pointermove", (event) => {
        if (query.matches || !finePointer) return;
        const rect = button.getBoundingClientRect();
        button.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) / rect.width * 10}px,${(event.clientY - rect.top - rect.height / 2) / rect.height * 10}px)`;
      });
      listen(button, "pointerleave", () => { button.style.transform = ""; });
    });
    listen(window, "pointermove", (event) => {
      if (query.matches || !finePointer || window.scrollY > window.innerHeight) return;
      heroTitle.querySelectorAll(".w").forEach((letter) => {
        const r = letter.getBoundingClientRect();
        const f = clamp(1 - Math.hypot(event.clientX - r.left - r.width / 2, event.clientY - r.top - r.height / 2) / 280);
        if (f) letter.style.setProperty("--w", String(Math.round(320 + 380 * f))); else letter.style.removeProperty("--w");
      });
    }, { passive: true });
    const interval = setInterval(() => {
      if (query.matches || document.hidden) return;
      const grid = document.getElementById("stackGrid"), r = grid.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const tokens = grid.querySelectorAll(".tok");
      const token = tokens[Math.floor(Math.random() * tokens.length)];
      if (token) { token.classList.add("lit"); later(() => token.classList.remove("lit"), 1300); }
    }, 650);
    // Focused project controls must stay inside the viewport of the pinned gallery.
    listen(track, "focusin", (event) => {
      const project = event.target.closest(".proj");
      if (project && distance) window.scrollTo({ top: window.scrollY + work.getBoundingClientRect().top + Math.min(distance, project.offsetLeft - track.offsetLeft), behavior: query.matches ? "instant" : "smooth" });
    });
    const observer = new ResizeObserver(layout);
    observer.observe(track);
    layout();
    document.fonts.ready.then(() => { if (!disposed) layout(); });
    return () => {
      disposed = true;
      events.abort(); reveal.disconnect(); observer.disconnect();
      cancelAnimationFrame(frame); clearInterval(interval); timeouts.forEach(clearTimeout);
    };
  }, [language]);

  return canvasRef;
}
