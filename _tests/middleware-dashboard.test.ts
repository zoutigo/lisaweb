// Tests the admin guard middleware with lightweight stubs of next/server and next-auth/middleware

jest.mock("next/server", () => {
  const headers = (loc?: string) => {
    const map = new Map<string, string>();
    if (loc) map.set("location", loc);
    return {
      get: (key: string) => map.get(key.toLowerCase()),
    };
  };

  return {
    __esModule: true,
    NextResponse: {
      json: <T>(data: T, init?: ResponseInit) =>
        Promise.resolve({
          status: init?.status ?? 200,
          json: () => Promise.resolve(data),
          headers: headers(),
        }),
      redirect: (url: URL) => ({
        status: 307,
        headers: headers(url.toString()),
      }),
      next: () => ({
        status: 200,
        headers: headers(),
      }),
    },
  };
});

jest.mock("next-auth/middleware", () => ({
  __esModule: true,
  withAuth: (handler: MiddlewareFn) => (req: Parameters<MiddlewareFn>[0]) =>
    handler(req),
}));

type Token = { email?: string; isAdmin?: boolean } | undefined;
type MiddlewareResponse = {
  status: number;
  headers: { get: (key: string) => string | undefined };
  json?: () => Promise<unknown>;
};
type MiddlewareRequest = {
  nextauth?: { token?: Token };
  nextUrl: URL;
  url: string;
};
type MiddlewareFn = (req: MiddlewareRequest) => Promise<MiddlewareResponse>;

describe("Dashboard middleware admin guard", () => {
  const loadMiddleware = async () =>
    (await import("@/middleware")).default as unknown as MiddlewareFn;
  const makeReq = (
    path: string,
    token: Token = undefined,
  ): MiddlewareRequest => ({
    nextauth: { token },
    nextUrl: new URL(`http://localhost${path}`),
    url: `http://localhost${path}`,
  });

  it("redirects to / when no token on page routes", async () => {
    const middleware = await loadMiddleware();
    const res = await middleware(makeReq("/dashboard"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/");
  });

  it("returns 401 json on api routes when no token", async () => {
    const middleware = await loadMiddleware();
    const res = await middleware(makeReq("/api/dashboard/stuff"));
    expect(res.status).toBe(401);
    if (!res.json) throw new Error("expected json response");
    const data = await res.json();
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("redirects to / when user is not admin", async () => {
    const middleware = await loadMiddleware();
    const res = await middleware(
      makeReq("/dashboard/anything", { email: "u@x.com", isAdmin: false }),
    );
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/");
  });

  it("allows admin traffic to continue", async () => {
    const middleware = await loadMiddleware();
    const res = await middleware(
      makeReq("/dashboard/anything", { email: "a@x.com", isAdmin: true }),
    );
    expect(res.status).toBe(200);
  });
});
