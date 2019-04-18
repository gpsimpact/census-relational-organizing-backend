import _ from "lodash";

export default fields => {
  return _.uniq(_.map(fields, "name")).length === fields.length;
};
