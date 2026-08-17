import { describe, expect, it } from "vitest";

import { buildSupportMailto, DONATE_URL, SUPPORT_EMAIL, SUPPORT_MAILTO } from "./env";

describe("env", () => {
  it("points support to the mail address", () => {
    expect(SUPPORT_EMAIL).toBe("shuvalov.rem@mail.ru");
    expect(SUPPORT_MAILTO).toBe("mailto:shuvalov.rem@mail.ru");
  });

  it("points donate to the author page", () => {
    expect(DONATE_URL).toBe("https://dalink.to/harekuintv");
  });

  it("builds a mailto with the question", () => {
    expect(buildSupportMailto("Как сменить тему?")).toBe(
      "mailto:shuvalov.rem@mail.ru?subject=%D0%92%D0%BE%D0%BF%D1%80%D0%BE%D1%81%20%D0%BF%D0%BE%20Scrooge%20Vault&body=%D0%9A%D0%B0%D0%BA%20%D1%81%D0%BC%D0%B5%D0%BD%D0%B8%D1%82%D1%8C%20%D1%82%D0%B5%D0%BC%D1%83%3F"
    );
  });
});

describe("env", () => {
  it("points support to the mail address", () => {
    expect(SUPPORT_EMAIL).toBe("shuvalov.rem@mail.ru");
    expect(SUPPORT_MAILTO).toBe("mailto:shuvalov.rem@mail.ru");
  });

  it("points donate to the author page", () => {
    expect(DONATE_URL).toBe("https://dalink.to/harekuintv");
  });
});
