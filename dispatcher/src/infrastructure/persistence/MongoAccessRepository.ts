import type { AccessPrincipal, IAccessRepository } from '../../domain/interfaces';
import type { Model } from 'mongoose';
import type { AccessTokenDocument } from './accessToken.model';

export class MongoAccessRepository implements IAccessRepository {
  constructor(private readonly model: Model<AccessTokenDocument>) {}

  async validateToken(token: string): Promise<AccessPrincipal | null> {
    const doc = await this.model.findOne({ token }).lean().exec();
    if (!doc) {
      return null;
    }
    return { userId: doc.userId };
  }
}
