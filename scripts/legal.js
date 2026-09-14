/**
 * The operator's details, written into every page that has to name them.
 *
 * A contact address for privacy requests and a postal address for email are
 * obligations, not decoration, so an unset value renders as a visible note
 * rather than silently disappearing.
 */

import { OPERATOR } from "./config.js";

const FIELDS = {
  "operator-name": OPERATOR.name,
  "operator-email": OPERATOR.email,
  "operator-address": OPERATOR.postalAddress,
  "operator-jurisdiction": OPERATOR.jurisdiction,
  "effective-date": formatDate(OPERATOR.effectiveDate),
};

export function mountLegal() {
  for (const node of document.querySelectorAll("[data-legal]")) {
    const value = FIELDS[node.dataset.legal];
    if (value) {
      node.textContent = value;
      node.removeAttribute("data-legal-unset");
    } else {
      node.setAttribute("data-legal-unset", "true");
    }
  }

  for (const link of document.querySelectorAll("[data-legal-mailto]")) {
    if (OPERATOR.email) link.href = `mailto:${OPERATOR.email}`;
  }

  const year = String(new Date().getFullYear());
  for (const node of document.querySelectorAll("[data-legal-year]")) {
    node.textContent = year;
  }
}

function formatDate(iso) {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.valueOf())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
