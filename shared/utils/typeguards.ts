type NotExisting = undefined | null;

export function isNotExists<T>(item: T | NotExisting): item is NotExisting {
  return item === undefined || item === null;
}

export function isExists<T>(item: T | NotExisting): item is T {
  return item !== undefined && item !== null;
}

export function isNotEmpty<T>(item: T[] | NotExisting): item is T[] {
  return isExists(item) && item.length > 0;
}

export function isEmpty<T>(item: T[] | NotExisting): item is NotExisting {
  return !isExists(item) || item.length === 0;
}

export function isNotBlank(item: string | NotExisting): item is string {
  return isExists(item) && item.trim().length > 0;
}

export function isBlank(item: string | NotExisting): item is NotExisting {
  return !isExists(item) || item.trim().length === 0;
}

export function areSetsEqual<T>(aSet: Set<T>, bSet: Set<T>): boolean {
  if (aSet.size !== bSet.size) { return false; }

  for (const a of aSet) {
    if (!bSet.has(a)) { return false; }
  }

  return true;
}

export function areSetsNotEqual<T>(aSet: Set<T>, bSet: Set<T>): boolean {
  if (aSet.size !== bSet.size) { return true; }

  for (const a of aSet) {
    if (!bSet.has(a)) { return true; }
  }

  return false;
}