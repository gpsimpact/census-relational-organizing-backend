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

const GRANT_TEAM_PERMISSION_MUTATION = `
mutation grantTeamPermission($input: GrantTeamPermissionInput!) {
    grantTeamPermission(input: $input) {
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

    await createTestGlobalPerm(grantorUser.id, "ADMIN_TEAMS_ASSIGNPERMISSIONS");

    const response = await graphqlTestCall(
      GRANT_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      grantorUser.id
    );
    expect(response.data.grantTeamPermission.code).toEqual("OK");
    expect(response.data.grantTeamPermission.success).toEqual(true);
    expect(response.data.grantTeamPermission.message).toEqual(
      "Permission granted."
    );

    const dbUserPerms = await sq.from`team_permissions`.where({
      userId: granteeUser.id,
      teamId: team.id
    });
    expect(dbUserPerms).toHaveLength(1);
    expect(dbUserPerms[0].permission).toEqual(permission);
  });

  test("fails if not authed", async () => {
    // const grantorUser = await createTestUser();
    const granteeUser = await createTestUser();
    const permission = "APPLICANT";
    const team = await createTestTeam();

    const response = await graphqlTestCall(GRANT_TEAM_PERMISSION_MUTATION, {
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

    const response = await graphqlTestCall(
      GRANT_TEAM_PERMISSION_MUTATION,
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
      GRANT_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      grantorUser.id
    );
    expect(response2.data.grantTeamPermission.code).toEqual("OK");
    expect(response2.data.grantTeamPermission.success).toEqual(true);
    expect(response2.data.grantTeamPermission.message).toEqual(
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
      grantorUser.id
    );
    // console.log(response);
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");

    await createTestOLPermission(grantorUser.id, team.id, "ASSIGNPERMISSIONS");

    const response2 = await graphqlTestCall(
      GRANT_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      grantorUser.id
    );
    expect(response2.data.grantTeamPermission.code).toEqual("OK");
    expect(response2.data.grantTeamPermission.success).toEqual(true);
    expect(response2.data.grantTeamPermission.message).toEqual(
      "Permission granted."
    );
  });

  test("fails if permission already exists", async () => {
    const grantorUser = await createTestUser();
    const granteeUser = await createTestUser();
    const permission = "APPLICANT";
    const team = await createTestTeam();

    await createTestGlobalPerm(grantorUser.id, "ADMIN_TEAMS_ASSIGNPERMISSIONS");

    await createTestOLPermission(granteeUser.id, team.id, permission);

    const response = await graphqlTestCall(
      GRANT_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      grantorUser.id
    );
    // console.log(response);
    expect(response.data.grantTeamPermission.code).toEqual("DUPLICATE");
    expect(response.data.grantTeamPermission.success).toEqual(false);
    expect(response.data.grantTeamPermission.message).toEqual(
      "User already has this permission."
    );
  });

  test("Remove applicant status if exists", async () => {
    const grantorUser = await createTestUser();
    const granteeUser = await createTestUser();
    const permission = "MEMBER";
    const team = await createTestTeam();

    await createTestGlobalPerm(grantorUser.id, "ADMIN_TEAMS_ASSIGNPERMISSIONS");
    await createTestOLPermission(granteeUser.id, team.id, "APPLICANT");

    const response = await graphqlTestCall(
      GRANT_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      grantorUser.id
    );
    expect(response.data.grantTeamPermission.code).toEqual("OK");
    expect(response.data.grantTeamPermission.success).toEqual(true);
    expect(response.data.grantTeamPermission.message).toEqual(
      "Permission granted."
    );

    const dbUserPerms = await sq.from`team_permissions`.where({
      userId: granteeUser.id,
      teamId: team.id
    });
    expect(dbUserPerms).toHaveLength(1);
    expect(dbUserPerms[0].permission).toEqual(permission);
  });
});