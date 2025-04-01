/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

interface IDatabaseResult<T> {
  hasData(): boolean;
  data(): T | undefined;
}

export { IDatabaseResult };
