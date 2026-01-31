import { NextFunction, Request, Response } from 'express';

type ControllerFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;
export default (controllerFunction: ControllerFunction) => (req: Request, res: Response, next: NextFunction) => Promise.resolve(controllerFunction(req, res, next)).catch(next);
