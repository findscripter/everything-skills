---
name: zoom-oauth-setup
title: /setup-zoom-oauth
description: Implement Zoom authentication correctly. Use when setting up app credentials, choosing an OAuth grant, requesting scopes, handling token refresh, or debugging auth failures.
domain: 平台/integration
triggers: [Zoom OAuth, access token, refresh token, account_credentials, authorization_code, PKCE, 4709, 4735, S2S OAuth, Zoom scope]
tags: [zoom, oauth, authentication, access-token, refresh-token, pkce, s2s-oauth, scopes, integration, platform]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [zoom-webhooks-setup, zoom-mcp-connectors, zoom-integration-planner, zoom-product-surface-selector]
combines_with: [zoom-meeting-app-builder, zoom-webhooks-setup]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
# /setup-zoom-oauth

Use this skill when auth is the blocker or when auth choices will shape the entire integration.

## Scope

- App type selection
- OAuth grant selection
- Scope planning
- Token exchange and refresh
- Auth debugging and environment assumptions

## Workflow

1. Determine the app model and who is authorizing whom.
2. Choose the correct grant flow.
3. Identify minimum scopes for the user flow.
4. Define token storage and refresh behavior.
5. Route into the deepest relevant reference docs only after the above is clear.

## Primary References

- [oauth](../oauth/SKILL.md)
- [general](../general/SKILL.md)
- [rest-api](../rest-api/SKILL.md)

## Common Mistakes

- Picking a grant before clarifying the actor and tenant model
- Asking for broad scopes before confirming the exact workflow
- Forgetting refresh-token behavior and token lifecycle handling
- Reusing an old refresh token after a successful refresh instead of storing the newly returned one
- Treating auth failures as API failures without checking app configuration first
