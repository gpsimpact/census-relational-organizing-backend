import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import { createTestUser, createTestGtib } from "../utils/createTestEntities";
import { sq } from "../db";

const GET_ALL_GTIBS_QUERY = `
query Gtibs($visible: Boolean) {
    gtibs(visible: $visible) {
        id
        text
        createdAt
        updatedAt
        active
        visible
    }
}
`;

beforeEach(async () => {
  await dbUp();
});

describe("GTIBS", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();
    await createTestGtib(user.id);
    await createTestGtib(user.id);
    const gtib3 = await createTestGtib(user.id);

    // no input
    const response = await graphqlTestCall(GET_ALL_GTIBS_QUERY);
    // where only input
    expect(response.data.gtibs.length).toBe(3);

    await sq`gtibs`.set({ visible: false }).where({ id: gtib3.id });

    const response2 = await graphqlTestCall(GET_ALL_GTIBS_QUERY);
    // where only input
    expect(response2.data.gtibs.length).toBe(2);
  });
});
