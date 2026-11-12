import { useEffect, useRef } from 'react';
import { History, Pause, Play, Radio } from 'lucide-react';
import type { Frame } from './recorder';
import type { useReplay } from './useReplay';

type Props = { frames: Frame[]; replay: ReturnType<typeof useReplay>; busy: boolean };

export function HistoryPanel({ frames, replay, busy }: Props) {
  const list = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const row = list.current;
    const selected = row?.children[replay.index] as HTMLElement | undefined;
    if (row && selected) {
      if (selected.offsetLeft < row.scrollLeft) row.scrollLeft = selected.offsetLeft;
      else if (selected.offsetLeft + selected.offsetWidth > row.scrollLeft + row.clientWidth)
        row.scrollLeft = selected.offsetLeft + selected.offsetWidth - row.clientWidth;
    }
  }, [replay.index]);
  return <section className="history-panel" aria-label="Recorded frames">
    <div className="history-summary"><History size={19}/><strong>Move history</strong><span>{frames.length - 1} turns</span></div>
    <ol ref={list} className="frame-list">{frames.map((frame, i) =>
      <li key={i}><button disabled={busy} aria-current={replay.index === i ? 'step' : undefined}
        aria-label={`Frame ${i}, ${frame.label}`} onClick={() => replay.seek(i)}>
        <small>{String(i).padStart(2, '0')}</small>{frame.label}
      </button></li>)}</ol>
    <div className="transport">
      <button className="play" disabled={busy || frames.length < 2} onClick={replay.playing ? replay.pause : replay.play}>
        {replay.playing ? <Pause size={15}/> : <Play size={15}/>} {replay.playing ? 'Pause' : 'Play'}
      </button>
      <label>Interval <select value={replay.intervalMs} onChange={e => replay.setIntervalMs(Number(e.target.value))}>
        {[500, 750, 1000, 1500, 2000, 3000, 5000].map(ms => <option key={ms} value={ms}>{ms / 1000} s</option>)}
      </select></label>
      {replay.reviewing && <button onClick={replay.live}><Radio size={15}/> Back to live</button>}
    </div>
  </section>;
}
