import _ from "lodash"

export const toCamelCase = (row: object) =>
  _.mapKeys(row, (__, key) => _.camelCase(key))
