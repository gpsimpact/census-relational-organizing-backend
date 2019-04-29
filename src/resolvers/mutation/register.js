import generateRandomBytes from "../../utils/generateRandomBytes";
import generateSecurityCode from "../../utils/securityCode";
import generateLoginEmail from "../../utils/email/generateLoginEmail";
import _ from "lodash";

export default async (root, args, context) => {
  // clean the email and check for duplicates
  const cleanEmail = args.input.email.trim().toLowerCase();

  // Load user by email
  const existing = await context.dataSource.user.byEmailLoader.load(cleanEmail);

  if (existing) {
    return {
      code: "DUPLICATE",
      message: `User already exists for email ${cleanEmail}. Try Logging in.`,
      success: false
    };
  }

  const writePayload = _.omit(args.input, "teamSlug");

  // 1. Create user with provided arguments
  const user = await context.dataSource.user.create({
    ...writePayload,
    email: cleanEmail
  });

  if (args.input.teamSlug) {
    // grab team record
    const dbTeam = await context.dataSource.team.bySlugLoader.load(
      args.input.teamSlug
    );

    if (!dbTeam) {
      return {
        code: "INPUT_ERROR",
        message: `No such team exists.`,
        success: false
      };
    }

    await context.dataSource.olPerms.create({
      userId: user.id,
      teamId: dbTeam.id,
      permission: "APPLICANT"
    });
  }

  // 2. Set a reset token and expiry on that user
  const loginToken = await generateRandomBytes(20);
  await context.dataSource.user.setLoginToken(user.id, loginToken);
  const securityCode = await generateSecurityCode();
  await context.sendEmail(
    generateLoginEmail(loginToken, securityCode, user.email, args.nextPage)
  );

  // 4. Return the message
  return {
    code: "OK",
    message:
      "A message has been sent to your email with a magic link you need to click to log in.",
    securityCode,
    success: true
  };
};
