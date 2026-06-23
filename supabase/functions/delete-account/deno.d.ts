export {};

declare global {
  const Deno: {
    readonly env: {
      get(name: string): string | undefined;
    };
    serve(
      handler: (request: Request) => Response | Promise<Response>
    ): void;
  };
}
