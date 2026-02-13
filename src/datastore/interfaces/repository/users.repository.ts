/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import type { User } from '../../../Models/user';
import type DatabaseResult from '../../utils/DatabaseResult';
import type DatabaseResultSet from '../../utils/DatabaseResultSet';

interface UsersRepositroy {
  getUsers(start?: string): Promise<DatabaseResultSet<User[]>>;
  setUsers(users: User[]): Promise<void>;
  getUser(userId: string): Promise<DatabaseResult<User>>;
  setUser(user: User): Promise<void>;
  updateUser(user: User): Promise<void>;
  deleteUser(user: User): Promise<void>;
}

export { UsersRepositroy };
