import faker from "faker";
import _ from "lodash";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createTestTtib,
  // createTestOLPermission,
  createTestTeamPermissionBit
} from "../utils/createTestEntities";
import { sq } from "../db";

require("dotenv").config();

const CREATE_TARGET_MUTATION = `
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
        isNameAlias
        householdMembers {
          relationship
          name
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

describe("Create Target", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    await createTestTeamPermissionBit(user.id, team.id, { MEMBER: true });

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
      teamId: team.id,
      isNameAlias: true,
      householdMembers: [
        { relationship: "CHILD", name: faker.name.firstName() }
      ],
      raceEthnicity: ["WHITE", "LATINO"]
    };

    const response = await graphqlTestCall(
      CREATE_TARGET_MUTATION,
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
    expect(
      response.data.createTarget.item.householdMembers.length
    ).not.toBeNull();
    expect(response.data.createTarget.item.householdMembers.length).toEqual(1);

    const [dbTarget] = await sq.from`targets`.where({
      id: response.data.createTarget.item.id
    });
    expect(dbTarget).toBeDefined();
    expect(dbTarget.firstName).toEqual(newTargetData.firstName);
    // Also check email is lower case (as per middleware)
    expect(dbTarget.email).toEqual(newTargetData.email.toLowerCase());
    expect(dbTarget.userId).toBe(user.id);
    expect(dbTarget.teamId).toBe(team.id);
    expect(dbTarget.isNameAlias).toBe(true);
    expect(dbTarget.householdMembers.length).toBe(1);
    expect(dbTarget.householdMembers[0].relationship).toBe("CHILD");
    expect(dbTarget.raceEthnicity.length).toBe(2);
  });

  test("set activeTibs", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    await createTestTeamPermissionBit(user.id, team.id, { MEMBER: true });

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
      CREATE_TARGET_MUTATION,
      {
        input: newTargetData
      },
      { user: { id: user.id } }
    );
    debugResponse(response);

    const dbTibs = await sq.from`target_true_tibs`.return(`tib_id`).where({
      targetId: response.data.createTarget.item.id
    });
    expect(dbTibs.length).toBe(2);
    const activeTibIds = _.map(dbTibs, "tibId");
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
      CREATE_TARGET_MUTATION,
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

  test("Calls pubsub for tract encoding", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    // await createTestOLPermission(user.id, team.id, "MEMBER");
    await createTestTeamPermissionBit(user.id, team.id, { MEMBER: true });

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

    const mockPublish = jest.fn();
    const mockGcPubSub = {
      topic: () => {
        return {
          publish: mockPublish
        };
      }
    };

    const response = await graphqlTestCall(
      CREATE_TARGET_MUTATION,
      {
        input: newTargetData
      },
      { user: { id: user.id }, gcPubsub: mockGcPubSub }
    );
    debugResponse(response);
    expect(mockPublish).toHaveBeenCalled();
    const calledWith = mockPublish.mock.calls[0][1];
    expect(calledWith.address).toBe(newTargetData.address);
    expect(calledWith.city).toBe(newTargetData.city);
    expect(calledWith.state).toBe(newTargetData.state);
    expect(calledWith.zip5).toBe(newTargetData.zip5);
    expect(calledWith.returnTopic).toBe(
      process.env.GCLOUD_PUBSUB_INBOUND_TOPIC
    );
    expect(calledWith.targetId).toBe(response.data.createTarget.item.id);
  });

  test("Happy Path, no retain address", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    // await createTestOLPermission(user.id, team.id, "MEMBER");
    await createTestTeamPermissionBit(user.id, team.id, { MEMBER: true });

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
      teamId: team.id,
      retainAddress: false
    };

    const response = await graphqlTestCall(
      CREATE_TARGET_MUTATION,
      {
        input: newTargetData
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.createTarget).not.toBeNull();
    expect(response.data.createTarget.item.address).toBeNull();
    expect(response.data.createTarget.item.city).toBeNull();
    expect(response.data.createTarget.item.state).toBeNull();
    expect(response.data.createTarget.item.zip5).toBe(newTargetData.zip5);

    const [dbTarget] = await sq.from`targets`.where({
      id: response.data.createTarget.item.id
    });
    expect(dbTarget).toBeDefined();
    expect(dbTarget.address).toBeNull();
    expect(dbTarget.city).toBeNull();
    expect(dbTarget.state).toBeNull();
    expect(dbTarget.zip5).toBe(newTargetData.zip5);
    expect(dbTarget.retainAddress).toBe(false);
  });
});
