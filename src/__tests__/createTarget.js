import faker from "faker";
import _ from "lodash";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createTestTtib,
  createTestOLPermission
} from "../utils/createTestEntities";
import { sq } from "../db";

const CREATE_USER_MUTATION = `
  mutation createTarget($input: CreateTargetInput!) {
     createTarget(input:$input) {
      code
      success
      message
      item {
        id
        firstName
        lastName
        address
        city
        state
        zip5
        phone
        email
        twitterHandle
        facebookProfile
        householdSize
      }
    }
  }
`;

beforeEach(async () => {
  await dbUp();
});

describe("Create Target", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    await createTestOLPermission(user.id, team.id, "MEMBER");

    const newTargetData = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      address: faker.address.streetAddress(),
      city: faker.address.city(),
      state: faker.address.state(),
      zip5: faker.address.zipCode().substring(0, 5),
      phone: `+${faker.random.number({
        min: 10000000000,
        max: 19999999999
      })}`,
      twitterHandle: `@${faker.random.word()}`,
      facebookProfile: faker.random.word(),
      householdSize: faker.random.number({
        min: 1,
        max: 10
      }),
      teamId: team.id
    };

    const response = await graphqlTestCall(
      CREATE_USER_MUTATION,
      {
        input: newTargetData
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.createTarget).not.toBeNull();
    expect(response.data.createTarget.item.name).toEqual(newTargetData.name);
    // Also check email is lower case (as per middleware)
    expect(response.data.createTarget.item.email).toEqual(
      newTargetData.email.toLowerCase()
    );

    const [dbTarget] = await sq.from`targets`.where({
      id: response.data.createTarget.item.id
    });
    expect(dbTarget).toBeDefined();
    expect(dbTarget.firstName).toEqual(newTargetData.firstName);
    // Also check email is lower case (as per middleware)
    expect(dbTarget.email).toEqual(newTargetData.email.toLowerCase());
    expect(dbTarget.userId).toBe(user.id);
    expect(dbTarget.teamId).toBe(team.id);
  });

  test("set activeTibs", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    await createTestOLPermission(user.id, team.id, "MEMBER");

    const newTargetData = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      address: faker.address.streetAddress(),
      city: faker.address.city(),
      state: faker.address.state(),
      zip5: faker.address.zipCode().substring(0, 5),
      phone: `+${faker.random.number({
        min: 10000000000,
        max: 19999999999
      })}`,
      twitterHandle: `@${faker.random.word()}`,
      facebookProfile: faker.random.word(),
      householdSize: faker.random.number({
        min: 1,
        max: 10
      }),
      teamId: team.id
    };

    const tib1 = await createTestTtib(user.id, team.id);
    const tib2 = await createTestTtib(user.id, team.id);
    const tib3 = await createTestTtib(user.id, team.id);

    newTargetData.activeTibs = [tib1.id, tib2.id];

    // no input
    const response = await graphqlTestCall(
      CREATE_USER_MUTATION,
      {
        input: newTargetData
      },
      { user: { id: user.id } }
    );
    debugResponse(response);

    const dbTibs = await sq.from`target_true_tibs`.return(`ttib_id`).where({
      targetId: response.data.createTarget.item.id
    });
    expect(dbTibs.length).toBe(2);
    const activeTibIds = _.map(dbTibs, "ttibId");
    expect(_.includes(activeTibIds, tib1.id)).toBe(true);
    expect(_.includes(activeTibIds, tib2.id)).toBe(true);
    expect(_.includes(activeTibIds, tib3.id)).toBe(false);
  });

  test("perm check. Must be team member", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();

    const newTargetData = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      teamId: team.id
    };

    // no input
    const response = await graphqlTestCall(
      CREATE_USER_MUTATION,
      {
        input: newTargetData
      },
      { user: { id: user.id } }
    );
    debugResponse(response);

    // should return correct data
    expect(response.data).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });
});
