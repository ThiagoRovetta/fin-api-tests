import { ICreateUserDTO } from '@modules/users/useCases/createUser/ICreateUserDTO';
import { ICreateStatementDTO } from '../createStatement/ICreateStatementDTO';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository'
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';
import { GetStatementOperationError } from './GetStatementOperationError';


let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Get statement operation use case', () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it('Should be able to get a statement operation', async () => {
    const userDTO: ICreateUserDTO = {
      email: 'user_statement@test.com',
      password: '1234',
      name: 'User Test Statement',
    };

    const user = await inMemoryUsersRepository.create(userDTO);

    const statementDTO: ICreateStatementDTO = {
      user_id: user.id,
      type: "deposit" as OperationType,
      amount: 20.05,
      description: 'Some description'
    };

    const statement = await inMemoryStatementsRepository.create(statementDTO);

    const result = await getStatementOperationUseCase.execute({
      user_id: user.id,
      statement_id: statement.id
    });

    expect(result.amount).toEqual(20.05);
    expect(result.description).toEqual('Some description');
    expect(result.type).toEqual("deposit");
  });

  it('Should not be able to get a statement operation if a user does not exists', async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: 'user.id',
        statement_id: 'statement.id'
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it('Should not be able to get a statement that does not exists', async () => {
    const userDTO: ICreateUserDTO = {
      email: 'user_statement2@test.com',
      password: '1234',
      name: 'User Test Statement 2',
    };

    const user = await inMemoryUsersRepository.create(userDTO);
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: user.id,
        statement_id: 'statement.id'
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
})
