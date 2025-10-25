/**
 * Environment-agnostic timer type for setTimeout return value
 * Works correctly in both browser and Node.js environments
 */
export type Timer = ReturnType<typeof setTimeout>;
