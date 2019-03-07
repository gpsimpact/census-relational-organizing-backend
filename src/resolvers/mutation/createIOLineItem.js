import { addOneHOR } from "@jakelowen/sqorn-graphql-filters";
import { toCamelCase, toSnakeCase } from "../../utils/changeObjectCase";

export default async (root, args, context) => {
  // modify args.input
  args.input.createdBy = context.req.session.userId;
  args.input = toSnakeCase(args.input);

  // create new row in revisions table with HOR
  const ioLiRev = await addOneHOR(
    "dataSource.ioLineItem.create",
    "input",
    "CREATE_IO_LINE_ITEM"
  )(root, args, context);

  // load from dataloader and convert to camelcase
  const ioLi = toCamelCase(
    await context.dataSource.ioLineItem.byIdLoader.load(
      ioLiRev.insertionOrderLineItemId
    )
  );

  return {
    success: true,
    code: "OK",
    message: "IO Line Item created.",
    item: ioLi
  };
};
