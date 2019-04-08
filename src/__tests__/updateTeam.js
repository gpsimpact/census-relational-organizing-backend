import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createTestGlobalPerm
} from "../utils/createTestEntities";
import { sq } from "../db";

const UPDATE_TEAM_MUTATION = `
  mutation updateTeam($id: String!, $input: UpdateTeamInput!){
    updateTeam(id:$id, input: $input) {
      code
      message
      success
      item {
        id
        name 
      }
    }
  }
`;

beforeEach(async () => {
  await dbUp();
});

afterEach(async () => {
  await dbDown();
});

describe("Create Team", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();

    await createTestGlobalPerm(user.id, "ADMIN_TEAMS_CRUD");

    const newData = {
      name: faker.company.companyName()
    };

    const response = await graphqlTestCall(
      UPDATE_TEAM_MUTATION,
      {
        id: team.id,
        input: newData
      },
      { user: { id: user.id } }
    );
    expect(response.data.updateTeam).not.toBeNull();
    expect(response.data.updateTeam.item.name).toEqual(newData.name);
    expect(response.data.updateTeam.item.abbreviation).toEqual(
      team.abbreviation
    );
    const [dbTeam] = await sq.from`teams`.where({ id: team.id });
    expect(dbTeam).toBeDefined();
    expect(dbTeam.name).toEqual(newData.name);
    expect(dbTeam.abbreviation).toEqual(team.abbreviation);
  });

  test("Fails without ADMIN_TEAMS_CRUD global perm", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();

    const newData = {
      name: faker.company.companyName()
    };

    const response = await graphqlTestCall(
      UPDATE_TEAM_MUTATION,
      {
        id: team.id,
        input: newData
      },
      { user: { id: user.id } }
    );

    // should return correct data
    expect(response.data).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });
});
