import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createTestGlobalPerm,
  createTestTeamPermissionBit
} from "../utils/createTestEntities";
import { sq } from "../db";

const CREATE_TTIB_MUTATION = `
    mutation createTtib($input: CreateTtibInput!) {
        createTtib(input: $input) {
            code
            message
            success
            item {
                id
                text
                userId
                createdAt
                updatedAt
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
describe("Create Ttib", () => {
  test("happy path as team admin", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    await createTestTeamPermissionBit(user.id, team.id, { ADMIN: true });

    const newData = {
      text: "I am text!",
      teamId: team.id
    };

    const response = await graphqlTestCall(
      CREATE_TTIB_MUTATION,
      {
        input: newData
      },
      { user: { id: user.id } }
    );
    expect(response.data.createTtib.code).toBe("OK");
    expect(response.data.createTtib.message).toBe("TTIB has been created.");
    expect(response.data.createTtib.success).toBe(true);
    expect(response.data.createTtib.item.userId).toBe(user.id);
    expect(response.data.createTtib.item.text).toBe(newData.text);
    const [dbTTIB] = await sq.from`tibs`.where({
      id: response.data.createTtib.item.id
    });
    expect(dbTTIB).not.toBeNull();
    expect(dbTTIB.active).toBe(true);
    expect(dbTTIB.visible).toBe(true);
    expect(dbTTIB.userId).toBe(user.id);
  });

  test("happy path as global admin", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    await createTestGlobalPerm(user.id, "ADMIN");

    const newData = {
      text: "I am text!",
      teamId: team.id
    };

    const response = await graphqlTestCall(
      CREATE_TTIB_MUTATION,
      {
        input: newData
      },
      { user: { id: user.id } }
    );
    expect(response.data.createTtib.code).toBe("OK");
    expect(response.data.createTtib.message).toBe("TTIB has been created.");
    expect(response.data.createTtib.success).toBe(true);
    expect(response.data.createTtib.item.userId).toBe(user.id);
    expect(response.data.createTtib.item.text).toBe(newData.text);
    const [dbTTIB] = await sq.from`tibs`.where({
      id: response.data.createTtib.item.id
    });
    expect(dbTTIB).not.toBeNull();
    expect(dbTTIB.active).toBe(true);
    expect(dbTTIB.visible).toBe(true);
    expect(dbTTIB.userId).toBe(user.id);
  });
});
