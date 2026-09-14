/**
 * The policy pages need the operator's details and nothing else — no field,
 * no reveals, no scroll machinery. A document should render even if this
 * fails, so the call is guarded.
 */

import { mountLegal } from "./legal.js";

try {
  mountLegal();
} catch (err) {
  console.warn("site: legal details did not mount", err);
}
