/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */
class DatabaseResult {
  /**
   *
   */
  _data = {}

  /**
   *
   */
  _hasData = false

  constructor(data) {
    this._data = data ?? {}
    this._hasData = Object.keys(data).length > 0
  }

  /**
   * Returns the _data object.
   *
   * @returns {Object} The current data.
   */
  data() {
    return this._data
  }

  /**
   * Returns the boolean value of _hasData.
   *
   * @returns {boolean} True if data is present, otherwise false.
   */
  hasData() {
    return this._hasData
  }
}

module.exports = DatabaseResult
