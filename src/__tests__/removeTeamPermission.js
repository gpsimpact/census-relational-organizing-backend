// import faker from "faker";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import { sq } from "../db";
import {
  createTestUser,
  createTestGlobalPerm,
  createTestTeam,
  createAdminUser,
  createTestTeamPermission
} from "../utils/createTestEntities";

const REMOVE_TEAM_PERMISSION_MUTATION = `
mutation removeTeamPermission($input: RemoveTeamPermissionInput!) {
    removeTeamPermission(input: $input) {
        code
        success
        message
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
    await createTestTeamPermission(granteeUser.id, team.id, permission);

    const response = await graphqlTestCall(
      REMOVE_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      { user: { id: adminUser.id } }
    );
    debugResponse(response);
    expect(response.data.removeTeamPermission.code).toEqual("OK");
    expect(response.data.removeTeamPermission.success).toEqual(true);
    expect(response.data.removeTeamPermission.message).toEqual(
      "Permission removed."
    );

    const dbUserPerms = await sq.from`team_permissions`.where({
      userId: granteeUser.id,
      teamId: team.id
    });
    expect(dbUserPerms.permission).not.toBe("MEMBER");
  });

  test("fails if not authed", async () => {
    // const grantorUser = await createTestUser();
    const granteeUser = await createTestUser();
    const permission = "APPLICANT";
    const team = await createTestTeam();
    await createTestTeamPermission(granteeUser.id, team.id, permission);
    const response = await graphqlTestCall(REMOVE_TEAM_PERMISSION_MUTATION, {
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
    await createTestTeamPermission(granteeUser.id, team.id, permission);
    const response = await graphqlTestCall(
      REMOVE_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      { user: { id: grantorUser.id } }
    );
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");

    await createTestGlobalPerm(grantorUser.id, "ADMIN");
    const response2 = await graphqlTestCall(
      REMOVE_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      { user: { id: grantorUser.id } }
    );
    expect(response2.data.removeTeamPermission.code).toEqual("OK");
    expect(response2.data.removeTeamPermission.success).toEqual(true);
    expect(response2.data.removeTeamPermission.message).toEqual(
      "Permission removed."
    );
  });

  test("fails if not right TEAM permissions", async () => {
    const grantorUser = await createTestUser();
    const granteeUser = await createTestUser();
    const permission = "MEMBER";
    const team = await createTestTeam();
    await createTestTeamPermission(granteeUser.id, team.id, permission);
    const response = await graphqlTestCall(
      REMOVE_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      { user: { id: grantorUser.id } }
    );
    debugResponse(response);
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");

    await createTestTeamPermission(grantorUser.id, team.id, "ADMIN");

    const response2 = await graphqlTestCall(
      REMOVE_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      { user: { id: grantorUser.id } }
    );
    expect(response2.data.removeTeamPermission.code).toEqual("OK");
    expect(response2.data.removeTeamPermission.success).toEqual(true);
    expect(response2.data.removeTeamPermission.message).toEqual(
      "Permission removed."
    );
  });

  test("fails if permission does not exist", async () => {
    const adminUser = await createAdminUser();
    const granteeUser = await createTestUser();
    const permission = "APPLICANT";
    const team = await createTestTeam();

    const response = await graphqlTestCall(
      REMOVE_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      { user: { id: adminUser.id } }
    );
    expect(response.data.removeTeamPermission.code).toEqual("DOES_NOT_EXIST");
    expect(response.data.removeTeamPermission.success).toEqual(false);
    expect(response.data.removeTeamPermission.message).toEqual(
      "User does not have this permission."
    );
  });
});
