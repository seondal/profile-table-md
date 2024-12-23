interface GaEventI {
  event: string;
  params: object;
}

export function gaEvent({ event, params }: GaEventI) {
  const eventParams = process.env.REACT_APP_LOCAL
    ? { ...params, debug_mode: true }
    : params;

  console.log(process.env.REACT_APP_LOCAL);
  if (window.gtag) {
    window.gtag("event", event, eventParams);
  }

  return;
}
