import { useEffect, useState } from 'react';
import type { Frame } from './recorder';

type Playback = { index: number; playing: boolean; turning: boolean; began: number };

export function useReplay(frames: Frame[]) {
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [intervalMs, setIntervalMs] = useState(1000);
  const last = frames.length - 1;
  const index = playback?.index ?? last;
  const seek = (index: number) => setPlayback({ index, playing: false, turning: false, began: 0 });
  const live = () => setPlayback(null);
  const play = () => {
    if (!last) return;
    setPlayback({ index: index === last ? 0 : index, playing: true, turning: true, began: performance.now() });
  };
  const pause = () => seek(index);
  const finishTurn = () => setPlayback(current => {
    if (!current?.turning) return current;
    const next = current.index + 1;
    return { ...current, index: next, playing: next < last, turning: false };
  });
  useEffect(() => {
    if (!playback?.playing || playback.turning) return;
    const wait = Math.max(0, playback.began + intervalMs - performance.now());
    const timer = window.setTimeout(() => setPlayback(current =>
      current === playback ? { ...current, turning: true, began: performance.now() } : current
    ), wait);
    return () => window.clearTimeout(timer);
  }, [playback, intervalMs]);
  return {
    index, reviewing: playback !== null, playing: playback?.playing ?? false, intervalMs, setIntervalMs,
    cube: frames[index].cube, turns: playback?.turning ? frames[index + 1].turns : null,
    seek, live, play, pause, finishTurn,
  };
}
