const target = new EventTarget();

export function emitNetworkError() {
  target.dispatchEvent(new Event('network-error'));
}

export function emitNetworkRecovered() {
  target.dispatchEvent(new Event('network-recovered'));
}

export function subscribeNetworkStatus({ onError, onRecovered }) {
  target.addEventListener('network-error', onError);
  target.addEventListener('network-recovered', onRecovered);

  return () => {
    target.removeEventListener('network-error', onError);
    target.removeEventListener('network-recovered', onRecovered);
  };
}
