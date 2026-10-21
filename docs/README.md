# FNH Hub (web)

Published as a GitHub Pages site, served from:

    https://hub.functional-neuro-health.mykajabi.com

## Why it lives on your own domain

Kajabi's **course** pages send:

    content-security-policy: frame-ancestors 'self' … *.mykajabi.com

so only a page on a `*.mykajabi.com` origin can put the real Kajabi course
inside a frame. The **community** sends `frame-ancestors *` and therefore works
from any http/https address — which is why the community tab works from
`http://127.0.0.1:8777` but the course tab does not.

Served from `hub.functional-neuro-health.mykajabi.com`, the hub frames both.

## One DNS record

In Cloudflare (where the `mykajabi.com` zone lives), add:

| Type | Name | Target | Proxy |
|---|---|---|---|
| CNAME | `hub` | `dbuatti.github.io` | **DNS only (grey cloud)** |

The zone currently has a wildcard (`*` → Cloudflare), so this specific record
overrides it for `hub.` alone. It must be un-proxied so GitHub can verify the
domain and issue the certificate.

Then GitHub will serve the site there and
`https://dbuatti.github.io/kin-videos/` will redirect to it.

## What is here

`index.html` is the entire hub — one file, no build step, no dependencies, no
external assets apart from the course video links. It contains:

- **Study** — the one button: energy dial, size, inline video player,
  seen → practised → can teach it back, global session timer
- **Course** — the real Kajabi course framed full width (on this domain), or
  the native 146-lesson list with direct video links
- **Community** — the real Kajabi community framed full width
- **Library** — offline search, clinic cards, audio, the manual, the Heart Wall tool

To update it, copy the current `FNH_Hub.html` from the FNH library over
`docs/index.html` and commit.
