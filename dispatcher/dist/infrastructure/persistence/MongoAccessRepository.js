"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoAccessRepository = void 0;
class MongoAccessRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async validateToken(token) {
        const doc = await this.model.findOne({ token }).lean().exec();
        if (!doc) {
            return null;
        }
        return { userId: doc.userId };
    }
}
exports.MongoAccessRepository = MongoAccessRepository;
