/** @jest-environment node */

jest.mock("nodemailer", () => {
  const sendMail = jest.fn();
  return {
    __esModule: true,
    default: {
      createTransport: jest.fn(() => ({ sendMail })),
    },
    createTransport: jest.fn(() => ({ sendMail })),
  };
});

jest.mock("@/lib/prisma", () => {
  const siteInfo = { findFirst: jest.fn() };
  return { __esModule: true, prisma: { siteInfo } };
});

const prisma = jest.requireMock("@/lib/prisma").prisma as {
  siteInfo: { findFirst: jest.Mock };
};
const nodemailer = jest.requireMock("nodemailer");

import * as contactApi from "@/app/api/contact/route";

describe("API /api/contact", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects invalid payload", async () => {
    const res = await contactApi.POST(
      new Request("http://x", {
        method: "POST",
        body: JSON.stringify({ email: "bad" }),
      }),
    );
    expect(res.status).toBe(400);
  });

  it("sends mails to user and admin when payload is valid", async () => {
    prisma.siteInfo.findFirst.mockResolvedValue({
      email: "admin@test.com",
      name: "Site",
      phone: "01020304",
      address: "Rue",
      city: "Ville",
      postalCode: "00000",
      country: "France",
    });
    const res = await contactApi.POST(
      new Request("http://x", {
        method: "POST",
        body: JSON.stringify({
          email: "user@test.com",
          phone: "0600000000",
          reason: "Test",
          message: "Un message assez long",
          captchaAnswer: 10,
          captchaExpected: 10,
          captchaQuestion: "Combien font 5 + 5 ?",
          botField: "",
        }),
      }),
    );
    expect(res.status).toBe(200);
    const sendMail = nodemailer.createTransport().sendMail as jest.Mock;
    expect(sendMail).toHaveBeenCalled();
    const calls = sendMail.mock.calls as unknown[][];
    const hasUserMail = calls.some(
      (call) => (call[0] as { to?: string })?.to === "user@test.com",
    );
    const hasAdminMail = calls.some(
      (call) => (call[0] as { to?: string })?.to === "admin@test.com",
    );
    expect(hasUserMail).toBeTruthy();
    expect(hasAdminMail).toBeTruthy();
  });
});
