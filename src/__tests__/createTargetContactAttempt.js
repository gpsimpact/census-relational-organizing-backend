import faker from "faker";
// import _ from "lodash";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createTestTarget,
  createAdminUser
} from "../utils/createTestEntities";
import { sq } from "../db";

require("dotenv").config();

const CREATE_TARGET_CONTACT_ATTEMPT_MUTATION = `
  mutation createTargetContactAttempt($input: CreateTargetContactAttemptInput!) {
     createTargetContactAttempt(input:$input) {
      code
      success
      message
      item {
        id
        createdAt
        updatedAt
        active
        target {
            id
        }
        createdBy {
            id
        }
        lastEditedBy {
            id
        }
        content
        disposition
        method
      }
    }
  }
`;

beforeEach(async () => {
  await dbUp();
});

describe("Create Target Contact Attempt", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({ userId: user.id, teamId: team.id });

    const newTargetContactAttemptData = {
      targetId: target.id,
      content: faker.lorem.paragraph(),
      disposition: "NOT_HOME",
      method: "PHONE"
    };

    const response = await graphqlTestCall(
      CREATE_TARGET_CONTACT_ATTEMPT_MUTATION,
      {
        input: newTargetContactAttemptData
      },
      { user: { id: user.id } }
    );
    debugResponse(response);

    expect(response.data.createTargetContactAttempt).not.toBeNull();
    expect(response.data.createTargetContactAttempt.item.content).toEqual(
      newTargetContactAttemptData.content
    );
    expect(response.data.createTargetContactAttempt.item.target.id).toEqual(
      target.id
    );
    expect(response.data.createTargetContactAttempt.item.createdBy.id).toEqual(
      user.id
    );

    const [
      dbTargetContactAttempt
    ] = await sq.from`target_contact_attempts`.where({
      id: response.data.createTargetContactAttempt.item.id
    });
    expect(dbTargetContactAttempt).toBeDefined();
    expect(dbTargetContactAttempt.content).toEqual(
      newTargetContactAttemptData.content
    );
    // Also check email is lower case (as per middleware)
    expect(dbTargetContactAttempt.createdBy).toBe(user.id);
    expect(dbTargetContactAttempt.created_at).not.toBeNull();
    expect(dbTargetContactAttempt.updated_at).toEqual(
      dbTargetContactAttempt.created_at
    );
  });

  // target must exist
  test("Duplicate error", async () => {
    const user = await createTestUser();

    // no input
    const response = await graphqlTestCall(
      CREATE_TARGET_CONTACT_ATTEMPT_MUTATION,
      {
        input: {
          targetId: faker.random.uuid(),
          content: faker.lorem.paragraph(),
          disposition: "NOT_HOME",
          method: "PHONE"
        }
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  // cant add note to someone elses target
  test("cant add note to someone elses target", async () => {
    const user = await createTestUser();
    const user2 = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({
      userId: user2.id,
      teamId: team.id
    });

    // no input
    const response = await graphqlTestCall(
      CREATE_TARGET_CONTACT_ATTEMPT_MUTATION,
      {
        input: {
          targetId: target.id,
          content: faker.lorem.paragraph(),
          disposition: "NOT_HOME",
          method: "PHONE"
        }
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  // admin can add note.
  test("cant add contact to someone elses target", async () => {
    const user = await createTestUser();
    const adminUser = await createAdminUser();
    const team = await createTestTeam();
    const target = await createTestTarget({
      userId: user.id,
      teamId: team.id
    });

    // no input
    const response = await graphqlTestCall(
      CREATE_TARGET_CONTACT_ATTEMPT_MUTATION,
      {
        input: {
          targetId: target.id,
          content: faker.lorem.paragraph(),
          disposition: "NOT_HOME",
          method: "PHONE"
        }
      },
      { user: { id: adminUser.id } }
    );
    debugResponse(response);
    expect(response.data.createTargetContactAttempt).not.toBeNull();
    expect(response.data.createTargetContactAttempt.success).toBe(true);
  });
});
