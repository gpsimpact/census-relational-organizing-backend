import { dbUp } from "../utils/testDbOps";
import {
  createTestUser,
  createTestClient,
  createTestIO,
  createTestIOLineItem
} from "../utils/createTestEntities";
import { sq } from "../db";

beforeEach(async () => {
  await dbUp();
});

describe("Create User", () => {
  test("IO revision", async () => {
    const user = await createTestUser();
    const client = await createTestClient();
    // // create first revision to io
    const ioId = "im_an_io_id";

    const IO = await createTestIO("im_an_io_id", client.id, user.id);

    expect(IO.insertionOrderId).toEqual(ioId);

    let [ioCurrent] = await sq.from`insertion_orders_current`.where({
      id: ioId
    });
    expect(ioCurrent.campaignName).toEqual(IO.campaignName);

    await createTestIO(
      ioId,
      IO.clientId,
      IO.createdBy,
      IO.attribution,
      "zummy",
      IO.campaignDescription,
      IO.programPhase
    );

    let [ioCurrent2] = await sq.from`insertion_orders_current`.where({
      id: ioId
    });

    expect(ioCurrent2.campaignName).toEqual("zummy");
    expect(ioCurrent2.programPhase).toEqual(IO.programPhase);

    const allRevRows = await sq.from`insertion_orders_revisions`;
    expect(allRevRows.length).toEqual(2);
  });

  test("IO Line Items Audit Trail", async () => {
    const user = await createTestUser();
    const client = await createTestClient();
    const IO = await createTestIO(undefined, client.id, user.id);
    const ioLI = await createTestIOLineItem(
      undefined,
      IO.insertionOrderId,
      user.id
    );

    // make sure current table is populated
    let [
      ioLICurrent
    ] = await sq.from`insertion_orders_line_items_current`.where({
      id: ioLI.insertionOrderLineItemId
    });
    expect(ioLICurrent.platform).toEqual(ioLI.platform);
    expect(ioLICurrent.insertionOrderId).toEqual(ioLI.insertionOrderId);
    // make an update to line item
    const ioLI2 = await createTestIOLineItem(
      ioLI.insertionOrderLineItemId,
      IO.insertionOrderId,
      user.id
    );
    let [
      ioLICurrent2
    ] = await sq.from`insertion_orders_line_items_current`.where({
      id: ioLI.insertionOrderLineItemId
    });

    // ioLICurrent2 = toCamelCase(ioLICurrent2);
    expect(ioLICurrent2.platform).toEqual(ioLI2.platform);
    expect(ioLICurrent2.insertionOrderId).toEqual(ioLI2.insertionOrderId);
  });
});
