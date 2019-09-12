import { permsToInt, intToPerms } from "../utils/permissions/permBitWise";

describe("PermissionsBitWise", () => {
  test("Int to Perms", () => {
    // 1 = 000001
    expect(intToPerms(1)).toEqual({
      ADMIN: false,
      APPLICANT: true,
      ELEVATED: false,
      MEMBER: false,
      TRAINING: false,
      DENIED: false
    });

    // 2 = 000010
    expect(intToPerms(2)).toEqual({
      ADMIN: false,
      APPLICANT: false,
      ELEVATED: false,
      MEMBER: false,
      TRAINING: true,
      DENIED: false
    });

    // 3 = 000011
    expect(intToPerms(3)).toEqual({
      ADMIN: false,
      APPLICANT: true,
      ELEVATED: false,
      MEMBER: false,
      TRAINING: true,
      DENIED: false
    });

    // 4 = 000100
    expect(intToPerms(4)).toEqual({
      ADMIN: false,
      APPLICANT: false,
      ELEVATED: true,
      MEMBER: false,
      TRAINING: false,
      DENIED: false
    });

    // 0 = 000000
    expect(intToPerms(0)).toEqual({
      ADMIN: false,
      APPLICANT: false,
      ELEVATED: false,
      MEMBER: false,
      TRAINING: false,
      DENIED: false
    });

    // 63 = 111111
    expect(intToPerms(63)).toEqual({
      ADMIN: true,
      APPLICANT: true,
      ELEVATED: true,
      MEMBER: true,
      TRAINING: true,
      DENIED: true
    });
  });

  test("perms to int", () => {
    expect(
      permsToInt({
        ADMIN: false,
        APPLICANT: true,
        ELEVATED: false,
        MEMBER: false,
        TRAINING: false,
        DENIED: false
      })
    ).toEqual(1);

    expect(
      permsToInt({
        ADMIN: true,
        APPLICANT: true,
        ELEVATED: true,
        MEMBER: true,
        TRAINING: true,
        DENIED: true
      })
    ).toEqual(63);

    expect(
      permsToInt({
        ADMIN: false,
        APPLICANT: false,
        ELEVATED: false,
        MEMBER: false,
        TRAINING: false,
        DENIED: false
      })
    ).toEqual(0);

    expect(
      permsToInt({
        ADMIN: false,
        APPLICANT: true,
        ELEVATED: false,
        MEMBER: false,
        TRAINING: true,
        DENIED: false
      })
    ).toEqual(3);
  });
});
