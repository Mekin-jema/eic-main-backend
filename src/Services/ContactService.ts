import Contact from '../Models/Contact';

export class ContactService {
    static async create(data: any) {
        return await Contact.create({
            name: data.name,
            email: data.email,
            phoneNumber: data.phoneNumber,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            country: data.country,
            message: data.message,
            FixedlineNumber: data.FixedlineNumber
        });
    }

    static async findById(id: string) {
        return await Contact.findById(id);
    }

    static async findAll() {
        return await Contact.find();
    }

    static async update(id: string, data: any) {
        return await Contact.findByIdAndUpdate(id, data, { new: true });
    }

    static async delete(id: string) {
        return await Contact.findByIdAndDelete(id);
    }
}
