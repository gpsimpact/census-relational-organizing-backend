import faker from "faker";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createTestTeamPermission
} from "../utils/createTestEntities";

const SEND_TEAM_ADMIN_EMAIL_MUTATION = `
  mutation sendTeamAdminsEmail($input: SendTeamAdminsEmailInput!) {
     sendTeamAdminsEmail(input: $input) {
      code
      success
      message
    }
  }
`;

beforeEach(async () => {
  await dbUp();
});

afterAll(async () => {
  await dbDown();
});

describe("Send team admin email", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    await createTestTeamPermission(user.id, team.id, 'MEMBER');
    const teamAdminUser = await createTestUser();
    await createTestTeamPermission(teamAdminUser.id, team.id, 'ADMIN');

    const email = {
      subject: faker.lorem.sentence(),
      body: faker.lorem.paragraph()
    };

    const mockSendEmail = jest.fn();

    const response = await graphqlTestCall(
      SEND_TEAM_ADMIN_EMAIL_MUTATION,
      {
        input: {
          teamId: team.id,
          ...email
        }
      },
      { user: { id: user.id }, sendEmail: mockSendEmail }
    );
    debugResponse(response);
    expect(response.data.sendTeamAdminsEmail).not.toBeNull();
    expect(response.data.sendTeamAdminsEmail.success).toEqual(true);

    expect(mockSendEmail).toHaveBeenCalled();
    expect(mockSendEmail).toHaveBeenCalledWith({
      to: [teamAdminUser.email],
      from: process.env.EMAIL_SENDER,
      templateId: "d-1b37f21d9f474bbbbdae4d97b2fcf178",
      dynamic_template_data: {
        SUBJECT: email.subject,
        USER_NAME: `${user.firstName} ${user.lastName}`,
        USER_EMAIL: user.email,
        MESSAGE: email.body
      }
    });
  });
});
