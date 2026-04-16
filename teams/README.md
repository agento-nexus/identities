# teams/

Git-tracked source for **authored team queries**. Each `*.team-query.toml`
file is one saved tag-filter that materialises a team from the persona
graph at runtime.

## Why queries, not rosters

The old `*.team.toml` files carried fixed member lists plus governance
parameters. They drifted from the platform immediately: eight named
teams produced "template fatigue" (users default to two or three they
trust), and the hardcoded rosters couldn't respond to new personas
being added.

v2 treats teams as **queries over the persona tag graph**. Every
persona in `../executives/` carries tags across three axes:

- `film_caper` — narrative archetype (10 values)
- `craft_room` — mode of work (18 values)
- `city_energy` — cultural operating tempo (14 values)

A team-query combines one or more axis filters. Calling
"Basel's Eleven / Forge / Tokyo" materialises the set of personas
that carry all three tags.

## What's in this folder

Only the **10 Film Caper** queries are persisted as TOML here — the
narrative-visible layer users are most likely to author, version, and
share across tenants.

Craft Rooms (18) and City Energies (14) live in the DB only. Compound
queries ("Basel's Eleven / Forge / Tokyo") are authored through the
platform UI summoner and stored per tenant.

## Schema

```toml
slug         = "basels-eleven"
display_name = "Basel's Eleven"
description  = "Heist ensemble — specialists converge on one impossible job."
summon_line  = "Pull a Basel's Eleven"

[filter]
film_caper  = "basels-eleven"   # optional
craft_room  = null               # optional — null means no filter on this axis
city_energy = null               # optional

[tier_filter]
# Empty list = all tiers. Restrict with e.g. ["council", "atelier"].
tiers = []
```

At seed time, `prisma/seed-personas.ts` reads these and upserts the
`TeamQuery` rows in the platform DB.
