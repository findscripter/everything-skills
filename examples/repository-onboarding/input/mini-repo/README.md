# Trail Notes — original synthetic fixture

A two-package Node.js workspace. The CLI summarizes three in-memory activity notes; core owns the calculation. There is no network, database, credential, or deployment.

Requires Node.js >=22. No npm install is needed: the CLI intentionally uses a relative import while package metadata records the workspace dependency.

```text
node --test test/core.test.mjs
node apps/cli/index.mjs
```

Expected CLI output: `{"count":3,"totalMinutes":60}`.
