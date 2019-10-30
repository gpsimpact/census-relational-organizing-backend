import faker from "faker";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createAdminUser,
  createTestForm,
  createTestTaskDefinition,
  createTestTaskAssignment
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

afterAll(async () => {
  await dbDown();
});

describe("Create Team", () => {
  test("Happy Path", async () => {
    const adminUser = await createAdminUser();

    const newTeamData = {
      name: faker.company.companyName()
    };

    // no input
    const response = await graphqlTestCall(
      CREATE_TEAM_MUTATION,
      {
        input: newTeamData
      },
      { user: { id: adminUser.id } }
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
    const adminUser = await createAdminUser();

    // no input
    const response1 = await graphqlTestCall(
      CREATE_TEAM_MUTATION,
      {
        input: {
          name: team.name
        }
      },
      { user: { id: adminUser.id } }
    );

    expect(response1.data.createTeam).not.toBeNull();
    expect(response1.data.createTeam.success).toBe(false);
    expect(response1.data.createTeam.code).toBe("DUPLICATE");
  });

  test("Fails without ADMIN_TEAMS_CRUD global perm", async () => {
    const user = await createTestUser();

    const newTeamData = {
      name: faker.company.companyName()
    };

    // no input
    const response = await graphqlTestCall(
      CREATE_TEAM_MUTATION,
      {
        input: newTeamData
      },
      { user: { id: user.id } }
    );
    // should return correct data
    expect(response.data).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  test("Default taskAssignments are created", async () => {
    const adminUser = await createAdminUser();

    const newTeamData = {
      name: faker.company.companyName()
    };

    const formA = await createTestForm(adminUser.id);
    const taskDefinitionA = await createTestTaskDefinition(
      formA.id,
      adminUser.id
    );
    await sq`task_definitions`
      .set({ autoAddNewTeams: true, autoAddSortValue: 0 })
      .where({ id: taskDefinitionA.id });

    const formB = await createTestForm(adminUser.id);
    const taskDefinitionB = await createTestTaskDefinition(
      formB.id,
      adminUser.id
    );
    await sq`task_definitions`
      .set({ autoAddNewTeams: true, autoAddSortValue: 1 })
      .where({ id: taskDefinitionB.id });

    // no input
    const response = await graphqlTestCall(
      CREATE_TEAM_MUTATION,
      {
        input: newTeamData
      },
      { user: { id: adminUser.id } }
    );
    debugResponse(response);
    expect(response.data.createTeam).not.toBeNull();
    expect(response.data.createTeam.item.name).toEqual(newTeamData.name);
    const [dbTaskAssignmentsA] = await sq.from`task_assignments`.where({
      teamId: response.data.createTeam.item.id,
      taskDefinitionId: taskDefinitionA.id
    });
    expect(dbTaskAssignmentsA).toBeDefined();
    expect(dbTaskAssignmentsA.sortValue).toEqual(0);
    expect(dbTaskAssignmentsA.taskRequiredRoles).toEqual(8);

    const [dbTaskAssignmentsB] = await sq.from`task_assignments`.where({
      teamId: response.data.createTeam.item.id,
      taskDefinitionId: taskDefinitionB.id
    });
    expect(dbTaskAssignmentsB).toBeDefined();
    expect(dbTaskAssignmentsB.sortValue).toEqual(1);
    expect(dbTaskAssignmentsB.taskRequiredRoles).toEqual(8);
  });
});
