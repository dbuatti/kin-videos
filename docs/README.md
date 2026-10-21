# FNH Hub (web)

This folder is published as a GitHub Pages site and served from
`hub.functional-neuro-health.mykajabi.com`.

It exists so the hub can be reached from an address Kajabi allows to frame
the course pages. Kajabi's course pages send:

    content-security-policy: frame-ancestors 'self' … *.mykajabi.com

so only a page on a `*.mykajabi.com` origin can put the real Kajabi course
inside a frame. The community sends `frame-ancestors *` and works from any
http/https address.

`index.html` is the whole hub — one file, no build step, no dependencies.
To update it, copy the current `FNH_Hub.html` from the FNH library over
`docs/index.html` and commit.
