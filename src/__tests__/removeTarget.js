import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createTestTarget,
  createAdminUser
} from "../utils/createTestEntities";
import { sq } from "../db";

const REMOVE_TARGET_MUTATION = `
  mutation removeTarget($id: String!) {
     removeTarget(id: $id) {
      code
      success
      message
      item {
        id
        active
      }
    }
  }
`;

beforeEach(async () => {
  await dbUp();
});

describe("Remove Target", () => {
  test("Happy Path ADMIN", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({ userId: user.id, teamId: team.id });

    const adminUser = await createAdminUser();
    const response = await graphqlTestCall(
      REMOVE_TARGET_MUTATION,
      {
        id: target.id
      },
      { user: { id: adminUser.id } }
    );
    debugResponse(response);
    expect(response.data.removeTarget.item.id).toEqual(target.id);
    expect(response.data.removeTarget.item.active).toEqual(false);
    expect(response.data.removeTarget).not.toBeNull();
    expect(response.data.removeTarget.success).toEqual(true);
    const dbTargets = await sq.from`targets`;
    expect(dbTargets.length).toBe(1);
    expect(dbTargets[0].active).toBe(false);
  });

  // HP own target
  test("Happy Path own target", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({ userId: user.id, teamId: team.id });

    const response = await graphqlTestCall(
      REMOVE_TARGET_MUTATION,
      {
        id: target.id
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.removeTarget.item.id).toEqual(target.id);
    expect(response.data.removeTarget.item.active).toEqual(false);
    expect(response.data.removeTarget).not.toBeNull();
    expect(response.data.removeTarget.success).toEqual(true);
    const dbTargets = await sq.from`targets`;
    expect(dbTargets.length).toBe(1);
    expect(dbTargets[0].active).toBe(false);
  });

  // fail, not own target
  test("fails if not own target", async () => {
    const user = await createTestUser();
    const user2 = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({
      userId: user2.id,
      teamId: team.id
    });

    const response = await graphqlTestCall(
      REMOVE_TARGET_MUTATION,
      {
        id: target.id
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  // no id - can't test because blocked by perms
  // test("fails if target id doesnt exist", async () => {
  //   const user = await createTestUser();

  //   const response = await graphqlTestCall(
  //     REMOVE_TARGET_MUTATION,
  //     {
  //       id: faker.random.uuid()
  //     },
  //     { user: { id: user.id } }
  //   );
  //   debugResponse(response);
  //   expect(response.data.removeTarget.success).toEqual(false);
  //   expect(response.data.removeTarget.message).toEqual(
  //     "No target with this id exists."
  //   );
  // });
});
