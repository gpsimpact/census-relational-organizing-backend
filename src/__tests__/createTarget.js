import faker from "faker";
import _ from "lodash";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createTestTtib,
  createTestTeamPermission
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
    await createTestTeamPermission(user.id, team.id, "MEMBER");

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
      isPhoneMobile: true,
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
    expect(dbTarget.isPhoneMobile).toBe(true);
    expect(dbTarget.householdMembers.length).toBe(1);
    expect(dbTarget.householdMembers[0].relationship).toBe("CHILD");
    expect(dbTarget.raceEthnicity.length).toBe(2);
  });

  test("set activeTibs", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    await createTestTeamPermission(user.id, team.id, "MEMBER");

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
    await createTestTeamPermission(user.id, team.id, "MEMBER");

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

    const mockSendMessage = jest.fn();
    const workerQueues = {
      censusGeocode: {
        add: mockSendMessage
      }
    };

    const response = await graphqlTestCall(
      CREATE_TARGET_MUTATION,
      {
        input: newTargetData
      },
      {
        user: { id: user.id },
        workerQueues
      }
    );
    debugResponse(response);
    expect(mockSendMessage).toHaveBeenCalled();
    const calledWithMessage = mockSendMessage.mock.calls[0][0];
    expect(calledWithMessage.address).toBe(newTargetData.address);
    expect(calledWithMessage.city).toBe(newTargetData.city);
    expect(calledWithMessage.state).toBe(newTargetData.state);
    expect(calledWithMessage.zip5).toBe(newTargetData.zip5);
    expect(calledWithMessage.targetId).toBe(response.data.createTarget.item.id);
    expect(mockSendMessage.mock.calls[0][1]).toEqual({
      removeOnComplete: true,
      attempts: 10,
      backoff: {
        type: "exponential",
        delay: 1000
      }
    });
  });

  test("Happy Path, no retain address", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    await createTestTeamPermission(user.id, team.id, "MEMBER");

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
