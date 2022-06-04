import { ICreateUserDTO } from '../createUser/ICreateUserDTO';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';

import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';
import { ShowUserProfileError } from './ShowUserProfileError';

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe('Authenticate User', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);
  });

  it('Should be able to show user profile', async () => {
    const user: ICreateUserDTO = {
      email: 'user_profile@test.com',
      password: '1234',
      name: 'User Profile',
    };

    const new_user = await createUserUseCase.execute(user);

    const result = await showUserProfileUseCase.execute(new_user.id);

    expect(result).toHaveProperty('id');
  });

  it('Should not be able to show a non existent user profile', () => {
    expect(async () => {
      await showUserProfileUseCase.execute('rnfnfonfowfw');
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
