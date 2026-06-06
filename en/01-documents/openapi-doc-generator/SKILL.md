---
name: openapi-doc-generator
title: OpenAPI 3.1 API Documentation Generator
description: Use when authoring or rewriting specs for REST/event-driven APIs and building interactive developer docs and portals; produces OpenAPI 3.1/AsyncAPI specs with examples and auth flows, interactive docs, multi-language SDKs, and testable examples. Not for tasks with no API surface,
domain: 文书/writing
triggers: [author OpenAPI spec, API documentation, OpenAPI 3.1, AsyncAPI, Swagger UI, Redoc, generate SDK, developer portal, API reference, auth flow docs, webhook documentation, API migration guide]
tags: [writing, openapi, api-docs, sdk, developer-experience, technical-writing]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [technical-reference-builder, api-design-principles, docs-architect, rest-api-endpoint-builder]
combines_with: [api-design-principles, code-tutorial-engineer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

Use this skill when:

- Creating or updating OpenAPI 3.1 / AsyncAPI specifications (REST, event-driven, real-time APIs).
- Building developer portals, SDK docs, or onboarding flows.
- Improving API documentation quality, accuracy, and discoverability.
- Generating multi-language code examples or SDKs from API specs.

Do not use this skill when:

- You only need a quick internal note or informal summary.
- The task is pure backend implementation without outward-facing docs.
- There is no API surface or spec to document.

## Steps

1. **Identify target users, API scope, and documentation goals** — confirm the developer personas and the "time-to-first-success" you are optimizing for.
2. **Create or validate the specification** — add request/response examples, error codes, and auth flows, then validate against the schema.
3. **Build interactive docs** (Swagger UI / Redoc / Stoplight) and ensure accuracy with contract tests so examples actually run and stay consistent with the implementation.
4. **Plan maintenance** — versioning strategy, breaking-change migration guides, deprecation timelines, and changelog automation.

## Instructions

- Prefer **OpenAPI 3.1** (full JSON Schema support) for the spec; use **AsyncAPI** for event-driven APIs and GraphQL **SDL** for GraphQL.
- Every endpoint must include a working example (with curl), typical error responses, and the auth method. Security schemes (OAuth 2.0 / OpenID Connect / API Key / JWT) get runnable examples and refresh mechanisms.
- Follow **docs-as-code**: keep docs in Git, wire CI/CD for automated validation and deployment.
- Examples and snippets must be automatically tested (responses validated against schema, curl commands executable) to prevent docs from drifting from the implementation.
- Webhook docs must include payload examples plus signature verification / security notes.
- Favor practical, working examples over theoretical descriptions; use progressive disclosure to balance comprehensiveness with conciseness.

## Example

Validate and lint a spec, then generate SDKs:

```bash
# Lint with Spectral + Redocly
npm install -g @stoplight/spectral-cli @redocly/cli
spectral lint openapi.yaml
redocly lint openapi.yaml
redocly bundle openapi.yaml -o bundled.yaml
redocly preview-docs openapi.yaml

# Generate multi-language SDKs from the spec
npm install -g @openapitools/openapi-generator-cli
openapi-generator-cli generate -i openapi.yaml -g typescript-fetch \
  -o ./generated/typescript-client \
  --additional-properties=supportsES6=true,npmName=@myorg/api-client
openapi-generator-cli generate -i openapi.yaml -g python \
  -o ./generated/python-client --additional-properties=packageName=api_client
openapi-generator-cli generate -i openapi.yaml -g go -o ./generated/go-client
```

Minimal OpenAPI 3.1 skeleton with a JWT security scheme:

```yaml
openapi: 3.1.0
info:
  title: User Management API
  version: 2.0.0
servers:
  - url: https://api.example.com/v2
    description: Production
paths:
  /users:
    get:
      operationId: listUsers
      summary: List all users
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema: { $ref: '#/components/schemas/UserListResponse' }
      security:
        - bearerAuth: []
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token from /auth/login
security:
  - bearerAuth: []
```

Representative requests:

- "Create a comprehensive OpenAPI 3.1 specification for this REST API with authentication examples."
- "Generate SDKs in Python, JavaScript, and Go from this OpenAPI spec."
- "Design a migration guide for developers upgrading from API v1 to v2."
- "Create webhook documentation with security best practices and payload examples."
- "Build automated testing for all code examples in our API documentation."

## Notes

- Do not treat the output as a substitute for environment-specific validation, testing, or expert review; verify the spec in a real environment before shipping.
- Stop and ask for clarification if required inputs (target audience, API scope, auth method, success criteria) or permission/safety boundaries are missing.
- Use this skill only when the task clearly matches the scope above.
- Treat documentation as a product: build feedback loops, iterate continuously, and optimize for discoverability (SEO/search) and accessibility.

**Do's:** use `$ref` to reuse schemas/parameters/responses; add real-world examples; document all error codes; version the API (URL or header); use semantic versioning for spec changes.

**Don'ts:** generic descriptions; skipping security schemes; forgetting `nullable`; mixing naming styles; hardcoding URLs instead of server variables.

## See also

- Technical writing / documentation style-guide skills (writing domain).
- API design and contract-driven development skills (`api-design-principles`, `rest-api-endpoint-builder`).
- CI/CD and docs-as-code automated deployment skills.
- `technical-reference-builder`, `docs-architect`, `code-tutorial-engineer`.
