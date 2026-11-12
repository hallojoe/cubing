type InstallPrompt = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> };

let prompt: InstallPrompt | null = null;
let registration: ServiceWorkerRegistration | undefined;
let restarting = false;
const change = new EventTarget();
const notify = () => change.dispatchEvent(new Event('change'));
let offlineReady = false;
let offlineError = false;

export function subscribe(listener: () => void) {
  change.addEventListener('change', listener);
  return () => change.removeEventListener('change', listener);
}
export const hasUpdate = () => Boolean(registration?.waiting);
export const canInstall = () => Boolean(prompt);
export const offlineStatus = () => offlineReady ? 'Ready for offline use' :
  offlineError ? 'Offline setup unavailable' : 'Preparing offline access…';

export async function installApp() {
  const event = prompt;
  if (!event) return;
  prompt = null;
  notify();
  await event.prompt();
  await event.userChoice;
}
export function applyUpdate() {
  if (!registration?.waiting) return;
  restarting = true;
  registration.waiting.postMessage('ACTIVATE');
}
export function startAppServices() {
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    prompt = event as InstallPrompt;
    notify();
  });
  window.addEventListener('appinstalled', () => { prompt = null; notify(); });
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    offlineError = true;
    return;
  }
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (restarting) window.location.reload();
  });
  const base = import.meta.env.BASE_URL;
  let registering = false;
  async function check() {
    if (registering || !navigator.onLine) return;
    registering = true;
    try {
      if (!registration) {
        registration = await navigator.serviceWorker.register(base + 'cubing-sw.js', {
          scope: base + 'app', updateViaCache: 'none'
        });
        const watch = () => {
          const worker = registration?.installing;
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'redundant' && !registration?.active) offlineError = true;
            notify();
          });
        };
        registration.addEventListener('updatefound', watch);
        watch();
        void navigator.serviceWorker.ready.then(() => { offlineReady = true; notify(); });
      }
      await registration.update();
    } catch {
      offlineError = true;
    } finally {
      registering = false;
      notify();
    }
  }
  // An already-installed app can start with no network.
  void navigator.serviceWorker.getRegistration().then(existing => {
    if (existing?.active) { offlineReady = true; notify(); }
  });
  void check();
  window.addEventListener('online', check);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void check();
  });
  window.setInterval(() => {
    if (document.visibilityState === 'visible') void check();
  }, 60 * 60 * 1000);
}
