import AttendeeRegistration from '../Models/AttendeeRegistration';

export class AttendeeService {
    static async create(data: any) {
        return await AttendeeRegistration.create({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            organization: data.organization,
            jobTitle: data.jobTitle,
            country: data.country,
            category: data.category,
            otherCategory: data.otherCategory,
            sectorInterest: data.sectorInterest,
            hasExistingCompany: data.hasExistingCompany ?? false,
            companyName: data.companyName,
            companySector: data.companySector,
            businessLicenseUrl: data.businessLicenseUrl,
            attendance: data.attendance,
            needsVisa: data.needsVisa ?? false,
            siteVisit: data.siteVisit ?? false,
            passportCopyUrl: data.passportCopyUrl,
            specialRequirements: data.specialRequirements,
            communicationPreference: data.communicationPreference
        });
    }

    static async findByEmail(email: string) {
        return await AttendeeRegistration.findOne({ email });
    }

    static async findById(id: string) {
        return await AttendeeRegistration.findById(id);
    }

    static async findAll() {
        return await AttendeeRegistration.find();
    }

    static async update(id: string, data: any) {
        return await AttendeeRegistration.findByIdAndUpdate(id, data, { new: true });
    }

    static async delete(id: string) {
        return await AttendeeRegistration.findByIdAndDelete(id);
    }
}
