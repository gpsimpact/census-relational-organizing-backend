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
    const mockSendEmail = jest.fn();

    const response = await graphqlTestCall(
      GRANT_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      { user: { id: adminUser.id }, sendEmail: mockSendEmail }
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

    const [dbUserPerms] = await sq.from`team_permissions`.where({
      userId: granteeUser.id,
      teamId: team.id
    });
    expect(dbUserPerms).not.toBeNull();
    expect(dbUserPerms.permission).toBe(permission);

    expect(mockSendEmail).toHaveBeenCalled();
    expect(mockSendEmail).toHaveBeenCalledWith({
      to: granteeUser.email,
      from: process.env.EMAIL_SENDER,
      templateId: "d-c339968d7dea473db309b6c4a673d42b",
      dynamic_template_data: {
        APPLICATION_PERMISSION: permission,
        TEAM_NAME: team.name,
        APPLICANT_NAME: `${granteeUser.firstName} ${granteeUser.lastName}`,
        DASHBOARD_LINK: `${process.env.FRONTEND_HOST}/dash?team=${team.id}`
      }
    });
  });

  test("fails if not authed", async () => {
    // const grantorUser = await createTestUser();
    const granteeUser = await createTestUser();
    const permission = "APPLICANT";
    const team = await createTestTeam();
    const mockSendEmail = jest.fn();

    const response = await graphqlTestCall(
      GRANT_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      { sendEmail: mockSendEmail }
    );
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  test("fails if not right Global permissions", async () => {
    const grantorUser = await createTestUser();
    const granteeUser = await createTestUser();
    const permission = "APPLICANT";
    const team = await createTestTeam();
    const mockSendEmail = jest.fn();

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
      { user: { id: grantorUser.id }, sendEmail: mockSendEmail }
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
    const mockSendEmail = jest.fn();

    const response = await graphqlTestCall(
      GRANT_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      { user: { id: grantorUser.id }, sendEmail: mockSendEmail }
    );
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");

    await createTestTeamPermission(grantorUser.id, team.id, "ADMIN");

    const response2 = await graphqlTestCall(
      GRANT_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      { user: { id: grantorUser.id }, sendEmail: mockSendEmail }
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

    // await createTestTeamPermission(granteeUser.id, team.id, permission);
    await createTestTeamPermission(granteeUser.id, team.id, permission);
    const mockSendEmail = jest.fn();

    const response = await graphqlTestCall(
      GRANT_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      { user: { id: adminUser.id }, sendEmail: mockSendEmail }
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

    // await createTestTeamPermission(granteeUser.id, team.id, "APPLICANT");
    await createTestTeamPermission(granteeUser.id, team.id, "APPLICANT");
    const mockSendEmail = jest.fn();

    const response = await graphqlTestCall(
      GRANT_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      { user: { id: adminUser.id }, sendEmail: mockSendEmail }
    );
    expect(response.data.toggleTeamPermission.code).toEqual("OK");
    expect(response.data.toggleTeamPermission.success).toEqual(true);
    expect(response.data.toggleTeamPermission.message).toEqual(
      "Permission granted."
    );

    const [dbUserPerms] = await sq.from`team_permissions`.where({
      userId: granteeUser.id,
      teamId: team.id
    });
    expect(dbUserPerms).not.toBeNull();
    expect(dbUserPerms.permission).toBe(permission);
    expect(dbUserPerms.permission).not.toBe("APPLICANT");
  });

  test("User can have more than one team perm at a time.", async () => {
    const adminUser = await createAdminUser();
    const granteeUser = await createTestUser();
    const permission = "MEMBER";
    const team = await createTestTeam();

    // await createTestTeamPermission(granteeUser.id, team.id, "ADMIN");
    await createTestTeamPermission(granteeUser.id, team.id, "ADMIN");
    const mockSendEmail = jest.fn();

    const response = await graphqlTestCall(
      GRANT_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      { user: { id: adminUser.id }, sendEmail: mockSendEmail }
    );
    expect(response.data.toggleTeamPermission.code).toEqual("OK");
    expect(response.data.toggleTeamPermission.success).toEqual(true);
    expect(response.data.toggleTeamPermission.message).toEqual(
      "Permission granted."
    );

    const [dbUserPerms] = await sq.from`team_permissions`.where({
      userId: granteeUser.id,
      teamId: team.id
    });
    expect(dbUserPerms).not.toBeNull();
    expect(dbUserPerms.permission).toBe(permission);
    // FALSE vvv  because Joshua wants to stick with model for now where each
    // member can only have one permission. If we move to multi, should expect true
    // on next line
    expect(dbUserPerms.permission).not.toBe("ADMIN");
  });

  test("Can Deny", async () => {
    const adminUser = await createAdminUser();
    const granteeUser = await createTestUser();
    const permission = "DENIED";
    const team = await createTestTeam();

    await createTestTeamPermission(granteeUser.id, team.id, "MEMBER");
    const mockSendEmail = jest.fn();

    const response = await graphqlTestCall(
      GRANT_TEAM_PERMISSION_MUTATION,
      {
        input: { userId: granteeUser.id, teamId: team.id, permission }
      },
      { user: { id: adminUser.id }, sendEmail: mockSendEmail }
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

    const [dbUserPerms] = await sq.from`team_permissions`.where({
      userId: granteeUser.id,
      teamId: team.id
    });
    expect(dbUserPerms).not.toBeNull();
    expect(dbUserPerms.permission).toBe(permission);
    // When deny, all other should be false
    expect(dbUserPerms.permission).not.toBe("MEMBER");
  });
});
