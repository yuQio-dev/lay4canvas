# AGENTS.md

## Product boundary

- This project is a visual page builder inspired by the interaction model of FlutterFlow, not a clone.
- Do not copy FlutterFlow names, assets, screenshots, proprietary code, or distinctive UI composition.
- Preserve the product wedge: visual editing produces portable design intent for human and AI coding workflows.
- Keep the first release local-first and account-free. Do not add backend, auth, billing, hosting, or telemetry without an explicit product decision.

## Engineering

- Use TypeScript for application and tooling code.
- Keep document state serializable and versionable.
- Treat exported JSON and agent briefs as product surfaces with compatibility expectations.
- Prefer semantic HTML, keyboard operation, visible focus, and reduced-motion support.
- Add a test when changing serialization, migration, export, or layout semantics.

## Scope

- Scoped reversible edits, tests, commits, and local prototypes are allowed.
- Creating or publishing a remote repository, deploying a demo, changing credentials, or adding paid services requires explicit approval.
