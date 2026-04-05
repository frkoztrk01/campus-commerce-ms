import { UserModel, IUser } from './UserModel';

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email }).exec();
  }

  async createUser(email: string, passwordHash: string, role: string = 'user'): Promise<IUser> {
    const user = new UserModel({ email, passwordHash, role });
    return user.save();
  }
}
