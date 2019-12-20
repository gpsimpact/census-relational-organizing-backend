import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestGtib,
  createAdminUser,
  createTestUser,
  createTestTeamPermission,
  createTestTeam
} from "../utils/createTestEntities";
import { sq } from "../db";

const GET_ALL_GTIBS_QUERY = `
query Gtibs($input: GtibsInput!) {
    gtibs(input: $input) {
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

afterAll(async () => {
  await dbDown();
});

describe("GTIBS", () => {
  test("Happy Path", async () => {
    const adminUser = await createAdminUser();
    await createTestGtib(adminUser.id);
    await createTestGtib(adminUser.id);
    const gtib3 = await createTestGtib(adminUser.id);

    // no input
    const response = await graphqlTestCall(
      GET_ALL_GTIBS_QUERY,
      { input: { active: true, visible: true, tibType: "QUESTION" } },
      {
        user: { id: adminUser.id }
      }
    );
    debugResponse(response);
    expect(response.data.gtibs.length).toBe(3);

    await sq`tibs`.set({ visible: false }).where({ id: gtib3.id });

    const response2 = await graphqlTestCall(
      GET_ALL_GTIBS_QUERY,
      { input: { active: true, visible: true, tibType: "QUESTION" } },
      {
        user: { id: adminUser.id }
      }
    );
    debugResponse(response2);
    expect(response2.data.gtibs.length).toBe(2);
  });

  test("Happy path with at least one team admin", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    await createTestTeamPermission(user.id, team.id, "ADMIN");
    await createTestGtib(user.id);
    await createTestGtib(user.id);
    const gtib3 = await createTestGtib(user.id);

    // no input
    const response = await graphqlTestCall(
      GET_ALL_GTIBS_QUERY,
      { input: { active: true, visible: true, tibType: "QUESTION" } },
      {
        user: { id: user.id }
      }
    );
    // where only input
    expect(response.data.gtibs.length).toBe(3);

    await sq`tibs`.set({ visible: false }).where({ id: gtib3.id });

    const response2 = await graphqlTestCall(
      GET_ALL_GTIBS_QUERY,
      { input: { active: true, visible: true, tibType: "QUESTION" } },
      {
        user: { id: user.id }
      }
    );
    // where only input
    expect(response2.data.gtibs.length).toBe(2);
  });

  test("Fails if not at least one team admin", async () => {
    const user = await createTestUser();
    await createTestGtib(user.id);
    await createTestGtib(user.id);
    await createTestGtib(user.id);

    // no input
    const response = await graphqlTestCall(
      GET_ALL_GTIBS_QUERY,
      { input: { active: true, visible: true, tibType: "QUESTION" } },
      {
        user: { id: user.id }
      }
    );
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  test("active works", async () => {
    const adminUser = await createAdminUser();
    await createTestGtib(adminUser.id);
    await createTestGtib(adminUser.id);
    const gtib3 = await createTestGtib(adminUser.id);

    // no input
    const response = await graphqlTestCall(
      GET_ALL_GTIBS_QUERY,
      { input: { active: true, visible: true, tibType: "QUESTION" } },
      {
        user: { id: adminUser.id }
      }
    );
    // where only input
    expect(response.data.gtibs.length).toBe(3);

    await sq`tibs`.set({ active: false }).where({ id: gtib3.id });

    const response2 = await graphqlTestCall(
      GET_ALL_GTIBS_QUERY,
      { input: { active: true, visible: true, tibType: "QUESTION" } },
      {
        user: { id: adminUser.id }
      }
    );
    // where only input
    expect(response2.data.gtibs.length).toBe(2);

    const response3 = await graphqlTestCall(
      GET_ALL_GTIBS_QUERY,
      { input: { active: false, visible: true, tibType: "QUESTION" } },
      {
        user: { id: adminUser.id }
      }
    );
    // where only input
    expect(response3.data.gtibs.length).toBe(1);
  });
});
