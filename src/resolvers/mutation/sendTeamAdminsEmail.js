import _ from "lodash";

export default async (root, args, context) => {
  // get team info
  // const team = await context.dataSource.team.byIdLoader.load(args.teamId);
  // get applicant info

  let teamAdminEmails = await context.sq.sql`
    SELECT 
      email 
    FROM USERS u
    WHERE EXISTS (
      SELECT 
        user_id 
      FROM team_permissions 
      WHERE permission = 'ADMIN'
      AND u.id = user_id
      AND team_id = ${args.input.teamId}
    ) AND u.active;
  `;

  teamAdminEmails = _.map(teamAdminEmails, "email");

  // get applicant info
  const user = await context.dataSource.user.byIdLoader.load(context.user.id);

  const messageData = {
    to: teamAdminEmails,
    from: process.env.EMAIL_SENDER,
    templateId: "d-1b37f21d9f474bbbbdae4d97b2fcf178",
    dynamic_template_data: {
      SUBJECT: args.input.subject,
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
