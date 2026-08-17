export const zodFieldErrors = <T extends string>(error: {
  issues: { path: PropertyKey[]; message: string }[];
}): Partial<Record<T, string>> => {
  const fieldErrors: Partial<Record<T, string>> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && fieldErrors[key as T] === undefined) {
      fieldErrors[key as T] = issue.message;
    }
  }

  return fieldErrors;
};
