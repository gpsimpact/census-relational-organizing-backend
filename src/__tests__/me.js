import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import { createTestUser } from "../utils/createTestEntities";

const meQuery = `
{
  me {
    id
    firstName
    lastName
    address
    city
    state
    zip5
    phone
    email
  }
}
`;

beforeEach(async () => {
  await dbUp();
});

afterEach(async () => {
  await dbDown();
});

describe("MeResolver", () => {
  test("Non auth returns null", async () => {
    const response = await graphqlTestCall(meQuery);
    expect(response.data.me).toBeNull();
  });

  test("Auth returns user", async () => {
    const user = await createTestUser();
    const res = await graphqlTestCall(meQuery, {}, { user: { id: user.id } });
    expect(res.data.me.id).toBe(user.id);
    expect(res.data.me.firstName).toBe(user.firstName);
  });
});
