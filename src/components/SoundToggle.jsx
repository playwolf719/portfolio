import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const SRC = `${import.meta.env.BASE_URL}audio/bg.mp3`;
const MUTED_KEY = "bgm-muted";
const VOLUME = 0.45;
const UNLOCK_EVENTS = ["pointerdown", "keydown", "touchend"];

const readMuted = () => { try { return localStorage.getItem(MUTED_KEY) === "1"; } catch (error) { console.warn("Background music preference could not be read.", error); return false; } };
const writeMuted = (muted) => { try { localStorage.setItem(MUTED_KEY, muted ? "1" : "0"); } catch (error) { console.warn("Background music preference could not be saved.", error); } };

/** Header control for the looping background track; autoplays unless the visitor muted it before. */
export function SoundToggle() {
  const { t } = useTranslation();
  const audio = useRef(null);
  const button = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    const el = audio.current;
    let fade = 0, resumeOnShow = false, disposed = false;
    const unlock = new AbortController();
    const onFailure = (error) => {
      if (disposed || error.name === "AbortError") return;
      if (error.name === "NotAllowedError") { setWaiting(true); return; }
      console.error("Background music could not be played.", error);
      setFailed(true);
    };
    const fadeIn = () => {
      cancelAnimationFrame(fade);
      const start = performance.now();
      const tick = (now) => { const k = Math.min(1, Math.max(0, (now - start) / 1400)); el.volume = VOLUME * k; if (k < 1) fade = requestAnimationFrame(tick); };
      el.volume = 0; fade = requestAnimationFrame(tick);
    };
    const onPlay = () => { unlock.abort(); setPlaying(true); setFailed(false); setWaiting(false); fadeIn(); };
    const onPause = () => { cancelAnimationFrame(fade); setPlaying(false); };
    const onError = () => { console.error("Background music could not be loaded.", el.error); setFailed(true); setPlaying(false); };
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("error", onError);
    // Browsers usually block audible autoplay; start on the first interaction instead (the toggle handles its own clicks).
    const retry = (event) => {
      if (button.current?.contains(event.target)) return;
      if (readMuted()) { unlock.abort(); return; }
      el.play().catch(onFailure);
    };
    const awaitGesture = () => UNLOCK_EVENTS.forEach((type) => window.addEventListener(type, retry, { capture: true, signal: unlock.signal }));
    el.volume = 0;
    if (!readMuted()) {
      el.play().catch((error) => {
        onFailure(error);
        if (!disposed && error.name === "NotAllowedError") awaitGesture();
      });
    }
    const onVisibility = () => {
      if (document.hidden) { resumeOnShow = !el.paused; if (resumeOnShow) el.pause(); }
      else if (resumeOnShow) {
        resumeOnShow = false;
        el.play().catch((error) => {
          onFailure(error);
          if (!disposed && error.name === "NotAllowedError" && !unlock.signal.aborted) awaitGesture();
        });
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      disposed = true; unlock.abort(); cancelAnimationFrame(fade);
      el.removeEventListener("play", onPlay); el.removeEventListener("pause", onPause);
      el.removeEventListener("error", onError);
      document.removeEventListener("visibilitychange", onVisibility);
      el.pause();
    };
  }, []);

  function toggle() {
    const el = audio.current;
    if (el.paused) {
      writeMuted(false); setFailed(false);
      if (el.error) el.load();
      el.play().catch((error) => {
        if (error.name === "AbortError") return;
        if (error.name === "NotAllowedError") { setWaiting(true); return; }
        console.error("Background music could not be played.", error); setFailed(true);
      });
    }
    else { writeMuted(true); el.pause(); }
  }

  const label = t(failed ? "music.retry" : playing ? "music.mute" : "music.play");
  return <>
    <audio ref={audio} src={SRC} loop preload="auto" />
    <button ref={button} type="button" className={`sound-toggle${playing ? " is-playing" : ""}`} aria-pressed={playing} aria-label={label} title={waiting && !failed ? t("music.waiting") : label} onClick={toggle}>
      <span className="eq" aria-hidden="true"><i /><i /><i /><i /></span>
      <span className="sound-label" aria-hidden="true">{t(failed ? "music.unavailable" : playing ? "music.on" : "music.off")}</span>
    </button>
    <span className="sr-only" role="status">{failed ? t("music.retry") : waiting ? t("music.waiting") : ""}</span>
  </>;
}
