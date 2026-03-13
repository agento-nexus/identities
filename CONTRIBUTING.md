# Contributing an Executive Identity

This guide explains how to create a new AI executive identity for Agento Nexus.

## Overview

Each executive is defined by a `.identity.toml` soul file in the `executives/` directory. The soul file captures who the executive **is** — their mission, values, communication style, decision-making patterns, domain expertise, and relationships with other executives.

## Quick Start

1. Copy an existing identity file as a template:
   ```bash
   cp executives/strategy-executive.identity.toml executives/your-executive.identity.toml
   ```

2. Edit the file following the structure below.

3. Validate the TOML syntax (any TOML linter works).

4. Open a pull request with your new identity file.

## Identity File Structure

Every `.identity.toml` file has these sections:

### Top-Level Fields

```toml
version = "1.0.0"
executive_name = "Your Executive Name"
title = "Chief Something Officer"
```

- `version` — Schema version. Use `"1.0.0"` for new identities.
- `executive_name` — Display name. Must be unique across all identities.
- `title` — The executive's C-suite title.

### `[soul]` — Mission and Values

```toml
[soul]
mission = "One-line purpose statement — why this executive exists on the team"
core_values = [
  "First and most important value",
  "Second value",
  "Third value",
]
red_lines = [
  "Something this executive will never do or endorse",
]
worldview = "What this executive believes about their domain and the world"
```

- `core_values` — 1 to 7 values, ordered by priority (first = most important).
- `red_lines` — Non-negotiable principles. These override everything else.
- `worldview` — Optional but recommended. Shapes how the executive frames problems.

### `[voice]` — Communication Style

```toml
[voice]
style = "ANALYTICAL"
tone_descriptors = ["measured", "evidence-driven", "strategic"]
signature_phrases = [
  "A phrase this executive tends to use",
]
verbosity = 0.6
assertiveness = 0.7
```

- `style` — One of: `ANALYTICAL`, `DIRECTIVE`, `COLLABORATIVE`, `VISIONARY`, `PRAGMATIC`.
- `tone_descriptors` — 1 to 5 adjectives describing the executive's tone.
- `signature_phrases` — Optional recurring phrases that give the executive a distinctive voice.
- `verbosity` — 0.0 (terse) to 1.0 (expansive). Default: 0.5.
- `assertiveness` — 0.0 (only speaks when asked) to 1.0 (proactively challenges everything). Default: 0.5.

### `[decision_style]` — Reasoning Patterns

```toml
[decision_style]
risk_disposition = "RISK_BALANCED"
time_horizon_bias = "LONG_TERM"
evidence_threshold = 0.65
consensus_orientation = 0.4
framework_affinities = ["porters_five_forces", "bayesian"]
known_biases = ["anchoring_on_market_size_estimates"]
```

- `risk_disposition` — One of: `RISK_AVERSE`, `RISK_CAUTIOUS`, `RISK_BALANCED`, `RISK_TOLERANT`, `RISK_SEEKING`.
- `time_horizon_bias` — One of: `IMMEDIATE`, `SHORT_TERM`, `MEDIUM_TERM`, `LONG_TERM`, `VISIONARY`.
- `evidence_threshold` — 0.0 (intuition-driven) to 1.0 (demands exhaustive proof). Default: 0.6.
- `consensus_orientation` — 0.0 (fully independent thinker) to 1.0 (strongly consensus-seeking). Default: 0.5.
- `framework_affinities` — Decision frameworks this executive prefers (e.g., `bayesian`, `wardley_mapping`, `scenario_planning`).
- `known_biases` — Cognitive biases the executive is prone to, used for self-correction.

### `[skills]` — Domain Expertise

```toml
[skills]
industry_experience = ["technology", "SaaS", "platform_businesses"]
methodologies = ["scenario_planning", "OKR"]

[[skills.domains]]
domain = "strategic_planning"
level = "EXPERT"
specializations = ["long_range_scenarios", "mission_alignment"]

[[skills.domains]]
domain = "competitive_positioning"
level = "ADVANCED"
specializations = ["differentiation", "market_entry"]
```

- `level` — One of: `NOVICE`, `BASIC`, `PROFICIENT`, `ADVANCED`, `EXPERT`.
- Include at least one domain. More domains = broader expertise but consider realistic depth.

### `[[relationships]]` — Peer Dynamics

```toml
[[relationships]]
executive_name = "Risk Executive"
affinity = "CHALLENGER"
alignment_domains = ["due_diligence", "scenario_planning"]
tension_domains = ["market_expansion", "resource_commitment"]
preferred_resolution = "EVIDENCE_BASED"
```

- `affinity` — One of: `STRONG_ALLY`, `ALLY`, `NEUTRAL`, `CHALLENGER`, `STRONG_CHALLENGER`.
- `preferred_resolution` — One of: `EVIDENCE_BASED`, `WEIGHTED_VOTING`, `DELPHI_METHOD`, `COMPROMISE`, `INTEGRATIVE`, `ESCALATION`, `STRUCTURED_DEBATE`, `DIALECTICAL_INQUIRY`.
- Define relationships with existing executives to create realistic team dynamics.

## Design Guidelines

1. **Be opinionated.** Executives with strong, distinct viewpoints create better deliberation. A "balanced on everything" executive adds little value.

2. **Create productive tension.** The best teams have executives who challenge each other. Define `CHALLENGER` relationships where worldviews genuinely differ.

3. **Ground in reality.** Model your executive after real-world archetypes. A CFO who is risk-seeking with a visionary time horizon is unlikely — unless that contrast is intentional and explained in the worldview.

4. **Red lines matter.** These are what make executives trustworthy. An ethics executive without red lines is not an ethics executive.

5. **Signature phrases create voice.** Two or three distinctive phrases go a long way toward making the executive feel like a real person in deliberation transcripts.

6. **Relationships are bidirectional.** If Executive A lists Executive B as a `CHALLENGER`, Executive B should also reference Executive A (though the affinity level can differ — asymmetric relationships are realistic).

## File Naming Convention

Use kebab-case with the `.identity.toml` extension:
```
your-role-executive.identity.toml
```

Examples: `strategy-executive.identity.toml`, `sustainability-officer.identity.toml`, `chief-product-officer.identity.toml`.

## Validation

Identity files are validated at runtime against the Zod schemas in `schema/identity.ts`. The key constraint is that TOML uses `snake_case` keys while the schema uses `camelCase` — the loader handles this conversion automatically.

## Questions?

Open an issue in the `agento-nexus/identities` repo or start a discussion thread.
