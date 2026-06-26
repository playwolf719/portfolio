import { useTranslation } from "react-i18next";
import { supportedLanguages } from "../i18n/index.js";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = i18n.language;

  return (
    <div className="language-switcher" role="group" aria-label={t("language.label")}>
      {supportedLanguages.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          className={current === code ? "is-active" : ""}
          aria-pressed={current === code}
          onClick={() => i18n.changeLanguage(code)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
