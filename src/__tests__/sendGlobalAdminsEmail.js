import faker from "faker";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestGlobalPerm
} from "../utils/createTestEntities";

const SEND_GLOBAL_ADMIN_EMAIL_MUTATION = `
  mutation sendGlobalAdminsEmail($input: SendGlobalAdminsEmailInput!) {
     sendGlobalAdminsEmail(input: $input) {
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

describe("Send global admin email", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();
    const globalAdmin = await createTestUser();
    await createTestGlobalPerm(globalAdmin.id, "ADMIN");

    const email = {
      subject: faker.lorem.sentence(),
      body: faker.lorem.paragraph()
    };

    const mockSendEmail = jest.fn();

    const response = await graphqlTestCall(
      SEND_GLOBAL_ADMIN_EMAIL_MUTATION,
      {
        input: email
      },
      { user: { id: user.id }, sendEmail: mockSendEmail }
    );
    debugResponse(response);
    expect(response.data.sendGlobalAdminsEmail).not.toBeNull();
    expect(response.data.sendGlobalAdminsEmail.success).toEqual(true);

    expect(mockSendEmail).toHaveBeenCalled();
    expect(mockSendEmail).toHaveBeenCalledWith({
      to: [globalAdmin.email],
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
