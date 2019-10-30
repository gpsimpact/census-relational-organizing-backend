// import faker from "faker";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import { sq } from "../db";
import {
  createTestUser,
  //   createTestGlobalPerm,
  createTestTeam,
  createTestTeamPermissionBit
} from "../utils/createTestEntities";
// import { intToPerms } from "../utils/permissions/permBitWise";

const CANCEL_TEAM_MEMBERSHIP_REQUEST_MUTATION = `
mutation cancelTeamMembershipRequest($teamId: String!) {
    cancelTeamMembershipRequest(teamId: $teamId) {
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
    // await createTestOLPermission(user.id, team.id, "APPLICANT");
    await createTestTeamPermissionBit(user.id, team.id, { APPLICANT: true });
    const response = await graphqlTestCall(
      CANCEL_TEAM_MEMBERSHIP_REQUEST_MUTATION,
      { teamId: team.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.cancelTeamMembershipRequest.code).toEqual("OK");
    expect(response.data.cancelTeamMembershipRequest.success).toEqual(true);
    expect(response.data.cancelTeamMembershipRequest.message).toEqual(
      "Application Successfully Cancelled."
    );

    const [dbUserPerms] = await sq.from`team_permissions_bit`.where({
      userId: user.id,
      teamId: team.id
    });
    expect(dbUserPerms).toBeUndefined();
    // expect(intToPerms(dbUserPerms.permission)["APPLICANT"]).toBe(false);
  });

  test("fails if not authed", async () => {
    // const user = await createTestUser();
    const team = await createTestTeam();

    const response = await graphqlTestCall(
      CANCEL_TEAM_MEMBERSHIP_REQUEST_MUTATION,
      {
        teamId: team.id
      }
    );
    // expect(response.data.requestTeamMembership).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });
});
