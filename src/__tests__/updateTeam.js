import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createAdminUser,
  createTestTeamPermissionBit
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
        active
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

describe("Create Team", () => {
  test("Happy Path by Global Admin", async () => {
    const team = await createTestTeam();
    const adminUser = await createAdminUser();

    const newData = {
      name: faker.company.companyName()
    };

    const response = await graphqlTestCall(
      UPDATE_TEAM_MUTATION,
      {
        id: team.id,
        input: newData
      },
      { user: { id: adminUser.id } }
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

  test("Admin can set team inactive", async () => {
    const team = await createTestTeam();
    const adminUser = await createAdminUser();

    const newData = {
      active: false
    };

    const response = await graphqlTestCall(
      UPDATE_TEAM_MUTATION,
      {
        id: team.id,
        input: newData
      },
      { user: { id: adminUser.id } }
    );
    expect(response.data.updateTeam).not.toBeNull();
    expect(response.data.updateTeam.item.active).toEqual(newData.active);
    expect(response.data.updateTeam.item.name).toEqual(team.name);
    const [dbTeam] = await sq.from`teams`.where({ id: team.id });
    expect(dbTeam).toBeDefined();
    expect(dbTeam.active).toEqual(false);
    expect(dbTeam.name).toEqual(team.name);
  });

  test("Happy Path by Team  Admin", async () => {
    const team = await createTestTeam();
    const user = await createTestUser();
    await createTestTeamPermissionBit(user.id, team.id, { ADMIN: true });

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
