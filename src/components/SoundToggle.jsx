import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const SRC = `${import.meta.env.BASE_URL}audio/bg.mp3`;
const VOLUME = 0.45;

/** Header control for the looping background track; starts only after an explicit click. */
export function SoundToggle() {
  const { t } = useTranslation();
  const audio = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    const el = audio.current;
    let fade = 0, resumeOnShow = false, disposed = false;
    const onFailure = (error) => {
      if (disposed || error.name === "AbortError") return;
      setEnabled(false);
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
    const onPlay = () => { setEnabled(true); setPlaying(true); setFailed(false); setWaiting(false); fadeIn(); };
    const onPause = () => { cancelAnimationFrame(fade); setPlaying(false); };
    const onError = () => { console.error("Background music could not be loaded.", el.error); setEnabled(false); setFailed(true); setPlaying(false); };
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("error", onError);
    el.volume = VOLUME;
    const onVisibility = () => {
      if (document.hidden) { resumeOnShow = !el.paused; if (resumeOnShow) el.pause(); }
      else if (resumeOnShow) {
        resumeOnShow = false;
        el.play().catch(onFailure);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      disposed = true; cancelAnimationFrame(fade);
      el.removeEventListener("play", onPlay); el.removeEventListener("pause", onPause);
      el.removeEventListener("error", onError);
      document.removeEventListener("visibilitychange", onVisibility);
      el.pause();
    };
  }, []);

  function toggle() {
    const el = audio.current;
    if (!enabled || failed) {
      setEnabled(true); setFailed(false); setWaiting(false);
      if (el.error) el.load();
      el.play().catch((error) => {
        if (error.name === "AbortError") return;
        setEnabled(false);
        if (error.name === "NotAllowedError") { setWaiting(true); return; }
        console.error("Background music could not be played.", error); setFailed(true);
      });
    }
    else { setEnabled(false); setWaiting(false); el.pause(); }
  }

  const label = t(failed ? "music.retry" : enabled ? "music.mute" : "music.play");
  return <>
    <audio ref={audio} src={SRC} loop preload="auto" />
    <button type="button" className={`sound-toggle${playing ? " is-playing" : ""}`} aria-pressed={enabled} aria-label={label} title={waiting && !failed ? t("music.waiting") : label} onClick={toggle}>
      <span className="eq" aria-hidden="true"><i /><i /><i /><i /></span>
      <span className="sound-label" aria-hidden="true">{t(failed ? "music.unavailable" : enabled ? "music.on" : "music.off")}</span>
    </button>
    <span className="sr-only" role="status">{failed ? t("music.retry") : waiting ? t("music.waiting") : ""}</span>
  </>;
}
