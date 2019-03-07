import { addOneHOR } from "@jakelowen/sqorn-graphql-filters";
import { toCamelCase } from "../../utils/changeObjectCase";

export default async (root, args, context) => {
  // modify args.input
  const modifiedInput = {
    insertionOrderId: args.input.id,
    clientId: args.input.clientId,
    createdBy: context.req.session.userId,
    attribution: args.input.attribution,
    campaignName: args.input.campaignName,
    campaignDescription: args.input.campaignDescription,
    programPhase: args.input.programPhase,
    commissionRate: args.input.commissionRate
  };
  args.input = modifiedInput;

  // create new row in revisions table with HOR
  const ioRev = await addOneHOR("dataSource.io.create", "input", "CREATE_IO")(
    root,
    args,
    context
  );

  // load from dataloader and convert to camelcase
  const io = toCamelCase(
    await context.dataSource.io.byIdLoader.load(ioRev.insertionOrderId)
  );

  return {
    success: true,
    code: "OK",
    message: "IO created.",
    item: io
  };
};
