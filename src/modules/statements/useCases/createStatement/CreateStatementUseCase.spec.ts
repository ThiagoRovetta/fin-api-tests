import { ICreateUserDTO } from '@modules/users/useCases/createUser/ICreateUserDTO';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository'
import { CreateStatementError } from './CreateStatementError';
import { CreateStatementUseCase } from './CreateStatementUseCase';
import { ICreateStatementDTO } from './ICreateStatementDTO';


let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Create statement use case', () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it('Should be able to create a new statement', async () => {
    const new_user: ICreateUserDTO = {
      email: 'user@test.com',
      password: '1234',
      name: 'User Test',
    };

    const user = await inMemoryUsersRepository.create(new_user);

    const statement: ICreateStatementDTO = {
      user_id: user.id,
      type: "deposit" as OperationType,
      amount: 20.05,
      description: 'Some description'
    };

    const result = await createStatementUseCase.execute(statement);

    expect(result).toHaveProperty('id');
  });

  it('Should not be able to create a new statement with a non existent user', async () => {
    const withdrawStatement: ICreateStatementDTO = {
      user_id: 'user.id',
      type: "withdraw" as OperationType,
      amount: 300.00,
      description: 'Withdraw'
    };

    expect(async () => {
      await createStatementUseCase.execute(withdrawStatement);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it('Should not be able to create a new withdraw statement with insufficient funds', async () => {
    const new_user: ICreateUserDTO = {
      email: 'user@test.com',
      password: '1234',
      name: 'User Test',
    };

    const user = await inMemoryUsersRepository.create(new_user);

    const depositStatement: ICreateStatementDTO = {
      user_id: user.id,
      type: "deposit" as OperationType,
      amount: 200.00,
      description: 'Deposit'
    };

    await createStatementUseCase.execute(depositStatement);

    const withdrawStatement: ICreateStatementDTO = {
      user_id: user.id,
      type: "withdraw" as OperationType,
      amount: 300.00,
      description: 'Withdraw'
    };

    expect(async () => {
      await createStatementUseCase.execute(withdrawStatement);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
})
