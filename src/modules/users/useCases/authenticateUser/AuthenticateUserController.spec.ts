import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Authenticate User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to authenticate a user', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'New user 3',
        email: 'new_user_3@finapi.com',
        password: 'newuser'
      });

    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'new_user_3@finapi.com',
        password: 'newuser'
      });

    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.status).toBe(200);
  });

  it('Should not be able to authenticate a non-existent user', async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'eregergee@finapi.com',
        password: 'newuser'
      });

    expect(response.status).toBe(401);
  });

  it('Should not be able to authenticate a user with wrong password', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'New user 4',
        email: 'new_user_4@finapi.com',
        password: 'newuser'
      });

    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'new_user_4@finapi.com',
        password: 'erferferfr'
      });

    expect(response.status).toBe(401);
  });
});
