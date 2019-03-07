import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestClient,
  createTestIO
} from "../utils/createTestEntities";

const GET_ALL_IOS_QUERY = `
query ios($input:IOsInput) {
    ios(input:$input) {
        hasMore
        totalCount
        items {
          id
          timestamp
          client {
            id
          }
          createdBy {
            id
          }
          attribution
          campaignName
          campaignDescription
          programPhase
          commissionRate
          revisionHistory {
            revisionId
            timestamp
            id
            client {
              id
            }
            createdBy {
              id
            }
            attribution
            campaignName
            campaignDescription
            programPhase
            commissionRate
          }
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
    const user = await createTestUser();
    const client = await createTestClient();
    await createTestIO(
      "abc123",
      client.id,
      user.id,
      undefined,
      undefined,
      undefined,
      "VOTER_CONTACT"
    );
    await createTestIO(
      "abc124",
      client.id,
      user.id,
      undefined,
      undefined,
      undefined,
      "VOTER_CONTACT"
    );

    // no input
    const response1 = await graphqlTestCall(GET_ALL_IOS_QUERY);
    // console.log("RESPNSE 1", JSON.stringify(response1, null, "\t"));
    // where only input
    const response2 = await graphqlTestCall(GET_ALL_IOS_QUERY, {
      input: { where: { id: { neq: "fdsfdsa" } } }
    });
    // console.log("RESPNSE 2", response2);
    // pagination only no where
    const response3 = await graphqlTestCall(GET_ALL_IOS_QUERY, {
      input: { limit: 100, offset: 0 }
    });
    // partial pagination only 1
    const response4 = await graphqlTestCall(GET_ALL_IOS_QUERY, {
      input: { limit: 100 }
    });
    // partial pagination only 2
    const response5 = await graphqlTestCall(GET_ALL_IOS_QUERY, {
      $input: { offset: 0 }
    });
    // should all be equal
    expect(response1).toEqual(response2);
    expect(response1).toEqual(response3);
    expect(response1).toEqual(response4);
    expect(response1).toEqual(response5);
    // should return correct data
    expect(response1.data.ios.hasMore).toBeFalsy();
    expect(response1.data.ios.totalCount).toBe(2);
    expect(response1.data.ios.items.length).toBe(2);
  });
});
