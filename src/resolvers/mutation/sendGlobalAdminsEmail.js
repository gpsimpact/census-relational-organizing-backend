import _ from "lodash";

export default async (root, args, context) => {
  const globalAdmins = await context.sq.sql`
    SELECT 
        *
    FROM users u
    WHERE EXISTS (
        SELECT 1
        FROM global_permissions
        WHERE u.id = user_id
        AND permission = 'ADMIN'
    );
  `;

  const gaEmails = _.map(globalAdmins, "email");

  // get applicant info
  const user = await context.dataSource.user.byIdLoader.load(context.user.id);

  const messageData = {
    to: gaEmails,
    from: process.env.EMAIL_SENDER,
    templateId: "d-1b37f21d9f474bbbbdae4d97b2fcf178",
    subject: args.input.subject,
    dynamic_template_data: {
      USER_NAME: `${user.firstName} ${user.lastName}`,
      USER_EMAIL: user.email,
      MESSAGE: args.input.body
    }
  };

  // send email
  await context.sendEmail(messageData);

  return {
    success: true,
    code: "OK",
    message: "Email sent."
  };
};
