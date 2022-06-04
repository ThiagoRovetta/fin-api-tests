import { ICreateUserDTO } from './ICreateUserDTO';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserError } from '../../useCases/createUser/CreateUserError';

import { CreateUserUseCase } from './CreateUserUseCase';

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Create User', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it('Should be able to create an user', async () => {
    const user: ICreateUserDTO = {
      email: 'user@test.com',
      password: '1234',
      name: 'User Test',
    };

    const result = await createUserUseCase.execute(user);

    expect(result).toHaveProperty('id');
  });

  it('Should not be able to create an existent user', async () => {
    const user: ICreateUserDTO = {
      email: 'test@test.com',
      password: '1234',
      name: 'User Test',
    };

    await createUserUseCase.execute(user);

    expect(async () => {
      await createUserUseCase.execute(user);
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
