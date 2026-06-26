import { lazy, Suspense, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  EnvelopeSimple,
  GithubLogo,
  List,
  Minus,
  Plus,
  X,
} from "@phosphor-icons/react";
import { AnimatedNumber } from "./components/AnimatedNumber.jsx";
import { LanguageSwitcher } from "./components/LanguageSwitcher.jsx";
import { MagneticLink } from "./components/MagneticLink.jsx";
import { KineticHeading, PageProgress, TiltSurface } from "./components/MotionSystem.jsx";
import { Reveal } from "./components/Reveal.jsx";

// The 3D orbital scene pulls in Three.js (the bundle's heaviest dependency).
// It is a decorative, aria-hidden background, so we defer it off the critical
// path: hero text and content paint immediately, the scene streams in after.
const OrbitScene = lazy(() =>
  import("./components/OrbitScene.jsx").then((m) => ({ default: m.OrbitScene })),
);
import { capabilityIcons, technologyIcons } from "./data.js";

const EMAIL = "playwolf719@163.com";
const GITHUB = "https://github.com/playwolf719";

function Header() {
  const { t } = useTranslation();
  const navItems = t("nav.items", { returnObjects: true });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (current) setActive(current.target.id);
      },
      { rootMargin: "-22% 0px -45%", threshold: [0.02, 0.2, 0.6] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [navItems]);

  return (
    <header className="site-header">
      <a className="brand" href="#home" aria-label={t("header.homeAriaLabel")}>
        <span className="brand__mark">{t("header.brandMark")}</span>
        <span className="brand__text">{t("header.brandText")}</span>
      </a>

      <div className="header__actions">
        <LanguageSwitcher />

        <button
          className="menu-toggle"
          type="button"
          aria-label={open ? t("header.closeNav") : t("header.openNav")}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} /> : <List size={22} />}
        </button>
      </div>

      <nav className={`site-nav ${open ? "is-open" : ""}`} aria-label={t("header.mainNavAriaLabel")}>
        {navItems.map((item) => (
          <a
            key={item.id}
            className={active === item.id ? "is-active" : ""}
            href={`#${item.id}`}
            onClick={() => {
              setOpen(false);
              setActive(item.id);
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

function Hero() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const tags = t("hero.tags", { returnObjects: true });

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <section className="hero" id="home">
      <Suspense fallback={null}>
        <OrbitScene />
      </Suspense>
      <div className="hero__content">
        <motion.p
          className="hero__eyebrow"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12 }}
        >
          {t("hero.eyebrow")}
        </motion.p>

        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.78, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <span>{t("hero.titleLine1")}</span>
          {t("hero.titleLine2")}
        </motion.h1>

        <motion.p
          className="hero__intro"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, delay: 0.34 }}
        >
          {t("hero.introLine1")}
          <br />
          {t("hero.introLine2")}
        </motion.p>

        <motion.div
          className="hero__tags"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.65, delay: 0.48 }}
        >
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </motion.div>

        <motion.div
          className="hero__actions"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, delay: 0.58 }}
        >
          <button className="text-link hero__email" type="button" onClick={copyEmail}>
            {copied ? <Check size={18} weight="bold" /> : <EnvelopeSimple size={18} />}
            {copied ? t("hero.emailCopied") : EMAIL}
          </button>
          <a className="text-link" href={GITHUB} target="_blank" rel="noreferrer">
            <GithubLogo size={18} weight="fill" />
            github.com/playwolf719
          </a>
        </motion.div>
      </div>

      <a className="scroll-cue" href="#capabilities" aria-label={t("hero.scrollAriaLabel")}>
        <span>{t("hero.scrollCue")}</span>
        <ArrowDown size={16} />
      </a>
    </section>
  );
}

