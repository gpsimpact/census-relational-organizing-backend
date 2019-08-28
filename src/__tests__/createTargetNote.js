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

const CREATE_TARGET_NOTE_MUTATION = `
  mutation createTargetNote($input: CreateTargetNoteInput!) {
     createTargetNote(input:$input) {
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
      }
    }
  }
`;

beforeEach(async () => {
  await dbUp();
});

describe("Create Target Note", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({ userId: user.id, teamId: team.id });

    const newTargetNoteData = {
      targetId: target.id,
      content: faker.lorem.paragraph()
    };

    const response = await graphqlTestCall(
      CREATE_TARGET_NOTE_MUTATION,
      {
        input: newTargetNoteData
      },
      { user: { id: user.id } }
    );
    debugResponse(response);

    expect(response.data.createTargetNote).not.toBeNull();
    expect(response.data.createTargetNote.item.content).toEqual(
      newTargetNoteData.content
    );
    expect(response.data.createTargetNote.item.target.id).toEqual(target.id);
    expect(response.data.createTargetNote.item.createdBy.id).toEqual(user.id);

    const [dbTargetNote] = await sq.from`target_notes`.where({
      id: response.data.createTargetNote.item.id
    });
    expect(dbTargetNote).toBeDefined();
    expect(dbTargetNote.content).toEqual(newTargetNoteData.content);
    // Also check email is lower case (as per middleware)
    expect(dbTargetNote.createdBy).toBe(user.id);
    expect(dbTargetNote.created_at).not.toBeNull();
    expect(dbTargetNote.updated_at).toEqual(dbTargetNote.created_at);
  });

  // target must exist
  test("Duplicate error", async () => {
    const user = await createTestUser();

    // no input
    const response = await graphqlTestCall(
      CREATE_TARGET_NOTE_MUTATION,
      {
        input: {
          targetId: faker.random.uuid(),
          content: faker.lorem.paragraph()
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
      CREATE_TARGET_NOTE_MUTATION,
      {
        input: {
          targetId: target.id,
          content: faker.lorem.paragraph()
        }
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  // admin can add note.
  test("cant add note to someone elses target", async () => {
    const user = await createTestUser();
    const adminUser = await createAdminUser();
    const team = await createTestTeam();
    const target = await createTestTarget({
      userId: user.id,
      teamId: team.id
    });

    // no input
    const response = await graphqlTestCall(
      CREATE_TARGET_NOTE_MUTATION,
      {
        input: {
          targetId: target.id,
          content: faker.lorem.paragraph()
        }
      },
      { user: { id: adminUser.id } }
    );
    debugResponse(response);
    expect(response.data.createTargetNote).not.toBeNull();
    expect(response.data.createTargetNote.success).toBe(true);
  });
});
