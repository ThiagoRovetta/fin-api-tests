import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateStatementUseCase } from './CreateStatementUseCase';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const { id } = request.user;
    const { user_id } = request.params
    const { amount, description } = request.body;

    const splittedPath = request.originalUrl.split('/')

    let type: OperationType;
    let receiver_id: string;

    if (!user_id) {
      type = splittedPath[splittedPath.length - 1] as OperationType;
    } else {
      type = splittedPath[splittedPath.length - 2] as OperationType;
      receiver_id = String(user_id)
    }

    const createStatement = container.resolve(CreateStatementUseCase);

    const statement = await createStatement.execute({
      user_id: id,
      type,
      amount,
      description,
      receiver_id,
    });

    return response.status(201).json(statement);
  }
}
