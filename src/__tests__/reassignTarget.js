import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createTestTarget,
  createAdminUser,
  createTestTeamPermission
} from "../utils/createTestEntities";
import { sq } from "../db";

const REASSIGN_TARGET_MUTATION = `
  mutation reassignTarget($input: ReassignTargetInput!) {
     reassignTarget(input: $input) {
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

afterAll(async () => {
  await dbDown();
});

describe("Reassign Target", () => {
  test("Happy Path Global ADMIN", async () => {
    const team = await createTestTeam();
    const originalOwnerUser = await createTestUser();
    await createTestTeamPermission(originalOwnerUser.id, team.id, 'MEMBER');
    const newOwnerUser = await createTestUser();
    await createTestTeamPermission(newOwnerUser.id, team.id, 'MEMBER');
    const target = await createTestTarget({
      userId: originalOwnerUser.id,
      teamId: team.id
    });

    const adminUser = await createAdminUser();
    const response = await graphqlTestCall(
      REASSIGN_TARGET_MUTATION,
      {
        input: {
          teamId: team.id,
          targetId: target.id,
          newOwnerUserId: newOwnerUser.id
        }
      },
      { user: { id: adminUser.id } }
    );
    debugResponse(response);
    expect(response.data.reassignTarget.item.id).toEqual(target.id);
    expect(response.data.reassignTarget).not.toBeNull();
    expect(response.data.reassignTarget.success).toEqual(true);

    const [dbTargets] = await sq.from`targets`.where({ id: target.id });
    expect(dbTargets.active).toBe(true);
    expect(dbTargets.userId).toBe(newOwnerUser.id);
  });

  test("New Owner must be in team.", async () => {
    const team = await createTestTeam();
    const otherTeam = await createTestTeam();
    const originalOwnerUser = await createTestUser();
    await createTestTeamPermission(originalOwnerUser.id, team.id, 'MEMBER');
    const newOwnerUser = await createTestUser();
    await createTestTeamPermission(newOwnerUser.id, otherTeam.id, 'MEMBER');
    const target = await createTestTarget({
      userId: originalOwnerUser.id,
      teamId: team.id
    });

    const adminUser = await createAdminUser();
    const response = await graphqlTestCall(
      REASSIGN_TARGET_MUTATION,
      {
        input: {
          teamId: team.id,
          targetId: target.id,
          newOwnerUserId: newOwnerUser.id
        }
      },
      { user: { id: adminUser.id } }
    );
    debugResponse(response);
    expect(response.data.reassignTarget).toEqual({
      code: "DOES_NOT_EXIST",
      success: false,
      message: "New user is not in this team.",
      item: null
    });

    const [dbTargets] = await sq.from`targets`.where({ id: target.id });
    expect(dbTargets.active).toBe(true);
    expect(dbTargets.userId).toBe(originalOwnerUser.id);
  });

  test("Happy Path Team ADMIN", async () => {
    const team = await createTestTeam();
    const originalOwnerUser = await createTestUser();
    await createTestTeamPermission(originalOwnerUser.id, team.id, 'MEMBER');
    const newOwnerUser = await createTestUser();
    await createTestTeamPermission(newOwnerUser.id, team.id, 'MEMBER');
    const target = await createTestTarget({
      userId: originalOwnerUser.id,
      teamId: team.id
    });

    const teamAdminUser = await createTestUser();
    await createTestTeamPermission(teamAdminUser.id, team.id, 'ADMIN');

    const response = await graphqlTestCall(
      REASSIGN_TARGET_MUTATION,
      {
        input: {
          teamId: team.id,
          targetId: target.id,
          newOwnerUserId: newOwnerUser.id
        }
      },
      { user: { id: teamAdminUser.id } }
    );
    debugResponse(response);
    expect(response.data.reassignTarget.item.id).toEqual(target.id);
    expect(response.data.reassignTarget).not.toBeNull();
    expect(response.data.reassignTarget.success).toEqual(true);

    const [dbTargets] = await sq.from`targets`.where({ id: target.id });
    expect(dbTargets.active).toBe(true);
    expect(dbTargets.userId).toBe(newOwnerUser.id);
  });

  // fail, not own target
  test("fails if not own target", async () => {
    const originalOwnerUser = await createTestUser();
    const newOwnerUser = await createTestUser();
    const nonAdminUser = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({
      userId: originalOwnerUser.id,
      teamId: team.id
    });

    const response = await graphqlTestCall(
      REASSIGN_TARGET_MUTATION,
      {
        input: {
          teamId: team.id,
          targetId: target.id,
          newOwnerUserId: newOwnerUser.id
        }
      },
      { user: { id: nonAdminUser.id } }
    );
    debugResponse(response);
    expect(response.data).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });
});
