const APPLICANT = 1; // 000001
const TRAINING = 1 << 1; // 000010
const ELEVATED = 1 << 2; // 000100
const MEMBER = 1 << 3; // 001000
const ADMIN = 1 << 4; // 010000
const DENIED = 1 << 5; // 100000

export const makeDefaultState = () => ({
  APPLICANT: false,
  TRAINING: false,
  ELEVATED: false,
  MEMBER: false,
  ADMIN: false,
  DENIED: false
});

export const intToPerms = permInt => {
  // "&" is exclusionary - only bits in common are returned
  // 01 & 01 = 01
  // 01 & 00 = 00
  // 100 & 001 = 000

  return {
    // !!() just converts result to boolean
    APPLICANT: !!(permInt & APPLICANT),
    TRAINING: !!(permInt & TRAINING),
    ELEVATED: !!(permInt & ELEVATED),
    MEMBER: !!(permInt & MEMBER),
    ADMIN: !!(permInt & ADMIN),
    DENIED: !!(permInt & DENIED)
  };
};

export const permsToInt = permObj => {
  // "|" is inclusionary - every 1 bit is returned

  let permInt = 0;

  if (permObj.APPLICANT) {
    permInt = permInt | APPLICANT;
  }

  if (permObj.TRAINING) {
    permInt = permInt | TRAINING;
  }

  if (permObj.ELEVATED) {
    permInt = permInt | ELEVATED;
  }

  if (permObj.MEMBER) {
    permInt = permInt | MEMBER;
  }

  if (permObj.ADMIN) {
    permInt = permInt | ADMIN;
  }

  if (permObj.DENIED) {
    permInt = permInt | DENIED;
  }

  return permInt;
};
