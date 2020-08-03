/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-unsafe-return*/
export function Set_toJSON(_: string, value: any): any | any[] {
  if (typeof value === "object" && value instanceof Set) {
    return [...value];
  }
  return value;
}

export function JSONDate_toDate(_: string, value: any): Date | any {
  const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

  if (typeof value === "string" && dateFormat.test(value)) {
    return new Date(value);
  }

  return value;
}
