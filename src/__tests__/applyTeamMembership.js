// import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import { sq } from "../db";
import {
  createTestUser,
  //   createTestGlobalPerm,
  createTestTeam,
  createTestOLPermission
} from "../utils/createTestEntities";

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

describe("User", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();

    const response = await graphqlTestCall(
      REQUEST_TEAM_MEMBERSHIP_MUTATION,
      { teamId: team.id },
      user.id
    );
    // console.log(response);
    expect(response.data.requestTeamMembership.code).toEqual("OK");
    expect(response.data.requestTeamMembership.success).toEqual(true);
    expect(response.data.requestTeamMembership.message).toEqual(
      "Application Successful."
    );

    const dbUserPerms = await sq.from`team_permissions`.where({
      userId: user.id,
      teamId: team.id
    });
    expect(dbUserPerms).toHaveLength(1);
    expect(dbUserPerms[0].permission).toEqual("APPLICANT");
  });

  test("fails if not authed", async () => {
    // const user = await createTestUser();
    const team = await createTestTeam();

    const response = await graphqlTestCall(REQUEST_TEAM_MEMBERSHIP_MUTATION, {
      teamId: team.id
    });
    // console.log(response);
    // expect(response.data.requestTeamMembership).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  test("fails if already applicant", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    await createTestOLPermission(user.id, team.id, "MOREVALUEEXPERIMENT");
    await createTestOLPermission(user.id, team.id, "APPLICANT");
    const response = await graphqlTestCall(
      REQUEST_TEAM_MEMBERSHIP_MUTATION,
      {
        teamId: team.id
      },
      user.id
    );
    // console.log(response);
    expect(response.data.requestTeamMembership.code).toEqual("DUPLICATE");
    expect(response.data.requestTeamMembership.success).toEqual(false);
    expect(response.data.requestTeamMembership.message).toEqual(
      "An application for membership is already pending."
    );
  });
});
