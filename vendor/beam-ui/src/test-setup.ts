// jsdom does not implement window.matchMedia; this stub satisfies any code
// that reads it at module init time (e.g. Zustand stores that check the
// system color-scheme preference).
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  } as MediaQueryList),
});
