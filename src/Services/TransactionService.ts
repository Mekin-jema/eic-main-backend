import Transaction from '../Models/Transaction';

export class TransactionService {
    static async create(data: any) {
        return await Transaction.create({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            currency: data.currency,
            amount: data.amount,
            charge: data.charge,
            mode: data.mode,
            type: data.type,
            status: data.status,
            reference: data.reference,
            created_at: data.created_at,
            updated_at: data.updated_at,
            tx_ref: data.tx_ref,
            payment_method: data.payment_method
        });
    }

    static async findById(id: string) {
        return await Transaction.findById(id);
    }

    static async findByReference(reference: string) {
        return await Transaction.findOne({ reference });
    }

    static async findByTxRef(tx_ref: string) {
        return await Transaction.findOne({ tx_ref });
    }

    static async findAll() {
        return await Transaction.find();
    }

    static async update(id: string, data: any) {
        return await Transaction.findByIdAndUpdate(id, data, { new: true });
    }

    static async delete(id: string) {
        return await Transaction.findByIdAndDelete(id);
    }
}
