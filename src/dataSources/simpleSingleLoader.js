import {
  composeData,
  mapTo,
  beltalowda
} from "@jakelowen/sqorn-graphql-filters";

export default (query, keyName) => {
  const dataFetcherFn = async keys => {
    return query.where({ [keyName]: [...keys] });
  };
  const cacheKeyFn = x => x[keyName];
  const dataPrepFn = composeData(cacheKeyFn);
  const extractFn = x => {
    return x ? x[0] : x;
  };
  const mapToFirst = mapTo(dataPrepFn, extractFn);
  const loader = beltalowda(dataFetcherFn, mapToFirst);
  return loader;
};
