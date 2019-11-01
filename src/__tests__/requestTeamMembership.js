// import faker from "faker";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import { sq } from "../db";
import {
  createTestUser,
  //   createTestGlobalPerm,
  createTestTeam,
  // createTestOLPermission,
  createTestTeamPermissionBit,
  createAdminUser
} from "../utils/createTestEntities";
import { intToPerms } from "../utils/permissions/permBitWise";

const REQUEST_TEAM_MEMBERSHIP_MUTATION = `
mutation requestTeamMembership($teamId: String!) {
    requestTeamMembership(teamId: $teamId) {
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
    const user = await createTestUser();
    const team = await createTestTeam();
    const teamAdmin = await createTestUser();
    await createTestTeamPermissionBit(teamAdmin.id, team.id, { ADMIN: true });
    const mockSendEmail = jest.fn();

    const response = await graphqlTestCall(
      REQUEST_TEAM_MEMBERSHIP_MUTATION,
      { teamId: team.id },
      { user: { id: user.id }, sendEmail: mockSendEmail }
    );
    debugResponse(response);
    expect(response.data.requestTeamMembership.code).toEqual("OK");
    expect(response.data.requestTeamMembership.success).toEqual(true);
    expect(response.data.requestTeamMembership.message).toEqual(
      "Application Successful."
    );

    const [dbUserPerms] = await sq.from`team_permissions_bit`.where({
      userId: user.id,
      teamId: team.id
    });
    expect(dbUserPerms).not.toBeNull();
    expect(intToPerms(dbUserPerms.permission).APPLICANT).toBe(true);

    expect(mockSendEmail).toHaveBeenCalled();
    expect(mockSendEmail).toHaveBeenCalledWith({
      to: [teamAdmin.email],
      from: process.env.EMAIL_SENDER,
      templateId: "d-7b546784ced74cb7b6192588ca2feaee",
      dynamic_template_data: {
        TEAM_NAME: team.name,
        APPLICANT_NAME: `${user.firstName} ${user.lastName}`,
        DASHBOARD_LINK: `${process.env.FRONTEND_HOST}/dash/vols?team=${team.id}`
      }
    });
  });

  test("fails if not authed", async () => {
    // const user = await createTestUser();
    const team = await createTestTeam();

    const response = await graphqlTestCall(REQUEST_TEAM_MEMBERSHIP_MUTATION, {
      teamId: team.id
    });
    // expect(response.data.requestTeamMembership).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  test("fails if already applicant", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    await createTestTeamPermissionBit(user.id, team.id, { APPLICANT: true });
    const response = await graphqlTestCall(
      REQUEST_TEAM_MEMBERSHIP_MUTATION,
      {
        teamId: team.id
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.requestTeamMembership.code).toEqual("DUPLICATE");
    expect(response.data.requestTeamMembership.success).toEqual(false);
    expect(response.data.requestTeamMembership.message).toEqual(
      "An application for membership is already pending."
    );
  });

  test("fails if any type permission already set on team", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    await createTestTeamPermissionBit(user.id, team.id, {
      DENIED: true
    });
    const response = await graphqlTestCall(
      REQUEST_TEAM_MEMBERSHIP_MUTATION,
      {
        teamId: team.id
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.requestTeamMembership.code).toEqual("INELIGIBLE");
    expect(response.data.requestTeamMembership.success).toEqual(false);
    expect(response.data.requestTeamMembership.message).toEqual(
      "You are ineligible to apply for membership."
    );
  });
});
