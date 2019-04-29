import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createTestGlobalPerm
} from "../utils/createTestEntities";
import { sq } from "../db";

const REMOVE_TEAM_MUTATION = `
  mutation removeTeam($id: String!) {
     removeTeam(id: $id) {
      code
      success
      message
    }
  }
`;

beforeEach(async () => {
  await dbUp();
});

afterEach(async () => {
  await dbDown();
});

describe("Remove Team", () => {
  test("Happy Path", async () => {
    const adminUser = await createTestUser();
    await createTestGlobalPerm(adminUser.id, "ADMIN");
    const team = await createTestTeam();

    const response = await graphqlTestCall(
      REMOVE_TEAM_MUTATION,
      {
        id: team.id
      },
      { user: { id: adminUser.id } }
    );
    expect(response.data.removeTeam).not.toBeNull();
    expect(response.data.removeTeam.success).toEqual(true);
    const dbTeam = await sq.from`teams`;
    expect(dbTeam.length).toBe(0);

    // verify it cascades delete on perms
    const dbTeamPerm = await sq.from`team_permissions`;
    expect(dbTeamPerm.length).toBe(0);
  });

  test("Fails without ADMIN_TEAMS_CRUD global perm", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();

    const response = await graphqlTestCall(
      REMOVE_TEAM_MUTATION,
      {
        id: team.id
      },
      user.id
    );
    expect(response.data).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });
});
