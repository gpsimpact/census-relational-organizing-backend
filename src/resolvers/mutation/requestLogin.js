import generateRandomBytes from "../../utils/generateRandomBytes";
import generateSecurityCode from "../../utils/securityCode";
import generateLoginEmail from "../../utils/email/generateLoginEmail";

export default async (root, args, context) => {
  // clean the email
  const cleanEmail = args.email.trim().toLowerCase();
  // Load user by email
  const user = await context.dataSource.user.byEmailLoader.load(cleanEmail);
  if (!user) {
    return {
      code: "DOES_NOT_EXIST",
      message: `No such user found for email ${cleanEmail}`,
      success: false
    };
  }

  // 2. Set a reset token and expiry on that user
  const loginToken = await generateRandomBytes(20);
  // user.setToken(loginToken);
  // await context.dataSource.user.update(user.id, {
  //   loginToken,
  //   loginTokenExpiry: new Date().getTime() + 60 * 60 * 24 * 1000
  // });

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