function Metrics() {
  const { t } = useTranslation();
  const metrics = t("metrics.items", { returnObjects: true });

  return (
    <section className="metrics" aria-label={t("metrics.ariaLabel")}>
      <div className="content-shell metrics__grid">
        {metrics.map((metric, index) => (
          <Reveal className="metric" delay={index * 0.07} key={metric.label}>
            <strong>
              <AnimatedNumber value={metric.value} suffix={metric.suffix} />
            </strong>
            <span>{metric.label}</span>
            <p>{metric.detail}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Capabilities() {
  const { t } = useTranslation();
  const capabilities = t("capabilities.items", { returnObjects: true });

  return (
    <section className="section section--capabilities" id="capabilities">
      <div className="content-shell">
        <Reveal className="section-heading">
          <span className="section-kicker">{t("capabilities.kicker")}</span>
          <KineticHeading>{t("capabilities.heading")}</KineticHeading>
          <p>{t("capabilities.description")}</p>
        </Reveal>

        <div className="capability-grid">
          {capabilities.map(({ id, title, subtitle, bullets }, index) => {
            const Icon = capabilityIcons[id];
            return (
              <Reveal className="capability-cell" delay={index * 0.1} key={id}>
                <TiltSurface className="capability">
                  <div className="capability__icon">
                    <Icon size={32} weight="duotone" />
                  </div>
                  <h3>{title}</h3>
                  <p>{subtitle}</p>
                  <ul>
                    {bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </TiltSurface>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Work() {
  const { t } = useTranslation();
  const selectedWork = t("work.items", { returnObjects: true });
  const [expanded, setExpanded] = useState(0);

  return (
    <section className="section section--work" id="work">
      <div className="content-shell">
        <Reveal className="section-heading section-heading--split">
          <div>
            <span className="section-kicker">{t("work.kicker")}</span>
            <KineticHeading>{t("work.heading")}</KineticHeading>
          </div>
          <p>{t("work.description")}</p>
        </Reveal>

        <div className="work-list">
          {selectedWork.map((item, index) => {
            const isExpanded = expanded === index;
            return (
              <Reveal key={item.title} delay={index * 0.06}>
                <button
                  className={`work-item ${isExpanded ? "is-expanded" : ""}`}
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => setExpanded(isExpanded ? -1 : index)}
                >
                  <span className="work-item__index">{item.index}</span>
                  <span className="work-item__main">
                    <span className="work-item__title">{item.title}</span>
                    <span className="work-item__summary">{item.summary}</span>
                    <span className="work-item__tags">
                      {item.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </span>
                  </span>
                  <span className="work-item__result">
                    <small>RESULT</small>
                    {item.result}
                  </span>
                  <span className="work-item__toggle" aria-hidden="true">
                    {isExpanded ? <Minus size={15} weight="bold" /> : <Plus size={15} weight="bold" />}
                  </span>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Experience() {
  const { t } = useTranslation();
  const experience = t("experience.items", { returnObjects: true });

  useEffect(() => {
    const update = () => {
      const section = document.querySelector("#experience");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const total = rect.height + window.innerHeight * 0.25;
      const progress = Math.min(Math.max((window.innerHeight * 0.72 - rect.top) / total, 0), 1);
      section.style.setProperty("--timeline-progress", progress);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section className="section section--experience" id="experience">
      <div className="content-shell">
        <Reveal className="section-heading">
          <span className="section-kicker">{t("experience.kicker")}</span>
          <KineticHeading>{t("experience.heading")}</KineticHeading>
        </Reveal>

        <div className="timeline">
          <div className="timeline__rail" aria-hidden="true">
            <span />
          </div>
          {experience.map((item, index) => (
            <Reveal className="timeline-item" delay={index * 0.06} key={`${item.period}-${item.company}`}>
              <span className="timeline-item__period">{item.period}</span>
              <span className="timeline-item__node" aria-hidden="true" />
              <div className="timeline-item__body">
                <div>
                  <h3>{item.company}</h3>
                  <span>{item.role}</span>
                </div>
                <p>{item.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function TechnologyIndex() {
  const { t } = useTranslation();
  const technologies = t("technology.items", { returnObjects: true });

  return (
    <section className="technology" aria-labelledby="technology-title">
      <div className="content-shell">
        <Reveal>
          <span className="section-kicker" id="technology-title">
            {t("technology.kicker")}
          </span>
        </Reveal>
        <div className="technology__grid">
          {technologies.map(({ id, label, value }, index) => {
            const Icon = technologyIcons[id];
            return (
              <Reveal
                className="technology-item"
                delay={index * 0.055}
                key={id}
                style={{ "--tech-delay": `${index * -0.55}s` }}
              >
                <Icon size={31} weight="duotone" />
                <strong>{label}</strong>
                <span>{value}</span>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <section className="contact" id="contact">
      <div className="content-shell contact__inner">
        <Reveal className="contact__copy">
          <span className="section-kicker">{t("contact.kicker")}</span>
          <KineticHeading>{t("contact.heading")}</KineticHeading>
          <p>{t("contact.description")}</p>
        </Reveal>

        <Reveal className="contact__actions" delay={0.12}>
          <MagneticLink as="button" className="button button--primary button--large" onClick={copyEmail}>
            {copied ? <Check size={21} weight="bold" /> : <EnvelopeSimple size={21} weight="bold" />}
            {copied ? t("contact.emailCopied") : t("contact.emailButton")}
          </MagneticLink>
          <a className="button button--ghost button--large" href={GITHUB} target="_blank" rel="noreferrer">
            <GithubLogo size={22} weight="fill" />
            {t("contact.githubButton")}
            <ArrowUpRight size={17} />
          </a>
        </Reveal>
      </div>

      <footer className="site-footer content-shell">
        <span>© {new Date().getFullYear()} {t("header.brandText")}</span>
        <span>{t("contact.footerTagline")}</span>
      </footer>
    </section>
  );
}

export function App() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.title = t("meta.title");
    document.querySelector('meta[name="description"]')?.setAttribute("content", t("meta.description"));
  }, [i18n.language, t]);

  return (
    <>
      <PageProgress />
      <Header />
      <main>
        <Hero />
        <Metrics />
        <Capabilities />
        <Work />
        <Experience />
        <TechnologyIndex />
        <Contact />
      </main>
    </>
  );
}
