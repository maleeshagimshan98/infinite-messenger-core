/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

class DatabaseResult {
  /**
   * Data object.
   *
   * @type {Record<string, any>}
   */
  private _data: Record<string, any> = {};

  /**
   * Indicates if data is present.
   *
   * @type {boolean}
   */
  private _hasData: boolean = false;

  constructor(data: Record<string, any> | undefined) {
    this._data = data ?? {};
    this._hasData = data ? Object.keys(data).length > 0 : false;
  }

  /**
   * Returns the _data object.
   *
   * @returns {Record<string, any>} The current data.
   */
  data(): Record<string, any> {
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

export default DatabaseResult;
