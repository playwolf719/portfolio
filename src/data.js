import {
  Atom,
  ChartLineUp,
  Cloud,
  Code,
  Database,
  GitBranch,
  Stack,
} from "@phosphor-icons/react";

// Text content lives in src/i18n/locales/*.json. Only structural/icon
// data that doesn't vary by language stays here, keyed to match the
// `id` field of the corresponding translation entries.
export const capabilityIcons = {
  "ai-platform": Atom,
  "multi-agent": GitBranch,
  "enterprise-workflow": Stack,
};

export const technologyIcons = {
  lang: Code,
  ai: Atom,
  bigdata: ChartLineUp,
  storage: Database,
  cloud: Cloud,
  observability: ChartLineUp,
};
