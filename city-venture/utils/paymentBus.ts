export type PaymentEvent = 'success' | 'cancel';

type Listener = (event: PaymentEvent) => void;

let listeners: Listener[] = [];

export function subscribePayment(listener: Listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function notifyPayment(event: PaymentEvent) {
  listeners.forEach((l) => l(event));
}
