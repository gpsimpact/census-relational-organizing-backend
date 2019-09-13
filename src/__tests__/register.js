import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import { createTestUser, createTestTeam } from "../utils/createTestEntities";
import { sq } from "../db";
import { intToPerms } from "../utils/permissions/permBitWise";

const REGISTER_MUTATION = `
    mutation register($input: RegisterInput!){
        register(input: $input) {
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
        input: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          email: faker.internet.email(),
          address: faker.address.streetAddress(),
          city: faker.address.city(),
          state: faker.address.state(),
          zip5: faker.address.zipCode().substring(0, 5),
          phone: `+${faker.random.number({
            min: 10000000000,
            max: 19999999999
          })}`
        }
      },
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
        input: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          email: faker.internet.email(),
          address: faker.address.streetAddress(),
          city: faker.address.city(),
          state: faker.address.state(),
          zip5: faker.address.zipCode().substring(0, 5),
          phone: `+${faker.random.number({
            min: 10000000000,
            max: 19999999999
          })}`
        }
      },
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
        input: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          email: faker.internet.email(),
          address: faker.address.streetAddress(),
          city: faker.address.city(),
          state: faker.address.state(),
          zip5: faker.address.zipCode().substring(0, 5),
          phone: `+${faker.random.number({
            min: 10000000000,
            max: 19999999999
          })}`
        }
      },
      { user: { id: user.id } }
    );

    expect(res.errors.length).toBe(1);
    expect(res.errors[0].message).toEqual("You are already authenticated");
  });

  test("Throws Duplicate Error if record already exists", async () => {
    const user = await createTestUser({
      email: faker.internet.email().toLowerCase()
    });

    const res = await graphqlTestCall(REGISTER_MUTATION, {
      input: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        address: user.address,
        city: user.city,
        state: user.state,
        zip5: user.zip5,
        phone: `+${faker.random.number({ min: 10000000000, max: 19999999999 })}`
      }
    });
    expect(res.data.register.code).toBe("DUPLICATE");
    expect(res.data.register.success).toBe(false);
  });

  test("if optional team slug arg is present, creates application record", async () => {
    const mockSendEmail = jest.fn();
    const team = await createTestTeam();
    const email = faker.internet.email().toLowerCase();
    const response = await graphqlTestCall(
      REGISTER_MUTATION,
      {
        input: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          email,
          address: faker.address.streetAddress(),
          city: faker.address.city(),
          state: faker.address.state(),
          zip5: faker.address.zipCode().substring(0, 5),
          phone: `+${faker.random.number({
            min: 10000000000,
            max: 19999999999
          })}`,
          teamSlug: team.slug
        }
      },
      {
        sendEmail: mockSendEmail
      }
    );
    expect(response.data.register.code).toBe("OK");
    expect(response.data.register.message).toBe(
      "A message has been sent to your email with a magic link you need to click to log in."
    );
    expect(response.data.register.success).toBe(true);

    // get user from db
    const dbUser = await sq`users`.where({ email }).one();

    const [dbUserPerms] = await sq.from`team_permissions_bit`.where({
      userId: dbUser.id,
      teamId: team.id
    });
    expect(dbUserPerms).not.toBeNull();
    expect(intToPerms(dbUserPerms.permission)["APPLICANT"]).toBe(true);
  });

  test("Nonsense team slug fails", async () => {
    const mockSendEmail = jest.fn();
    const email = faker.internet.email().toLowerCase();
    const response = await graphqlTestCall(
      REGISTER_MUTATION,
      {
        input: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          email,
          address: faker.address.streetAddress(),
          city: faker.address.city(),
          state: faker.address.state(),
          zip5: faker.address.zipCode().substring(0, 5),
          phone: `+${faker.random.number({
            min: 10000000000,
            max: 19999999999
          })}`,
          teamSlug: "WUBWUBWUB"
        }
      },
      {
        sendEmail: mockSendEmail
      }
    );
    expect(response.data.register.code).toBe("INPUT_ERROR");
    expect(response.data.register.message).toBe("No such team exists.");
    expect(response.data.register.success).toBe(false);
  });
});
