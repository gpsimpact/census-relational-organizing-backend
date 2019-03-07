import { addOneHOR } from "@jakelowen/sqorn-graphql-filters";
import { omit } from "lodash";
// import { toCamelCase } from "../../utils/changeObjectCase";

export default async (root, args, context) => {
  // check if email already exists
  const existing = await context.dataSource.io.byIdLoader.load(args.id);

  if (!existing) {
    return {
      success: false,
      code: "DOES_NOT_EXIST",
      message: "No io with this id exists.",
      item: null
    };
  }

  // remove id from existing record because there is no id column in revisions table
  // covert to camelcase as well
  const camelExisting = omit(existing, "id");

  // overwrite values with new values
  args.input = Object.assign({}, camelExisting, args.input, {
    insertionOrderId: args.id,
    createdBy: context.req.session.userId
  });

  // Insert revision using HOR
  const ioRev = await addOneHOR("dataSource.io.create", "input", "CREATE_IO")(
    root,
    args,
    context
  );

  // clear dataloader after mutation
  await context.dataSource.io.byIdLoader.clear(ioRev.insertionOrderId);

  // reload from current table.
  const io = await context.dataSource.io.byIdLoader.load(
    ioRev.insertionOrderId
  );

  return {
    success: true,
    code: "OK",
    message: "IO updated.",
    item: io
  };
};
