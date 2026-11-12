import { useSyncExternalStore } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { applyUpdate, canInstall, hasUpdate, installApp, offlineStatus, subscribe } from './services';

export function AppSettings() {
  const update = useSyncExternalStore(subscribe, hasUpdate);
  const install = useSyncExternalStore(subscribe, canInstall);
  const status = useSyncExternalStore(subscribe, offlineStatus);
  return <section className="panel app-settings">
    <h3>App</h3><p role="status">{status}</p>
    {update && <button onClick={applyUpdate}><RefreshCw size={16}/> Restart to update</button>}
    {install && <button onClick={() => void installApp()}><Download size={16}/> Install Cubing</button>}
    {!install && !matchMedia('(display-mode: standalone)').matches &&
      <p>To install, choose Add to Home Screen or Install app in your browser menu. In Safari, open the Share menu first.</p>}
  </section>;
}
