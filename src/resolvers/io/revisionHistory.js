import { map } from "lodash";

export default async (root, args, context) => {
  const data = await context.dataSource.io.revisionsByIOIdLoader.load(root.id);
  return map(data, x => {
    x.id = x.insertionOrderId;
    return x;
  });
};
