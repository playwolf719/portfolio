import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, List, X } from "@phosphor-icons/react";
import { AnimatedNumber } from "./components/AnimatedNumber.jsx";
import { LanguageSwitcher } from "./components/LanguageSwitcher.jsx";
import { useSignalMotion } from "./components/useSignalMotion.js";
import { capabilityIcons, profileLinks } from "./data.js";

function Mark() { return <span className="mark" aria-hidden="true">B<b>/</b>D</span>; }

function Heading({ children, as: Tag = "h2", className = "h2", id, perChar = false }) {
  let index = 0;
  const parts = String(children).split(/(\s+)/).flatMap((part) => {
    if (/^\s+$/.test(part)) return [part];
    const chunks = perChar ? Array.from(part) : part.match(/[㐀-鿿　-〿＀-￯]|[^㐀-鿿　-〿＀-￯]+/g) || [];
    return chunks.map((chunk) => <span className="w" key={index}><span style={{ "--i": index++ }}>{chunk}</span></span>);
  });
  return <Tag className={`${className} split`} id={id}><span className="sr-only">{children}</span><span aria-hidden="true">{parts}</span></Tag>;
}

function LinkButton({ href, children, primary = false }) {
  const external = /^https?:/.test(href);
  return <a className={`btn magnetic${primary ? " primary" : ""}`} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}><span className="inner">{children}<ArrowUpRight className="arr" size={16} aria-hidden="true" /></span></a>;
}

function Header() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const toggle = useRef(null);
  useEffect(() => {
    const close = (event) => { if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); } };
    if (open) document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return <header className="top" id="top">
    <a className="brand" href="#home" aria-label={t("header.homeAriaLabel")} onClick={() => setOpen(false)}><Mark /><span className="brand-text">{t("header.brandText")}</span></a>
    <nav className={`nav${open ? " is-open" : ""}`} id="nav" aria-label={t("header.mainNavAriaLabel")}>
      {t("nav.items", { returnObjects: true }).map((item) => <a key={item.id} href={`#${item.id}`} onClick={() => setOpen(false)}>{item.label}</a>)}
    </nav>
    <div className="top-actions"><LanguageSwitcher /><button className="menu-toggle" ref={toggle} type="button" aria-expanded={open} aria-controls="nav" aria-label={t(open ? "header.closeNav" : "header.openNav")} onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <List size={22} />}</button></div>
  </header>;
}

function Hero() {
  const { t } = useTranslation();
  return <section id="home" className="hero" data-shape="monogram"><div className="wrap">
    <p className="eyebrow"><span className="live" aria-hidden="true">●</span><span>{t("hero.eyebrow")}</span></p>
    <Heading as="h1" className="hero-title" id="heroTitle" perChar>{t("hero.titleLine1")}</Heading>
    <p className="hero-sub">{t("hero.titleLine2")}</p>
    <div className="hero-row"><div className="rv" style={{ "--d": 3 }}><p className="intro"><span>{t("hero.introLine1")}</span><span>{t("hero.introLine2")}</span></p><ul className="tags">{t("hero.tags", { returnObjects: true }).map((tag) => <li className="tag" key={tag}>{tag}</li>)}</ul></div>
      <div className="btns rv" style={{ "--d": 5 }}><LinkButton href={`mailto:${profileLinks.email}`} primary>{t("contact.emailButton")}</LinkButton><LinkButton href={profileLinks.github}>GitHub</LinkButton><LinkButton href={profileLinks.bilibili}>{t("hero.bilibiliLabel")}</LinkButton><LinkButton href={profileLinks.youtube}>{t("hero.youtubeLabel")}</LinkButton></div>
    </div>
    <a className="scroll-cue" href="#metrics" aria-label={t("hero.scrollAriaLabel")}><i aria-hidden="true" /><span>{t("hero.scrollCue")}</span></a>
  </div></section>;
}

function Metrics() {
  const { t } = useTranslation();
  return <section id="metrics" className="metrics" data-shape="monogram" aria-label={t("metrics.ariaLabel")}><div className="wrap"><ul>{t("metrics.items", { returnObjects: true }).map((item, i) => <li className="metric rv" key={item.label} style={{ "--d": i }}><p className="val"><AnimatedNumber value={item.value} /><small>{item.suffix}</small></p><p className="lab">{item.label}</p><p className="det">{item.detail}</p></li>)}</ul></div></section>;
}

