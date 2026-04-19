import { describe, expect, it } from "vitest";
import { getCertificateGrantConfirmationMessage } from "./certificateGrant";

describe("getCertificateGrantConfirmationMessage", () => {
  it("warns when the student has not completed 100% of the course", () => {
    expect(
      getCertificateGrantConfirmationMessage({ completionPercentage: 82 }),
    ).toBe(
      "UWAGA! Ten kursant nie ukonczyl jeszcze 100% kursu. Czy na pewno chcesz mu przyznac certyfikat?",
    );
  });

  it("confirms standard grant copy after 100% completion", () => {
    expect(
      getCertificateGrantConfirmationMessage({ completionPercentage: 100 }),
    ).toBe(
      "Ten kursant ukonczyl 100% kursu. Czy na pewno chcesz mu przyznac certyfikat?",
    );
  });
});
