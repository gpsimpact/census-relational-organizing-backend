import _ from "lodash";
import { loaderGetHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context, info) => {
  const data = await loaderGetHOR("dataSource.form.byIdLoader", "id")(
    root,
    args,
    context,
    info
  );
  const appendedData = { ...data };
  appendedData.fields = _.map(appendedData.fields, x => {
    return Object.assign({}, x, { formId: data.id });
  });
  return appendedData;
};
