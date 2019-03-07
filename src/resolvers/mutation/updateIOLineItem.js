import { addOneHOR } from "@jakelowen/sqorn-graphql-filters";

import { omit } from "lodash";

export default async (root, args, context) => {
  // check if email already exists
  const existing = await context.dataSource.ioLineItem.byIdLoader.load(args.id);
  if (!existing) {
    return {
      success: false,
      code: "DOES_NOT_EXIST",
      message: "No ioLineItem with this id exists.",
      item: null
    };
  }

  // remove id from existing record because there is no id column in revisions table
  // covert to camelcase as well
  const camelExisting = omit(existing, "id");
  // overwrite values with new values
  args.input = Object.assign({}, camelExisting, args.input, {
    insertionOrderLineItemId: args.id,
    createdBy: context.req.session.userId
  });

  // Insert revision using HOR
  const ioLiRev = await addOneHOR(
    "dataSource.ioLineItem.create",
    "input",
    "UPDATE_IO_LINE_ITEM"
  )(root, args, context);

  // clear dataloader after mutation
  await context.dataSource.ioLineItem.byIdLoader.clear(
    ioLiRev.insertionOrderLineItemId
  );

  // reload from current table.
  const ioLi = await context.dataSource.ioLineItem.byIdLoader.load(
    ioLiRev.insertionOrderLineItemId
  );

  return {
    success: true,
    code: "OK",
    message: "IO updated.",
    item: ioLi
  };
};
