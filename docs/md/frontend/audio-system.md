# Music and Sound

The site has background music and sound effects. Both can be turned on and off.

## Files

All audio lives in `public/sound-effects/`:

| File | Used for |
|---|---|
| `background-music.mp3` | The loop that plays while the user browses. |
| `mouse-click-sound-effect.mp3` | Plays on every button click. |
| `correct-answer-sound-effect.mp3` | Plays after a correct answer. |
| `wrong-answer-sound-effect.mp3` | Plays after a wrong answer. |
| `Level complete.mp3` | Plays at the end of a passing quiz. |
| `Level failed.mp3` | Plays at the end of a failing quiz. |

## Background Music

File: `src/hooks/useBackgroundMusic.ts`

**Key points:**

- There's just **one** audio element shared across all pages (a singleton). So the music keeps playing when you click around.
- The on/off choice is saved in `localStorage` (`bg-music-playing`).
- Browsers block autoplay. If the page opens and autoplay fails, the hook waits for the first click or keypress, then tries again.

Use it in a component like this:

```tsx
const { isPlaying, toggle } = useBackgroundMusic();
<button onClick={toggle}>{isPlaying ? "🔊" : "🔇"}</button>
```

## Sound Effects

File: `src/hooks/useSoundEffects.ts`

Use it like this:

```tsx
const { play, setEnabled } = useSoundEffects();
play("correct");
play("wrong");
play("levelComplete");
```

Available sounds:

- `correct` — MP3
- `wrong` — MP3
- `click` — MP3
- `levelComplete` — MP3
- `levelFailed` — MP3
- `lessonAdvance` — MP3 (uses click sound)
- `heartLost` — synth tones (three notes descending)
- `timerTick` — synth tone (a short tick)
- `countdown` — two synth beeps

All volumes default to `0.7`.

## Global Click Sound

File: `src/components/GlobalClickSound.tsx`

Added once in the root layout. It listens for clicks on **any button anywhere** and plays the click sound. You don't need to wire it up page by page.

## Music Button Placement

The music on/off button is in both the `Navbar` (public pages) and `Sidebar` (private pages). The state is shared so toggling in one spot updates the other.
