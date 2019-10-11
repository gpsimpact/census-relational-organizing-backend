import faker from "faker";
// import _ from "lodash";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createTestTarget,
  createTestTargetNote
  // createTestTtib
} from "../utils/createTestEntities";
import { sq } from "../db";

const UPDATE_TARGET_NOTE_MUTATION = `
  mutation updateTargetNote($id: String!, $input: UpdateTargetNoteInput!){
    updateTargetNote(id:$id, input: $input) {
      code
      message
      success
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

afterAll(async () => {
  await dbDown();
});

describe("Update target note", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({ userId: user.id, teamId: team.id });
    const targetNote = await createTestTargetNote(user.id, target.id);

    const newData = {
      content: faker.lorem.paragraph()
    };

    const response = await graphqlTestCall(
      UPDATE_TARGET_NOTE_MUTATION,
      {
        id: targetNote.id,
        input: newData
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.updateTargetNote).not.toBeNull();
    expect(response.data.updateTargetNote.code).toBe("OK");
    expect(response.data.updateTargetNote.success).toBe(true);
    expect(response.data.updateTargetNote.message).toBe("Note updated.");
    expect(response.data.updateTargetNote.item.content).toEqual(
      newData.content
    );

    const [dbTargetNote] = await sq.from`target_notes`.where({
      id: targetNote.id
    });
    expect(dbTargetNote).toBeDefined();
    expect(dbTargetNote.content).toEqual(newData.content);
  });

  // no id check
  test("Checks for existing id first", async () => {
    const user = await createTestUser();
    // const team = await createTestTeam();
    // const target = await createTestTarget({ userId: user.id, teamId: team.id });

    const newData = {
      content: "Billiam"
    };

    const response = await graphqlTestCall(
      UPDATE_TARGET_NOTE_MUTATION,
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

  test("can only update note of target user controls", async () => {
    const user = await createTestUser();
    const realOwnerUser = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({
      userId: realOwnerUser.id,
      teamId: team.id
    });
    const targetNote = await createTestTargetNote(realOwnerUser.id, target.id);

    const newData = {
      content: "Billiam"
    };

    const response = await graphqlTestCall(
      UPDATE_TARGET_NOTE_MUTATION,
      {
        id: targetNote.id,
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
      UPDATE_TARGET_NOTE_MUTATION,
      {
        id: targetNote.id,
        input: newData
      },
      { user: { id: realOwnerUser.id } }
    );
    debugResponse(response2);
    expect(response2.data.updateTargetNote.success).toBe(true);
  });
});
