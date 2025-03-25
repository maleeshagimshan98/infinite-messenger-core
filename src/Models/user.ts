/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import { Thread, Conversation } from './thread';

type NewUser = {
  id: string;
  name: string;
  profileImg: string;
  lastSeen: string;
  permissions: string[];
  conversationsId: string;
};

/**
 * This class represents a user in the messaging system
 */
class User {
  /**
   * user id
   *
   * @type {string}
   */
  private _id: string;

  /**
   * user name
   *
   * @type {string}
   */
  private _name: string;

  /**
   * Indicates whether user is active or not
   *
   * @type {boolean}
   */
  private _isActive: boolean;

  /**
   * User's last seen time
   *
   * @type {string}
   */
  private _lastSeen: string;

  /**
   * Link to user's profile image
   *
   * @type {string}
   */
  private _profileImg: string;

  /**
   * User's permissions
   *
   * @type {string[]}
   */
  private _permissions: string[];

  /**
   * User's unique id for his conversations
   *
   * @type {string}
   */
  private _conversationsId: string;

  /**
   * Last conversation id of the user
   *
   * @type {string | null}
   */
  private __lastConversationId: string | null;

  /**
   * User's conversations
   *
   * @type {Record<string, Thread>}
   */
  private __conversations: Record<string, Thread>;

  /**
   *
   */
  private __datastore: any;

  /**
   * constructor
   *
   * @param {object} user
   * @param {Datastore} datastore - datastore object
   */
  constructor({ id, name, profileImg, lastSeen, permissions, conversationsId }: NewUser, datastore: unknown) {
    this.__datastore = datastore;
    this._id = id;
    this._name = name;
    this._isActive = true;
    this._lastSeen = lastSeen ?? '';
    this._profileImg = profileImg ?? '';
    this._permissions = permissions ?? [];
    this._conversationsId = conversationsId ?? 'conv_' + this._id;
    /** conversation id of last received conversation */
    this.__lastConversationId = null;
    this.__conversations = {};

    /** async calls */
    this.setLastSeen(lastSeen ?? Date.now().toString());
  }

  /**
   * =============================
   * getters
   * =============================
   */

  getId(): string {
    return this._id;
  }

  getName(): string {
    return this._name;
  }

  getProfileImg(): string {
    return this._profileImg;
  }

  getIsActive(): boolean {
    return this._isActive;
  }

  getLastSeen(): string {
    return this._lastSeen;
  }

  getConversationsId(): string {
    return this._conversationsId;
  }

  getLastConversationId(): string | null {
    return this.__lastConversationId;
  }

  conversations(): Record<string, Thread> {
    return this.__conversations;
  }

  getPermissions(): string[] {
    return this._permissions;
  }

  /** ============================== */

  /**
   * convert this class to a plain object, in order to save in the database
   *
   * @returns {Record<string, unknown>} a plain object
   */
  toObj(): Record<string, unknown> {
    return {
      id: this._id,
      name: this._name,
      profileImg: this._profileImg,
      lastSeen: this._lastSeen,
      isActive: this._isActive,
      permissions: this._permissions,
      conversationsId: this._conversationsId,
      lastConversationId: this.__lastConversationId,
    };
  }

  /**
   * ============================
   * setters
   * ============================
   */

  /**
   * set profile image of user
   *
   * @param {string} url - url of user's profile image
   * @returns {void} void
   */
  setProfileImg(url: string): void {
    //... TODO - update the database too
    this._profileImg = url; //... TODO - sanitize the input
  }

  /**
   * set active status of user
   * also makes changes in remote database
   *
   * @param {boolean} status - active status of user's
   * @returns {Promise<void>} void
   */
  async setIsActive(status: boolean): Promise<void> {
    //... TODO - check - update the database too
    if (typeof status !== 'boolean') {
      throw new Error(`Error:User - cannot set the isActive status. It must be a boolean but received ${status}`);
    }
    this._isActive = status;
  }

  /**
   * set last seen time of user
   *
   * @param {string} time - last seen time
   * @returns {Promise<void>} void
   */
  async setLastSeen(time: string): Promise<void> {
    this._lastSeen = time;
    // =========================
    //... update datastore too
    // ========================
  }

  /**
   * set user's permissions
   *
   * @param {string} permission - permission
   * @returns {void} void
   */
  setPermissions(permission: string): void {
    this._permissions.push(permission);
  }

  /**
   * update the user's data in datastore
   *
   * @returns {Promise<void>} Promise
   */
  async updateUser(): Promise<void> {
    await this.__datastore.user.updateUser(this).catch((error: Error) => {
      //... handle error
      console.log(error);
    }); //... check
  }
}

export { User, NewUser };
