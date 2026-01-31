import VipLevel from '../Models/VipLevel';

export class VipLevelService {
    static async create(data: any) {
        return await VipLevel.create({
            level: data.level,
            name: data.name,
            numOfSpaces: data.numOfSpaces,
            pricePerSpace: data.pricePerSpace,
            image: data.image,
            description: data.description
        });
    }

    static async findById(id: string) {
        return await VipLevel.findById(id);
    }

    static async findByLevel(level: number) {
        return await VipLevel.findOne({ level });
    }

    static async findAll() {
        return await VipLevel.find();
    }

    static async update(id: string, data: any) {
        return await VipLevel.findByIdAndUpdate(id, data, { new: true });
    }

    static async delete(id: string) {
        return await VipLevel.findByIdAndDelete(id);
    }
}
