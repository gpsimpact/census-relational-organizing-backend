import { mapKeys, camelCase, snakeCase } from "lodash";

export const toCamelCase = obj => {
  if (!obj) return obj;
  return mapKeys(obj, (value, key) => {
    return camelCase(key);
  });
};

export const toSnakeCase = obj =>
  mapKeys(obj, (value, key) => {
    return snakeCase(key);
  });
