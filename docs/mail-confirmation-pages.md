# Email confirmation pages

Prepared for review; not deployed. The public `/mail-actions` page completes
verification, password reset and email-change confirmation against this app's
own canonical PocketBase backend. It never exposes the administration UI.

Email tokens travel in the URL fragment, are removed from browser history after
hydration and remain only in component memory. Confirmation requires an explicit
form submission; link scanning and page loads do not consume a token. Browser
requests use only same-origin `/api/v1/mail-actions`. The server validates exact
Origin, JSON size, action and collection allowlists, then delegates signature,
expiry and one-time-token validation to PocketBase. No session is minted or saved.
Sandbox selection is not accepted. Responses and logs omit credentials and
upstream error bodies. Lost responses are reported as unconfirmed, without retries.

English, Arabic and French copy is complete. The confirmation route has noindex
metadata and no-referrer policy; brand confirmation pages use a standalone layout
outside the marketing/analytics shell. Existing users, collections, database
schema, credentials, session cookies and admin routing are unchanged.

After owner approval, deploy the reviewed GitHub revision through the registered
app command. Verify the page and same-origin API before applying the companion
operations template-link change after its restored checkpoint. Do not expose `/_/`
or switch templates before the new handler is live. Existing default links do not
become functional merely because this branch exists.
