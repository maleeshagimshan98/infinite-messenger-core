/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import type { IDatabaseResult } from './IDatabaseResult';

class DatabaseResultSet<T> implements IDatabaseResult<T> {
  /**
   * Data object.
   *
   * @type {T | undefined}
   */
  private _data?: T;

  /**
   * Indicates if data is present.
   *
   * @type {boolean}
   */
  private _hasData: boolean = false;

  constructor(data?: T) {
    if (data) {
      this._data = data;
      this._hasData = true;
    } else {
      this._hasData = false;
    }
  }

  /**
   * Returns the _data object.
   *
   * @returns {T | undefined} The current data.
   */
  data(): T | undefined {
    return this._data;
  }

  /**
   * Returns the boolean value of _hasData.
   *
   * @returns {boolean} True if data is present, otherwise false.
   */
  hasData(): boolean {
    return this._hasData;
  }
}

export default DatabaseResultSet;
