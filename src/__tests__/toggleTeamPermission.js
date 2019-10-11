// import faker from "faker";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import { sq } from "../db";
import {
  createTestUser,
  createTestGlobalPerm,
  createTestTeam,
  createAdminUser,
  createTestTeamPermissionBit
} from "../utils/createTestEntities";
import { intToPerms } from "../utils/permissions/permBitWise";

const GRANT_TEAM_PERMISSION_MUTATION = `
mutation toggleTeamPermission($input: ToggleTeamPermissionInput!) {
    toggleTeamPermission(input: $input) {
        code
        success
        message
        item {
          id
          teamPermissions {
            team {
              id
            }
            permissions
          }
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

describe("User", () => {
  test("Happy Path", async () => {
    const adminUser = await createAdminUser();
    const granteeUser = await createTestUser();
    const permission = "MEMBER";
    const team = await createTestTeam();

    const response = await graphqlTestCall(
      GRANT_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      { user: { id: adminUser.id } }
    );
    debugResponse(response);
    expect(response.data.toggleTeamPermission.code).toEqual("OK");
    expect(response.data.toggleTeamPermission.success).toEqual(true);
    expect(response.data.toggleTeamPermission.message).toEqual(
      "Permission granted."
    );
    expect(response.data.toggleTeamPermission.item).toEqual({
      id: granteeUser.id,
      teamPermissions: [
        {
          permissions: [permission],
          team: {
            id: team.id
          }
        }
      ]
    });

    const [dbUserPerms] = await sq.from`team_permissions_bit`.where({
      userId: granteeUser.id,
      teamId: team.id
    });
    expect(dbUserPerms).not.toBeNull();
    expect(intToPerms(dbUserPerms.permission)[permission]).toBe(true);
  });

  test("fails if not authed", async () => {
    // const grantorUser = await createTestUser();
    const granteeUser = await createTestUser();
    const permission = "APPLICANT";
    const team = await createTestTeam();

    const response = await graphqlTestCall(GRANT_TEAM_PERMISSION_MUTATION, {
      input: { userId: granteeUser.id, teamId: team.id, permission }
    });
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  test("fails if not right Global permissions", async () => {
    const grantorUser = await createTestUser();
    const granteeUser = await createTestUser();
    const permission = "APPLICANT";
    const team = await createTestTeam();

    const response = await graphqlTestCall(
      GRANT_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      { user: { id: grantorUser.id } }
    );
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");

    await createTestGlobalPerm(grantorUser.id, "ADMIN");
    const response2 = await graphqlTestCall(
      GRANT_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      { user: { id: grantorUser.id } }
    );
    expect(response2.data.toggleTeamPermission.code).toEqual("OK");
    expect(response2.data.toggleTeamPermission.success).toEqual(true);
    expect(response2.data.toggleTeamPermission.message).toEqual(
      "Permission granted."
    );
  });

  test("fails if not right TEAM permissions", async () => {
    const grantorUser = await createTestUser();
    const granteeUser = await createTestUser();
    const permission = "MEMBER";
    const team = await createTestTeam();

    const response = await graphqlTestCall(
      GRANT_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      { user: { id: grantorUser.id } }
    );
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");

    await createTestTeamPermissionBit(grantorUser.id, team.id, { ADMIN: true });

    const response2 = await graphqlTestCall(
      GRANT_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      { user: { id: grantorUser.id } }
    );
    expect(response2.data.toggleTeamPermission.code).toEqual("OK");
    expect(response2.data.toggleTeamPermission.success).toEqual(true);
    expect(response2.data.toggleTeamPermission.message).toEqual(
      "Permission granted."
    );
  });

  test("fails if permission already exists", async () => {
    const adminUser = await createAdminUser();
    const granteeUser = await createTestUser();
    const permission = "APPLICANT";
    const team = await createTestTeam();

    // await createTestOLPermission(granteeUser.id, team.id, permission);
    await createTestTeamPermissionBit(granteeUser.id, team.id, {
      [permission]: true
    });

    const response = await graphqlTestCall(
      GRANT_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      { user: { id: adminUser.id } }
    );
    debugResponse(response);
    expect(response.data.toggleTeamPermission.code).toEqual("DUPLICATE");
    expect(response.data.toggleTeamPermission.success).toEqual(false);
    expect(response.data.toggleTeamPermission.message).toEqual(
      "User already has this permission."
    );
  });

  test("Remove applicant status if exists", async () => {
    const adminUser = await createAdminUser();
    const granteeUser = await createTestUser();
    const permission = "MEMBER";
    const team = await createTestTeam();

    // await createTestOLPermission(granteeUser.id, team.id, "APPLICANT");
    await createTestTeamPermissionBit(granteeUser.id, team.id, {
      APPLICANT: true
    });

    const response = await graphqlTestCall(
      GRANT_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      { user: { id: adminUser.id } }
    );
    expect(response.data.toggleTeamPermission.code).toEqual("OK");
    expect(response.data.toggleTeamPermission.success).toEqual(true);
    expect(response.data.toggleTeamPermission.message).toEqual(
      "Permission granted."
    );

    const [dbUserPerms] = await sq.from`team_permissions_bit`.where({
      userId: granteeUser.id,
      teamId: team.id
    });
    expect(dbUserPerms).not.toBeNull();
    expect(intToPerms(dbUserPerms.permission)[permission]).toBe(true);
    expect(intToPerms(dbUserPerms.permission)["APPLICANT"]).toBe(false);
  });

  test("User can have more than one team perm at a time.", async () => {
    const adminUser = await createAdminUser();
    const granteeUser = await createTestUser();
    const permission = "MEMBER";
    const team = await createTestTeam();

    // await createTestOLPermission(granteeUser.id, team.id, "ADMIN");
    await createTestTeamPermissionBit(granteeUser.id, team.id, { ADMIN: true });

    const response = await graphqlTestCall(
      GRANT_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      { user: { id: adminUser.id } }
    );
    expect(response.data.toggleTeamPermission.code).toEqual("OK");
    expect(response.data.toggleTeamPermission.success).toEqual(true);
    expect(response.data.toggleTeamPermission.message).toEqual(
      "Permission granted."
    );

    const [dbUserPerms] = await sq.from`team_permissions_bit`.where({
      userId: granteeUser.id,
      teamId: team.id
    });
    expect(dbUserPerms).not.toBeNull();
    expect(intToPerms(dbUserPerms.permission)[permission]).toBe(true);
    // FALSE vvv  because Joshua wants to stick with model for now where each
    // member can only have one permission. If we move to multi, should expect true
    // on next line
    expect(intToPerms(dbUserPerms.permission)["ADMIN"]).toBe(false);
  });

  test("Can Deny", async () => {
    const adminUser = await createAdminUser();
    const granteeUser = await createTestUser();
    const permission = "DENIED";
    const team = await createTestTeam();

    await createTestTeamPermissionBit(granteeUser.id, team.id, {
      MEMBER: true
    });

    const response = await graphqlTestCall(
      GRANT_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      { user: { id: adminUser.id } }
    );
    expect(response.data.toggleTeamPermission.code).toEqual("OK");
    expect(response.data.toggleTeamPermission.success).toEqual(true);
    expect(response.data.toggleTeamPermission.message).toEqual(
      "Permission granted."
    );
    expect(response.data.toggleTeamPermission.item).toEqual({
      id: granteeUser.id,
      teamPermissions: [
        {
          permissions: [permission],
          team: {
            id: team.id
          }
        }
      ]
    });

    const [dbUserPerms] = await sq.from`team_permissions_bit`.where({
      userId: granteeUser.id,
      teamId: team.id
    });
    expect(dbUserPerms).not.toBeNull();
    expect(intToPerms(dbUserPerms.permission)[permission]).toBe(true);
    // When deny, all other should be false
    expect(intToPerms(dbUserPerms.permission)["MEMBER"]).toBe(false);
  });
});
