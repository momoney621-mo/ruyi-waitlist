/**
 * Everything that changes between deployments, in one file.
 *
 * Nothing here is a secret. The Supabase publishable key is designed to sit in
 * a public page: it can only do what the table's row-level security policies
 * allow, and `supabase/schema.sql` allows exactly one thing — appending a row
 * to the waitlist. The secret key must never appear in this file.
 *
 * The operator fields are blank on purpose. Several of the disclosures on this
 * site (a contact address for privacy requests, a postal address for email) are
 * legal requirements rather than decoration, so the page says plainly that they
 * are missing rather than inventing them.
 */

export const SUPABASE_URL = "";
export const SUPABASE_PUBLISHABLE_KEY = "";
export const WAITLIST_TABLE = "waitlist_signups";

export const OPERATOR = {
  /** The person or company that is legally responsible for the site. */
  name: "",
  /** Where privacy, deletion and accessibility requests are read. */
  email: "",
  /** A street address, registered PO box, or registered private mailbox. */
  postalAddress: "",
  /** The law and courts named in the terms, e.g. "California, USA". */
  jurisdiction: "",
  /** Shown on the policy pages, in ISO form. */
  effectiveDate: "2026-09-14",
};

/**
 * The exact sentence shown next to the signup. It is stored with each row so
 * there is a record of what a person actually agreed to, not a reconstruction.
 */
export const CONSENT_TEXT =
  "I am 16 or older and agree to the Terms and the Privacy Policy. Ruyi may email me about the private beta.";
