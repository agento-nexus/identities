# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Executive identity definitions for Agento Nexus. Community-contributable personality files that define how AI executives think, communicate, and relate to each other.

## Structure

- `executives/` — `.identity.toml` soul files (one per executive)
- `teams/` — `.team.toml` team configurations (governance, members, collaboration patterns)
- `hands/` — Hand manifest TOMLs (agent definitions for FangBox execution)
- `workflows/` — Fleet DAG workflow JSONs
- `schema/` — Zod schema reference for validation

## Identity Format

See the executive-identity-spec.md in the agento-nexus org root docs/ for the full TOML format specification.
