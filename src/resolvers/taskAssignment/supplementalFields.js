import _ from "lodash";

export default async (root, args, context) => {
  const parentTd = await context.dataSource.taskDefinition.byIdLoader.load(
    root.taskDefinitionId
  );
  const supplementalFields = _.map(root.supplementalFields, sf => {
    return _.assign({}, sf, { formId: parentTd.formId });
  });

  return supplementalFields;
};
