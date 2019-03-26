import {
  composeData,
  mapTo,
  makeNestedKeyValues,
  generateCompositeKeyString,
  beltalowda
} from "@jakelowen/sqorn-graphql-filters";
import _ from "lodash";

export default (query, keyNamesArray) => {
  const dataFetcherFn = async keys => {
    return query.where(makeNestedKeyValues(keys));
  };
  const narrowToKeyFields = x => _.pick(x, keyNamesArray);
  const cacheKeyFn = generateCompositeKeyString(narrowToKeyFields);
  const dataPrepFn = composeData(cacheKeyFn, true);
  const mapToMany = mapTo(dataPrepFn, _.head);
  const loader = beltalowda(dataFetcherFn, mapToMany);
  return loader;
};
