import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createTestGlobalPerm
} from "../utils/createTestEntities";
import { sq } from "../db";

const CREATE_TEAM_MUTATION = `
  mutation createTeam($input: CreateTeamInput!) {
     createTeam(input:$input) {
      code
      success
      message
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
    await createTestGlobalPerm(user.id, "ADMIN_TEAMS_CRUD");

    const newTeamData = {
      name: faker.company.companyName()
    };

    // no input
    const response = await graphqlTestCall(
      CREATE_TEAM_MUTATION,
      {
        input: newTeamData
      },
      user.id
    );
    expect(response.data.createTeam).not.toBeNull();
    expect(response.data.createTeam.item.name).toEqual(newTeamData.name);
    const [dbTeam] = await sq.from`teams`.where({
      id: response.data.createTeam.item.id
    });
    expect(dbTeam).toBeDefined();
    expect(dbTeam.name).toEqual(newTeamData.name);
    expect(dbTeam.abbreviation).toEqual(newTeamData.abbreviation);
  });

  test("Duplicate error", async () => {
    const team = await createTestTeam();
    const user = await createTestUser();
    await createTestGlobalPerm(user.id, "ADMIN_TEAMS_CRUD");

    // no input
    const response1 = await graphqlTestCall(
      CREATE_TEAM_MUTATION,
      {
        input: {
          name: team.name
        }
      },
      user.id
    );

    expect(response1.data.createTeam).not.toBeNull();
    expect(response1.data.createTeam.success).toBe(false);
    expect(response1.data.createTeam.code).toBe("DUPLICATE");
  });

  test("Fails without ADMIN_TEAMS_CRUD global perm", async () => {
    const user = await createTestUser();
    // await createGlobalPerm(user, AllowedGlobalPermissions.ADMIN_TEAMS_CRUD);

    const newTeamData = {
      name: faker.company.companyName()
    };

    // no input
    const response = await graphqlTestCall(
      CREATE_TEAM_MUTATION,
      {
        input: newTeamData
      },
      user.id
    );
    // should return correct data
    expect(response.data).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });
});
