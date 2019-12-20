// import faker from "faker";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import { sq } from "../db";
import {
  createTestUser,
  createTestTeam,
  createTestTeamPermission
} from "../utils/createTestEntities";

const SET_TEAM_TOS_ACCEPTANCE_MUTATION = `
mutation setTeamTosAcceptance($input: SetTeamTosAcceptanceInput!) {
    setTeamTosAcceptance(input: $input) {
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
            acceptedTos
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
    const user = await createTestUser();
    const permission = "MEMBER";
    const team = await createTestTeam();
    await createTestTeamPermission(user.id, team.id, "MEMBER");
    const response = await graphqlTestCall(
      SET_TEAM_TOS_ACCEPTANCE_MUTATION,
      {
        input: { teamId: team.id, acceptTos: true }
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.setTeamTosAcceptance.code).toEqual("OK");
    expect(response.data.setTeamTosAcceptance.success).toEqual(true);
    expect(response.data.setTeamTosAcceptance.message).toEqual(
      "Team TOS acceptance set."
    );
    expect(response.data.setTeamTosAcceptance.item).toEqual({
      id: user.id,
      teamPermissions: [
        {
          permissions: [permission],
          team: {
            id: team.id
          },
          acceptedTos: true
        }
      ]
    });

    const [dbUserPerms] = await sq.from`team_permissions`.where({
      userId: user.id,
      teamId: team.id
    });
    expect(dbUserPerms).not.toBeNull();
    expect(dbUserPerms.acceptedTos).toBe(true);
  });
});
