
declare global {
  interface Window {
    YT: {
      Player: any;
      get: (id: string) => any;
    };
  }
}

export {};
