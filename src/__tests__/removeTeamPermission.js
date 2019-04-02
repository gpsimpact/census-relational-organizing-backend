// import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import { sq } from "../db";
import {
  createTestUser,
  createTestGlobalPerm,
  createTestTeam,
  createTestOLPermission
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

describe("User", () => {
  test("Happy Path", async () => {
    const grantorUser = await createTestUser();
    const granteeUser = await createTestUser();
    const permission = "ASSIGNPERMISSIONS";
    const team = await createTestTeam();
    await createTestOLPermission(granteeUser.id, team.id, permission);
    await createTestGlobalPerm(grantorUser.id, "ADMIN_TEAMS_ASSIGNPERMISSIONS");

    const response = await graphqlTestCall(
      REMOVE_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      grantorUser.id
    );
    // console.log(response);
    expect(response.data.removeTeamPermission.code).toEqual("OK");
    expect(response.data.removeTeamPermission.success).toEqual(true);
    expect(response.data.removeTeamPermission.message).toEqual(
      "Permission removed."
    );

    const dbUserPerms = await sq.from`team_permissions`.where({
      userId: granteeUser.id,
      teamId: team.id
    });
    expect(dbUserPerms).toHaveLength(0);
  });

  test("fails if not authed", async () => {
    // const grantorUser = await createTestUser();
    const granteeUser = await createTestUser();
    const permission = "APPLICANT";
    const team = await createTestTeam();
    await createTestOLPermission(granteeUser.id, team.id, permission);
    const response = await graphqlTestCall(REMOVE_TEAM_PERMISSION_MUTATION, {
      input: { userId: granteeUser.id, teamId: team.id, permission }
    });
    // console.log(response);
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  test("fails if not right Global permissions", async () => {
    const grantorUser = await createTestUser();
    const granteeUser = await createTestUser();
    const permission = "APPLICANT";
    const team = await createTestTeam();
    await createTestOLPermission(granteeUser.id, team.id, permission);
    const response = await graphqlTestCall(
      REMOVE_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      grantorUser.id
    );
    // console.log(response);
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");

    await createTestGlobalPerm(grantorUser.id, "ADMIN_TEAMS_ASSIGNPERMISSIONS");
    const response2 = await graphqlTestCall(
      REMOVE_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      grantorUser.id
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
    await createTestOLPermission(granteeUser.id, team.id, permission);
    const response = await graphqlTestCall(
      REMOVE_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      grantorUser.id
    );
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");

    await createTestOLPermission(grantorUser.id, team.id, "ASSIGNPERMISSIONS");

    const response2 = await graphqlTestCall(
      REMOVE_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      grantorUser.id
    );
    expect(response2.data.removeTeamPermission.code).toEqual("OK");
    expect(response2.data.removeTeamPermission.success).toEqual(true);
    expect(response2.data.removeTeamPermission.message).toEqual(
      "Permission removed."
    );
  });

  test("fails if permission does not exist", async () => {
    const grantorUser = await createTestUser();
    const granteeUser = await createTestUser();
    const permission = "APPLICANT";
    const team = await createTestTeam();
    await createTestGlobalPerm(grantorUser.id, "ADMIN_TEAMS_ASSIGNPERMISSIONS");

    const response = await graphqlTestCall(
      REMOVE_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      grantorUser.id
    );
    // console.log(response);
    expect(response.data.removeTeamPermission.code).toEqual("DOES_NOT_EXIST");
    expect(response.data.removeTeamPermission.success).toEqual(false);
    expect(response.data.removeTeamPermission.message).toEqual(
      "User does not have this permission."
    );
  });
});