function Capabilities() {
  const { t } = useTranslation();
  const items = t("capabilities.items", { returnObjects: true });
  return <section id="capabilities" className="sec" data-shape="network"><div className="wrap">
    <p className="kicker">{t("capabilities.kicker")}</p><Heading>{t("capabilities.heading")}</Heading><p className="lede rv">{t("capabilities.description")}</p>
    <div className="cards">{items.map((item, i) => { const Icon = capabilityIcons[item.id]; return <article className="card rv" key={item.id} style={{ "--d": i }}><p className="num"><span>0{i + 1} / 0{items.length}</span><span>{item.id.toUpperCase()}</span></p><Icon className="glyph" size={44} weight="thin" aria-hidden="true" /><h3>{item.title}</h3><p className="sub">{item.subtitle}</p><ul>{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></article>; })}</div>
    <div className="card eng rv"><div><h3>{t("capabilities.engineering.title")}</h3><p>{t("capabilities.engineering.description")}</p></div><ul className="principles">{t("capabilities.engineering.principles", { returnObjects: true }).map((item, i) => <li className="principle" key={item} style={{ "--i": i }}><span className="mono">0{i + 1}</span>{item}</li>)}</ul></div>
  </div></section>;
}

function Work() {
  const { t, i18n } = useTranslation();
  const items = t("work.items", { returnObjects: true });
  return <><section id="work" className="work-pin" data-shape="frames"><div className="pin">
    <div className="wrap pin-head" style={{ width: "100%" }}><div><p className="kicker">{t("work.kicker")}</p><Heading>{t("work.heading")}</Heading><p className="lede">{t("work.description")}</p></div><div className="pin-meta" aria-hidden="true"><span className="cnt"><b id="pinIdx">01</b> / <span>{String(items.length).padStart(2, "0")}</span></span><div className="pin-bar"><i id="pinBar" /></div></div></div>
    <ol className="track" id="track">{items.map((item) => <li className="proj card" key={item.index} tabIndex={0}><span className="scan" aria-hidden="true" /><span className="idx" aria-hidden="true">{item.index}</span><p className="label">{i18n.language === "zh" ? "项目" : "PROJECT"} · {item.index}</p><h3>{item.title}</h3><p className="sum">{item.summary}</p><ul className="ptags">{item.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul><div className="res"><span>{t("work.resultLabel")}</span><strong>{item.result}</strong></div></li>)}</ol>
  </div></section>
  <section id="foundations" className="sec" data-shape="strata"><div className="wrap"><div className="found-head"><h3 className="rv">{t("work.foundations.heading")}</h3><a className="textlink rv" href={profileLinks.openks} target="_blank" rel="noopener noreferrer">{t("work.foundations.openSourceLink")}<ArrowUpRight size={16} aria-hidden="true" /></a></div><ul className="flist">{t("work.foundations.items", { returnObjects: true }).map((item, i) => <li className="frow rv" key={item.id} style={{ "--d": i % 3 }}><span className="ev">{item.evidence}</span><h4>{item.title}</h4><p>{item.description}</p></li>)}</ul></div></section></>;
}

function Experience() {
  const { t } = useTranslation();
  return <section id="experience" className="sec" data-shape="river"><div className="wrap"><p className="kicker">{t("experience.kicker")}</p><Heading>{t("experience.heading")}</Heading><div className="exp-grid"><div className="tl" id="tlWrap"><span className="fill" aria-hidden="true" /><ol>{t("experience.items", { returnObjects: true }).map((item) => <li className="tli rv" key={`${item.period}-${item.company}`}><span className="node" aria-hidden="true" /><p className="per">{item.period}</p><h3>{item.company}</h3><p className="role">{item.role}</p><p>{item.detail}</p></li>)}</ol></div><aside className="card edu rv"><h3>{t("experience.education.heading")}</h3><ul>{t("experience.education.items", { returnObjects: true }).map((item) => <li key={item.period}><strong>{item.school}</strong><span>{item.degree}</span><span className="mono">{item.period}</span></li>)}</ul></aside></div></div></section>;
}

function Technology() {
  const { t } = useTranslation();
  return <section id="stack" className="sec" data-shape="strata" style={{ paddingTop: 0 }}><div className="wrap"><h2 className="kicker">{t("technology.kicker")}</h2><div className="stack" id="stackGrid">{t("technology.items", { returnObjects: true }).map((item, i) => <div className="sgroup rv" key={item.id} style={{ "--d": i % 3 }}><h3><i aria-hidden="true" />{item.label}</h3><ul className="toks">{item.value.split(/\n|\//).map((token) => token.trim()).filter(Boolean).map((token) => <li className="tok" key={token}>{token}</li>)}</ul></div>)}</div></div></section>;
}

function Sharing() {
  const { t } = useTranslation();
  return <section id="sharing" className="sec" data-shape="dual"><div className="wrap"><p className="kicker">{t("sharing.kicker")}</p><Heading>{t("sharing.heading")}</Heading><p className="lede rv">{t("sharing.description")}</p><div className="share">{[{ name: "Bilibili", href: profileLinks.bilibili, label: t("sharing.linkLabel") }, { name: "YouTube", href: profileLinks.youtube, label: t("sharing.youtubeLinkLabel") }].map((item, i) => <a className="sh card rv" key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" style={{ "--d": i }}><p className="num"><span>0{i + 1}</span><span>{item.name.toUpperCase()}</span></p><div><p className="plat">{item.name}</p><p className="url">{item.href.replace(/^https:\/\//, "")}</p></div><p className="go"><span>{item.label}</span><span className="circle"><ArrowUpRight size={22} aria-hidden="true" /></span></p></a>)}</div></div></section>;
}

function Contact() {
  const { t, i18n } = useTranslation();
  const [status, setStatus] = useState("");
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copyEmail() {
    try { await navigator.clipboard.writeText(profileLinks.email); setStatus(t("contact.emailCopied")); }
    catch { setStatus(i18n.language === "zh" ? "请手动复制邮箱地址" : "Please copy the email address manually"); }
    clearTimeout(timer.current); timer.current = setTimeout(() => setStatus(""), 2500);
  }
  return <><section id="contact" className="sec contact" data-shape="ring"><div className="wrap"><p className="kicker">{t("contact.kicker")}</p><Heading className="cta-h">{t("contact.heading")}</Heading><p className="lede rv">{t("contact.description")}</p><div className="btns rv" style={{ "--d": 2 }}><LinkButton href={`mailto:${profileLinks.email}`} primary>{t("contact.emailButton")}</LinkButton><LinkButton href={profileLinks.github}>{t("contact.githubButton")}</LinkButton><LinkButton href={profileLinks.bilibili}>{t("contact.bilibiliButton")}</LinkButton><LinkButton href={profileLinks.youtube}>{t("contact.youtubeButton")}</LinkButton></div><button type="button" className="mail rv" style={{ "--d": 3 }} onClick={copyEmail} title={i18n.language === "zh" ? "复制邮箱地址" : "Copy email address"}>{profileLinks.email}</button></div></section><div className={`toast${status ? " show" : ""}`} role="status" aria-live="polite">{status}</div></>;
}

export function App() {
  const { t, i18n } = useTranslation();
  const canvasRef = useSignalMotion(i18n.language);
  useEffect(() => {
    document.documentElement.lang = i18n.language === "zh" ? "zh-CN" : "en";
    document.title = t("meta.title");
    document.querySelector('meta[name="description"]')?.setAttribute("content", t("meta.description"));
  }, [i18n.language, t]);
  return <>
    <a className="skip" href="#main">{i18n.language === "zh" ? "跳到主要内容" : "Skip to main content"}</a>
    <canvas id="field" ref={canvasRef} aria-hidden="true" /><div className="vignette" aria-hidden="true" /><div className="progress" id="progress" aria-hidden="true" />
    <Header /><div className="hud" aria-hidden="true"><span className="dot" /><span>SIGNAL FIELD</span><span className="shape" id="hudShape">B/D</span><span id="hudPct">000%</span></div>
    <main id="main"><Hero /><Metrics /><Capabilities /><Work /><Experience /><Technology /><Sharing /><Contact /></main>
    <footer><div className="fl"><Mark /><span>© {new Date().getFullYear()} Benjamin Deng · {t("contact.footerTagline")}</span></div><nav aria-label="Links"><a href={`mailto:${profileLinks.email}`}>Email</a>{["github", "bilibili", "youtube"].map((key) => <a key={key} href={profileLinks[key]} target="_blank" rel="noopener noreferrer">{{ github: "GitHub", bilibili: "Bilibili", youtube: "YouTube" }[key]}</a>)}</nav></footer>
  </>;
}
