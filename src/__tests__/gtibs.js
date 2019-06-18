import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestGtib,
  createAdminUser,
  createTestUser,
  createTestOLPermission,
  createTestTeam
} from "../utils/createTestEntities";
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
    const adminUser = await createAdminUser();
    await createTestGtib(adminUser.id);
    await createTestGtib(adminUser.id);
    const gtib3 = await createTestGtib(adminUser.id);

    // no input
    const response = await graphqlTestCall(GET_ALL_GTIBS_QUERY, null, {
      user: { id: adminUser.id }
    });
    // where only input
    expect(response.data.gtibs.length).toBe(3);

    await sq`tibs`.set({ visible: false }).where({ id: gtib3.id });

    const response2 = await graphqlTestCall(GET_ALL_GTIBS_QUERY, null, {
      user: { id: adminUser.id }
    });
    // where only input
    expect(response2.data.gtibs.length).toBe(2);
  });

  test("Happy path with at least one team admin", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    await createTestOLPermission(user.id, team.id, "ADMIN");
    await createTestGtib(user.id);
    await createTestGtib(user.id);
    const gtib3 = await createTestGtib(user.id);

    // no input
    const response = await graphqlTestCall(GET_ALL_GTIBS_QUERY, null, {
      user: { id: user.id }
    });
    // where only input
    expect(response.data.gtibs.length).toBe(3);

    await sq`tibs`.set({ visible: false }).where({ id: gtib3.id });

    const response2 = await graphqlTestCall(GET_ALL_GTIBS_QUERY, null, {
      user: { id: user.id }
    });
    // where only input
    expect(response2.data.gtibs.length).toBe(2);
  });

  test("Fails if not at least one team admin", async () => {
    const user = await createTestUser();
    await createTestGtib(user.id);
    await createTestGtib(user.id);
    await createTestGtib(user.id);

    // no input
    const response = await graphqlTestCall(GET_ALL_GTIBS_QUERY, null, {
      user: { id: user.id }
    });
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });
});
