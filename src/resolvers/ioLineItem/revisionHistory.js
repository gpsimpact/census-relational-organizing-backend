import { map } from "lodash";

export default async (root, args, context) => {
  const data = await context.dataSource.ioLineItem.revisionsByIOLineItemIdLoader.load(
    root.id
  );
  return map(data, x => {
    x.id = x.insertionOrderLineItemId;
    return x;
  });
};
