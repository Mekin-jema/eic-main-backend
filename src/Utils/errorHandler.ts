export class errorHandler extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, errorHandler);
    }

    static createError(message: string, statusCode: number) {
        return new errorHandler(message, statusCode);
    }
}
