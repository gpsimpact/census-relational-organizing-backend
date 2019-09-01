import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import { createTestUser } from "../utils/createTestEntities";

const requestLoginMutation = `
    mutation requestLogin($email: String!) {
      requestLogin(email: $email) {
        code
        message
        success
        securityCode
      }
    }
`;

beforeEach(async () => {
  await dbUp();
});

// afterEach(async () => {
//   await dbDown();
// });

describe("RequestLoginResolver", () => {
  test("Non existant user returns DOES_NOT_EXIST and success: false", async () => {
    const response = await graphqlTestCall(requestLoginMutation, {
      email: faker.internet.email()
    });
    expect(response.data.requestLogin.code).toBe("DOES_NOT_EXIST");
    expect(response.data.requestLogin.success).toBe(false);
  });

  test("happy path", async () => {
    const user = await createTestUser({
      email: faker.internet.email().toLowerCase()
    });

    const mockSendEmail = jest.fn();
    const response = await graphqlTestCall(
      requestLoginMutation,
      {
        email: user.email
      },
      {
        sendEmail: mockSendEmail
      }
    );
    expect(mockSendEmail).toHaveBeenCalled();
    expect(response.data.requestLogin.code).toBe("OK");
    expect(response.data.requestLogin.message).toBe(
      "A message has been sent to your email with a magic link you need to click to log in."
    );
    expect(response.data.requestLogin.success).toBe(true);
  });

  test("case trim coercion", async () => {
    const user = await createTestUser({
      email: faker.internet.email().toLowerCase()
    });

    const mockSendEmail = jest.fn();
    const response = await graphqlTestCall(
      requestLoginMutation,
      {
        email: ` ${user.email.toUpperCase()}    `
      },
      {
        sendEmail: mockSendEmail
      }
    );
    expect(mockSendEmail).toHaveBeenCalled();
    expect(response.data.requestLogin.code).toBe("OK");
    expect(response.data.requestLogin.message).toBe(
      "A message has been sent to your email with a magic link you need to click to log in."
    );
    expect(response.data.requestLogin.success).toBe(true);
  });

  test("throws error if logged in", async () => {
    const user = await createTestUser();

    const res = await graphqlTestCall(
      requestLoginMutation,
      {
        email: ` ${user.email.toUpperCase()}    `
      },
      { user: { id: user.id } }
    );
    expect(res.errors.length).toBe(1);
    expect(res.errors[0].message).toEqual("You are already authenticated");
  });
});
