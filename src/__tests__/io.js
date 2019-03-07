// import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestClient,
  createTestIO
} from "../utils/createTestEntities";

const GET_IO_QUERY = `
query io($id: String!) {
    io(id: $id) {
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
`;

beforeEach(async () => {
  await dbUp();
});

afterEach(async () => {
  await dbDown();
});

describe("IO", () => {
  test("Happy Path By Id", async () => {
    const user = await createTestUser();
    const client = await createTestClient();
    const IO = await createTestIO(
      "abc123",
      client.id,
      user.id,
      undefined,
      undefined,
      undefined,
      "VOTER_CONTACT"
    );
    const response = await graphqlTestCall(GET_IO_QUERY, {
      id: IO.insertionOrderId
    });
    expect(response.data.io.id).toEqual(IO.insertionOrderId);
    expect(response.data.io.createdBy.id).toEqual(user.id);
  });
});
