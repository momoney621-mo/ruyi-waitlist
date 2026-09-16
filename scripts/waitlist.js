/**
 * The waitlist form.
 *
 * A signup is appended to a Supabase table over its REST endpoint — no client
 * library, so the page stays dependency-free. `Prefer: return=minimal` matters:
 * the publishable key may insert a row but may not read one back, and asking
 * PostgREST for the inserted row would make the insert fail on a SELECT policy
 * that intentionally does not exist.
 *
 * With no project configured the signup is kept in this browser only, so the
 * page can still be demonstrated end to end without pretending a request
 * succeeded.
 */

import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, WAITLIST_TABLE, CONSENT_TEXT } from "./config.js";

const KEY = "ruyi.waitlist";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function mountWaitlist() {
  const forms = [...document.querySelectorAll("[data-waitlist]")];
  const joined = readJoined();

  for (const form of forms) {
    const note = form.querySelector("[data-waitlist-note]");
    if (joined) done(form, note, joined, true);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (form.classList.contains("is-done")) return;

      const data = Object.fromEntries(new FormData(form).entries());
      if (data.company) return; // a bot filled the hidden field

      const name = String(data.name || "").trim();
      if (name.length < 2) {
        fail(note, "What should we call you?");
        form.querySelector('input[name="name"]').focus();
        return;
      }

      const email = String(data.email || "").trim();
      if (!EMAIL.test(email)) {
        fail(note, "That does not look like an email address. Try again?");
        form.querySelector('input[type="email"]').focus();
        return;
      }

      const record = {
        name,
        email,
        role: String(data.role || "").trim() || null,
        field: String(data.field || "").trim() || null,
        consent_text: CONSENT_TEXT,
        marketing_consent: data.updates === "on",
      };

      const button = form.querySelector("button[type=submit]");
      const label = button.textContent;
      button.disabled = true;
      button.textContent = "Sending…";

      const result = await send(record);

      button.textContent = label;
      button.disabled = false;

      if (result === "error") {
        fail(note, "That did not go through. Try once more, or write to us directly.");
        return;
      }

      const stored = { name, email, at: Date.now() };
      try {
        localStorage.setItem(KEY, JSON.stringify(stored));
      } catch {
        // private browsing; the confirmation below still stands
      }

      for (const f of forms) {
        done(f, f.querySelector("[data-waitlist-note]"), stored, result === "duplicate");
      }
    });
  }
}

/** @returns {Promise<"sent" | "duplicate" | "error">} */
async function send(record) {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return "sent";

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${WAITLIST_TABLE}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        "content-type": "application/json",
        prefer: "return=minimal",
      },
      body: JSON.stringify({ ...record, source: location.origin + location.pathname }),
    });

    if (res.ok) return "sent";
    // the unique index on the address, which is not a failure worth showing
    if (res.status === 409) return "duplicate";
    return "error";
  } catch {
    return "error";
  }
}

function fail(note, message) {
  note.dataset.tone = "bad";
  note.textContent = message;
}

function done(form, note, record, restored) {
  const first = String(record.name || "").trim().split(/\s+/)[0];
  form.classList.add("is-done");
  for (const control of form.elements) control.disabled = true;
  note.dataset.tone = "ok";
  note.textContent = restored
    ? `You are already on the list${first ? `, ${first}` : ""}.`
    : `You are on the list${first ? `, ${first}` : ""}. One note when the beta opens.`;
}

function readJoined() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;

    const record = JSON.parse(raw);
    const name = String(record?.name || "").trim();
    const email = String(record?.email || "").trim();
    if (name.length >= 2 && EMAIL.test(email)) return { ...record, name, email };

    // Signups made before the name field existed cannot produce the new
    // confirmation and used to leave the form looking broken and uneditable.
    localStorage.removeItem(KEY);
    return null;
  } catch {
    return null;
  }
}
