import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import { createTestUser } from "../utils/createTestEntities";

const REGISTER_MUTATION = `
    mutation register($email: String!, $name: String!){
        register(email:$email, name:$name) {
            code
            success
            securityCode
            message
        }
    }
`;

beforeEach(async () => {
  await dbUp();
});

afterEach(async () => {
  await dbDown();
});

describe("RegisterResolver", () => {
  test("Happy Path", async () => {
    const mockSendEmail = jest.fn();
    const response = await graphqlTestCall(
      REGISTER_MUTATION,
      {
        email: faker.internet.email(),
        name: `${faker.name.firstName()} ${faker.name.lastName()}`
      },
      undefined,
      {
        sendEmail: mockSendEmail
      }
    );
    expect(mockSendEmail).toHaveBeenCalled();
    expect(response.data.register.code).toBe("OK");
    expect(response.data.register.message).toBe(
      "A message has been sent to your email with a magic link you need to click to log in."
    );
    expect(response.data.register.success).toBe(true);
  });

  test("case trim coercion", async () => {
    const mockSendEmail = jest.fn();
    const response = await graphqlTestCall(
      REGISTER_MUTATION,
      {
        email: faker.internet.email(),
        name: `${faker.name.firstName()} ${faker.name.lastName()}`
      },
      undefined,
      {
        sendEmail: mockSendEmail
      }
    );
    expect(mockSendEmail).toHaveBeenCalled();
    expect(response.data.register.code).toBe("OK");
    expect(response.data.register.message).toBe(
      "A message has been sent to your email with a magic link you need to click to log in."
    );
    expect(response.data.register.success).toBe(true);
  });

  test("throws error if logged in", async () => {
    const user = await createTestUser();

    const res = await graphqlTestCall(
      REGISTER_MUTATION,
      {
        email: user.email,
        name: user.name
      },
      user.id
    );

    expect(res.errors.length).toBe(1);
    expect(res.errors).toMatchSnapshot();
  });

  test("Throws Duplicate Error if record already exists", async () => {
    const user = await createTestUser(
      null,
      faker.internet.email().toLowerCase()
    );

    const res = await graphqlTestCall(REGISTER_MUTATION, {
      email: user.email,
      name: user.name
    });
    expect(res.data.register.code).toBe("DUPLICATE");
    expect(res.data.register.success).toBe(false);
  });
});
