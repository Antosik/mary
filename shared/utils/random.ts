export function randomId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function Set_toJSON(key: string, value: any): any {
  if (typeof value === "object" && value instanceof Set) {
    return [...value];
  }
  return value;
}


export function JSONDate_toDate(key: string, value: any): any {
  const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

  if (typeof value === "string" && dateFormat.test(value)) {
    return new Date(value);
  }

  return value;
}
