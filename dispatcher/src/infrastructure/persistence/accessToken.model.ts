import mongoose, { Schema, type Model } from 'mongoose';

export interface AccessTokenDocument extends mongoose.Document {
  token: string;
  userId: string;
}

const accessTokenSchema = new Schema<AccessTokenDocument>(
  {
    token: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true },
  },
  { collection: 'access_tokens' },
);

const modelName = 'AccessToken';

export const AccessTokenModel: Model<AccessTokenDocument> = mongoose.models[modelName]
  ? (mongoose.models[modelName] as Model<AccessTokenDocument>)
  : mongoose.model<AccessTokenDocument>(modelName, accessTokenSchema);
