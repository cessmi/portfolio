
import { useEffect, useMemo, useState } from 'react';
import { Howl, Howler } from 'howler';

// --- Singletons ---------------------------------------------------------
let bgm; // background music instance
const sfx = {}; // sound effects cache

const getBGM = () => {
  if (!bgm) {
    bgm = new Howl({
      src: ['/sounds/bgm.mp3'], // place your music here
      loop: true,
      volume: 0.45,
      html5: true,
      preload: true,
    });
  }
  return bgm;
};

const getSfx = (name) => {
  if (!sfx[name]) {
    // Map names to files here
    const map = {
    //   glitch: '/sounds/glitch.wav',
      hover: '/sounds/hover.wav',
      click: '/sounds/click.wav',
    };
    const src = map[name];
    if (!src) return null;
    sfx[name] = new Howl({ src: [src], volume: 0.8, preload: true });
  }
  return sfx[name];
};

// --- Public API ---------------------------------------------------------
export function playSfx(name) {
  const snd = getSfx(name);
  if (snd) snd.play();
}

export function playBGM() {
  const music = getBGM();
  if (!music.playing()) music.play();
}

export function pauseBGM() {
  const music = getBGM();
  if (music.playing()) music.pause();
}

export function toggleBGM() {
  const music = getBGM();
  if (music.playing()) music.pause(); else music.play();
}

export function setBGMVolume(v) {
  const music = getBGM();
  music.volume(Math.min(1, Math.max(0, v)));
}

// --- UI control: a small button that toggles BGM ------------------------
export function SoundToggleButton({ className = '' }) {
  const music = useMemo(() => getBGM(), []);
  const [on, setOn] = useState(false);

  // keep UI in sync if playback changes elsewhere
  useEffect(() => {
    const f = () => setOn(music.playing());
    music.on('play', f); music.on('pause', f); music.on('stop', f); music.on('end', f);
    return () => { music.off('play', f); music.off('pause', f); music.off('stop', f); music.off('end', f); };
  }, [music]);

  const handleClick = () => {
    // First user gesture will allow autoplay policies
    if (music.playing()) music.pause(); else music.play();
  };

  return (
    <button type="button" className={className} onClick={handleClick} title={on ? 'Mute' : 'Play music'}>
      {on ? '🔊' : '🔇'}
    </button>
  );
}