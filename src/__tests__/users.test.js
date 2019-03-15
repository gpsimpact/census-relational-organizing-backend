import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import { createTestUser } from "../utils/createTestEntities";

const GET_ALL_USERS_QUERY = `
query Users($input:UsersInput) {
    users(input:$input) {
        hasMore
        totalCount
        items {
            id
            firstName
            lastName
            address
            city
            state
            zip5
            phone
            email
            active
        }
    }
}
`;

beforeEach(async () => {
  await dbUp();
});

afterEach(async () => {
  await dbDown();
});

describe("Users", () => {
  test("Happy Path", async () => {
    await createTestUser();
    await createTestUser();

    // no input
    const response1 = await graphqlTestCall(GET_ALL_USERS_QUERY);
    // where only input
    const response2 = await graphqlTestCall(GET_ALL_USERS_QUERY, {
      input: { where: { email: { neq: "fdsfdsa" } } }
    });
    // pagination only no where
    const response3 = await graphqlTestCall(GET_ALL_USERS_QUERY, {
      input: { limit: 100, offset: 0 }
    });
    // partial pagination only 1
    const response4 = await graphqlTestCall(GET_ALL_USERS_QUERY, {
      input: { limit: 100 }
    });
    // partial pagination only 2
    const response5 = await graphqlTestCall(GET_ALL_USERS_QUERY, {
      $input: { offset: 0 }
    });
    // should all be equal
    expect(response1).toEqual(response2);
    expect(response1).toEqual(response3);
    expect(response1).toEqual(response4);
    expect(response1).toEqual(response5);
    // should return correct data
    expect(response1.data.users.hasMore).toBeFalsy();
    expect(response1.data.users.totalCount).toBe(2);
    expect(response1.data.users.items.length).toBe(2);
  });

  test("Boolean Where", async () => {
    await createTestUser();
    await createTestUser({ active: false });

    const response = await graphqlTestCall(GET_ALL_USERS_QUERY, {
      input: { where: { active: { eq: true } } }
    });
    expect(response.data.users.items.length).toBe(1);
  });
});
