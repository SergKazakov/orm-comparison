import _ from "lodash"

export const toCamelCase = (row: any) =>
  _.mapKeys(row, (__, key) => _.camelCase(key))
