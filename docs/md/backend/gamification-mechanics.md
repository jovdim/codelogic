# Game Rules (XP, Hearts, Streaks)

Exactly how the numbers work.

## XP (Experience Points)

You earn XP by answering questions right.

- **Each correct answer:** 10 XP (the default `xp_reward` on each question — an admin can change it per question)
- **Perfect score on a quiz:** +50 bonus
- **No hearts lost during a quiz:** +25 bonus
- **Wrong answer:** 0 XP

**Example:** You get 9 out of 10, losing 1 heart → `9 × 10 = 90 XP`. No bonuses.

**Example:** 10 out of 10, no hearts lost → `10 × 10 + 50 + 25 = 175 XP`.

## Level

Your level is based on total XP.

```
level = 1 + (total_xp ÷ 500)
```

So:
- 0–499 XP → Level 1
- 500–999 XP → Level 2
- 1000–1499 XP → Level 3
- ...and so on.

The level updates automatically whenever XP changes.

## Hearts (Lives)

- Start with **10 hearts** (the max).
- Lose **1 heart** for each wrong answer.
- Get **1 heart** back every **2 minutes**.
- At 0 hearts, you **cannot start** a new quiz until one comes back.

The refill check runs when you:
- Load your profile, or
- Start a quiz.

So just opening the site refreshes them. You don't need to wait on a page.

## Streak (Days in a Row)

Every day you play, the streak goes up by 1. Miss a day, it resets.

- Played **today**? No change today.
- Played **yesterday**? +1.
- Missed a day? Reset to 1.

Your **longest streak** is separate — it only goes up and stays there.

## Stars

After passing a level, you get 1, 2, or 3 stars:

| Score | Stars |
|---|---|
| 100% | ⭐⭐⭐ |
| 80%–99% | ⭐⭐ |
| 50%–79% | ⭐ |
| Below 50% | Fail (no stars, no level unlock) |

If you play a level again, you keep the best stars.

## Level Unlock

You unlock the next level by **passing** (50% or more) the current one. Fail → you can retry, but you don't advance.

## Certificate

You earn a certificate when you have **passed all levels of a topic** (`highest_level_completed >= total_levels`, default 15).

Each certificate has a unique code: `CL-<TOPIC4>-<HEX8>`
- `TOPIC4` = first 4 letters of the topic slug
- `HEX8` = 8 random hex characters

Example: `CL-JAVA-A1B2C3D4`

## Daily Challenges

Three challenges per day. They reset at midnight (Asia/Manila time).

1. **Quick Learner** — complete 3 quizzes today. +150 XP
2. **Perfect Score** — get 100% on any quiz. +200 XP
3. **Streak Master** — get 5 correct in a row in one quiz. +100 XP

## Leaderboard

Top 15 players, ranked by XP. Ties broken by current streak.

**Admin accounts are hidden** from the leaderboard.

## Summary Table

| Thing | Formula |
|---|---|
| Base XP | 10 per correct answer |
| Perfect bonus | +50 |
| No-hearts-lost bonus | +25 |
| Level | `1 + xp ÷ 500` |
| Heart regen | 1 per 2 minutes |
| Max hearts | 10 |
| Pass threshold | 50% |
| Total levels per topic | 15 (editable) |
| Stars | 3 = 100%, 2 = 80%+, 1 = passed |
| Certificate | Finish all levels of a topic |
