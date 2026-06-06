---
name: bats-shell-testing
title: Bats Testing Patterns
description: Master Bash Automated Testing System (Bats) for comprehensive shell script testing. Use when writing tests for shell scripts, CI/CD pipelines, or requiring test-driven development of shell utilities.
domain: 研发/testing
triggers: [bats-core]
tags: [bats, shell, tdd, bash, ci, fixtures, tap]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [posix-shell-scripting, bash-defensive-patterns, shellcheck-linting, test-coverage-gap-finder]
combines_with: [ci-cd-pipeline-builder, git-hooks-automation]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# Bats Testing Patterns

Comprehensive guidance for writing comprehensive unit tests for shell scripts using Bats (Bash Automated Testing System), including test patterns, fixtures, and best practices for production-grade shell testing.

## Use this skill when

- Writing unit tests for shell scripts
- Implementing TDD for scripts
- Setting up automated testing in CI/CD pipelines
- Testing edge cases and error conditions
- Validating behavior across shell environments

## Do not use this skill when

- The project does not use shell scripts
- You need integration tests beyond shell behavior
- The goal is only linting or formatting

## Instructions

- Confirm shell dialects and supported environments.
- Set up a test structure with helpers and fixtures.
- Write tests for exit codes, output, and side effects.
- Add setup/teardown and run tests in CI.
- If detailed examples are required, open `resources/implementation-playbook.md`.

## Resources

- `resources/implementation-playbook.md` for detailed patterns and examples.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
