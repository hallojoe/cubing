import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function Drawer({ title, onClose, children, history = false }: {
  title: string; onClose: () => void; children: ReactNode; history?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current!;
    const opener = document.activeElement as HTMLElement | null;
    element.showModal();
    return () => { element.close(); opener?.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={dialog} className={'control-drawer' + (history ? ' history-drawer' : '')}
    aria-labelledby="drawer-title" onCancel={onClose} onClick={e => {
      if (e.target !== e.currentTarget) return;
      const bounds = e.currentTarget.getBoundingClientRect();
      if (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) onClose();
    }}>
    <div className="drawer-header"><h2 id="drawer-title">{title}</h2>
      <button type="button" autoFocus className="icon-button" aria-label={'Close ' + title} onClick={onClose}><X size={20}/></button>
    </div>
    {children}
  </dialog>;
}
