import {
  REMEMBER_ME_COOKIE_NAME,
  REMEMBER_ME_DISABLED_VALUE,
  applyRememberMeToCookieOptions,
  getBrowserRememberMeDisabled,
  isRememberMeDisabled,
  setRememberMePreference,
} from "./rememberMe";

describe("rememberMe auth cookies", () => {
  beforeEach(() => {
    document.cookie = `${REMEMBER_ME_COOKIE_NAME}=; Max-Age=0; Path=/`;
  });

  it("treats only the explicit disabled value as remember-me off", () => {
    expect(isRememberMeDisabled(REMEMBER_ME_DISABLED_VALUE)).toBe(true);
    expect(isRememberMeDisabled(null)).toBe(false);
    expect(isRememberMeDisabled("true")).toBe(false);
  });

  it("removes persistent lifetime settings when remember-me is off", () => {
    const expires = new Date("2030-01-01T00:00:00.000Z");

    expect(
      applyRememberMeToCookieOptions(
        { path: "/", sameSite: "lax", maxAge: 100, expires },
        true,
      ),
    ).toEqual({ path: "/", sameSite: "lax" });
  });

  it("keeps removal cookies expiring immediately", () => {
    expect(
      applyRememberMeToCookieOptions({ path: "/", maxAge: 0 }, true),
    ).toEqual({ path: "/", maxAge: 0 });
  });

  it("leaves persistent cookies unchanged when remember-me is on", () => {
    expect(
      applyRememberMeToCookieOptions({ path: "/", maxAge: 100 }, false),
    ).toEqual({ path: "/", maxAge: 100 });
  });

  it("stores the off preference as a browser session cookie", () => {
    setRememberMePreference(false);

    expect(getBrowserRememberMeDisabled()).toBe(true);
    expect(document.cookie).toContain(
      `${REMEMBER_ME_COOKIE_NAME}=${REMEMBER_ME_DISABLED_VALUE}`,
    );
  });

  it("clears the browser preference when remember-me is on", () => {
    setRememberMePreference(false);
    setRememberMePreference(true);

    expect(getBrowserRememberMeDisabled()).toBe(false);
  });
});
