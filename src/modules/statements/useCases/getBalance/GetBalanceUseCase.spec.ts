import { ICreateUserDTO } from '@modules/users/useCases/createUser/ICreateUserDTO';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository'
import { GetBalanceError } from './GetBalanceError';
import { GetBalanceUseCase } from './GetBalanceUseCase';


let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;


describe('Get balance use case', () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  });

  it('Should be able to get a user balance', async () => {
    const new_user: ICreateUserDTO = {
      email: 'user@test.com',
      password: '1234',
      name: 'User Test',
    };

    const user = await inMemoryUsersRepository.create(new_user);

    const result = await getBalanceUseCase.execute({ user_id: user.id });

    expect(result).toHaveProperty('balance');
    expect(result).toHaveProperty('statement');
  });

  it('Should not be able to get a user balance if a user does not exist', async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: 'user.id' });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
})
