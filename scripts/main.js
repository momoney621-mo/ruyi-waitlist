/**
 * Bootstrap for the short waitlist: cloud parallax, reading progress, reveal
 * motion, and the signup. The product demos deliberately do not mount here.
 */

import { createCloudField } from "./clouds.js";
import { mountReveals, mountChapters } from "./reveal.js";
import { mountWaitlist } from "./waitlist.js";
import { mountLegal } from "./legal.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function guard(name, fn) {
  try {
    fn();
  } catch (err) {
    console.warn(`site: ${name} did not mount`, err);
  }
}

function start() {
  const cloudHost = document.getElementById("cloud-field");
  const field = cloudHost ? createCloudField(cloudHost, { reducedMotion }) : null;

  guard("reveals", mountReveals);
  guard("chapters", () => mountChapters(field));
  guard("waitlist", mountWaitlist);
  guard("legal", mountLegal);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
