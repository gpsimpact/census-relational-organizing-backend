import faker from "faker";
import _ from "lodash";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createTestTarget,
  createTestTtib
} from "../utils/createTestEntities";
import { sq } from "../db";

const UPDATE_TARGET_MUTATION = `
  mutation updateTarget($id: String!, $input: UpdateTargetInput!){
    updateTarget(id:$id, input: $input) {
      code
      message
      success
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

describe("Update Form", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({ userId: user.id, teamId: team.id });

    const newData = {
      firstName: "Billiam"
    };

    const response = await graphqlTestCall(
      UPDATE_TARGET_MUTATION,
      {
        id: target.id,
        input: newData
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.updateTarget).not.toBeNull();
    expect(response.data.updateTarget.code).toBe("OK");
    expect(response.data.updateTarget.success).toBe(true);
    expect(response.data.updateTarget.message).toBe("Target updated.");
    expect(response.data.updateTarget.item.firstName).toEqual(
      newData.firstName
    );
    expect(response.data.updateTarget.item.lastName).toEqual(target.lastName);

    const [dbTarget] = await sq.from`targets`.where({ id: target.id });
    expect(dbTarget).toBeDefined();
    expect(dbTarget.firstName).toEqual(newData.firstName);
    expect(dbTarget.lastName).toEqual(target.lastName);
  });

  // no id check
  test("Checks for existing id first", async () => {
    const user = await createTestUser();
    // const team = await createTestTeam();
    // const target = await createTestTarget({ userId: user.id, teamId: team.id });

    const newData = {
      firstName: "Billiam"
    };

    const response = await graphqlTestCall(
      UPDATE_TARGET_MUTATION,
      {
        id: "acb9c4ad-1c57-42d0-b20f-28b66932f362",
        input: newData
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    // The intent here was to check for "no such ID" but permcheck will get in way
    // because no target means user does not own target.
    expect(response.data).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  test("can only update own target", async () => {
    const user = await createTestUser();
    const user2 = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({
      userId: user2.id,
      teamId: team.id
    });

    const newData = {
      firstName: "Billiam"
    };

    const response = await graphqlTestCall(
      UPDATE_TARGET_MUTATION,
      {
        id: target.id,
        input: newData
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    // The intent here was to check for "no such ID" but permcheck will get in way
    // because no target means user does not own target.
    expect(response.data).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
    const response2 = await graphqlTestCall(
      UPDATE_TARGET_MUTATION,
      {
        id: target.id,
        input: newData
      },
      { user: { id: user2.id } }
    );
    debugResponse(response2);
    expect(response2.data.updateTarget.success).toBe(true);
  });

  // activeTibs
  test("Can edit active Tibs", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({ userId: user.id, teamId: team.id });
    const tib1 = await createTestTtib(user.id, team.id);
    const tib2 = await createTestTtib(user.id, team.id);
    const tib3 = await createTestTtib(user.id, team.id);

    await sq`target_true_tibs`.insert({ targetId: target.id, tibId: tib1.id });

    const trueTibCheck1 = await sq`target_true_tibs`.where({
      targetId: target.id
    });

    expect(trueTibCheck1.length).toBe(1);

    const newData = {
      activeTibs: [tib2.id, tib3.id]
    };

    const response = await graphqlTestCall(
      UPDATE_TARGET_MUTATION,
      {
        id: target.id,
        input: newData
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.updateTarget).not.toBeNull();
    expect(response.data.updateTarget.code).toBe("OK");
    expect(response.data.updateTarget.success).toBe(true);
    expect(response.data.updateTarget.message).toBe("Target updated.");

    const trueTibCheck2 = await sq`target_true_tibs`.where({
      targetId: target.id
    });

    const trueTibsAfter = _.map(trueTibCheck2, "tibId");

    expect(_.includes(trueTibsAfter, tib1.id)).toBe(false);
    expect(_.includes(trueTibsAfter, tib2.id)).toBe(true);
    expect(_.includes(trueTibsAfter, tib3.id)).toBe(true);
  });

  test("Calls pubsub for tract", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({ userId: user.id, teamId: team.id });

    const newData = {
      firstName: "Billiam",
      address: faker.address.streetAddress(),
      city: faker.address.city(),
      state: faker.address.state(),
      zip5: faker.address.zipCode().substring(0, 5)
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
      UPDATE_TARGET_MUTATION,
      {
        id: target.id,
        input: newData
      },
      { user: { id: user.id }, gcPubsub: mockGcPubSub }
    );
    debugResponse(response);
    expect(mockPublish).toHaveBeenCalled();
    const calledWith = mockPublish.mock.calls[0][1];
    expect(calledWith.address).toBe(newData.address);
    expect(calledWith.city).toBe(newData.city);
    expect(calledWith.state).toBe(newData.state);
    expect(calledWith.zip5).toBe(newData.zip5);
    expect(calledWith.returnTopic).toBe(
      process.env.GCLOUD_PUBSUB_INBOUND_TOPIC
    );
    expect(calledWith.targetId).toBe(response.data.updateTarget.item.id);
  });

  test("Happy Path, no retain address", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({ userId: user.id, teamId: team.id });

    const newData = {
      firstName: "Billiam",
      address: faker.address.streetAddress(),
      city: faker.address.city(),
      state: faker.address.state(),
      zip5: faker.address.zipCode().substring(0, 5),
      retainAddress: false
    };

    const response = await graphqlTestCall(
      UPDATE_TARGET_MUTATION,
      {
        id: target.id,
        input: newData
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.updateTarget).not.toBeNull();
    expect(response.data.updateTarget.code).toBe("OK");
    expect(response.data.updateTarget.success).toBe(true);
    expect(response.data.updateTarget.message).toBe("Target updated.");

    expect(response.data.updateTarget.item.address).toBeNull();
    expect(response.data.updateTarget.item.city).toBeNull();
    expect(response.data.updateTarget.item.state).toBeNull();
    expect(response.data.updateTarget.item.zip5).toBe(newData.zip5);

    const [dbTarget] = await sq.from`targets`.where({ id: target.id });
    expect(dbTarget).toBeDefined();
    expect(dbTarget.address).toBeNull();
    expect(dbTarget.city).toBeNull();
    expect(dbTarget.state).toBeNull();
    expect(dbTarget.zip5).toBe(newData.zip5);
    expect(dbTarget.retainAddress).toBe(false);
  });
});
