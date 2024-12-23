interface GaEventI {
  event: string;
  params: object;
}

export function gaEvent({ event, params }: GaEventI) {
  const eventParams = process.env.REACT_APP_LOCAL
    ? { ...params, debug_mode: true }
    : params;

  if (window.gtag) {
    window.gtag("event", event, eventParams);
  }

  return;
}
