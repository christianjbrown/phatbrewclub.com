# phatbrewclub.com

Rebuild of phatbrewclub.com, moving off the Square Online (Weebly) builder onto a
self-hosted Payload CMS with a Next.js front end, running locally on Kubernetes.

## Layout

| Path | What |
|---|---|
| `apps/web` | Next.js public site |
| `apps/cms` | Payload CMS admin + REST/GraphQL API |
| `mocks/` | Phase 2 static mockups (14 pages, real brand assets) |
| `scripts/` | Asset harvest/download, mock build, screenshots, a11y audit |
| `k8s/` | kind cluster config, Kustomize base + local overlay |
| `assets/` | Harvest manifest; originals are gitignored (70 MB) |

## Local development

Everything is pinned to the local kind cluster. Source the env first so no
command can reach a remote cluster:

    source .envrc.local

Recreate the assets (originals are not committed):

    node scripts/harvest-assets.mjs
    node scripts/download-assets.mjs

Mocks are served from the workspace `launch.json` entry `phatbrew-mocks` on port 8770.

    node scripts/build-mocks.mjs
    node scripts/shoot-mocks.mjs
    node scripts/a11y.mjs

## Notes

Brand assets are the client's own, retrieved from their existing site for the
rebuild. Instagram imagery on the current homepage is a social embed rather than
hosted media and is not mirrored here.
