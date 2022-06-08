import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Create User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to create a new user', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'New user',
        email: 'new_user@finapi.com',
        password: 'newuser'
      });

    expect(response.status).toBe(201);
  });

  it('Should not be able to create a new user with existing email', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'New user 2',
        email: 'new_user_2@finapi.com',
        password: 'newuser'
      });

    const response = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'New user 2',
        email: 'new_user_2@finapi.com',
        password: 'newuser'
      });

    expect(response.status).toBe(400);
  });
});
