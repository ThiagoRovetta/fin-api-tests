import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Get Balance Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to get a user balance', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'New user 9',
        email: 'new_user_9@finapi.com',
        password: 'newuser'
      });

    const authResponse = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'new_user_9@finapi.com',
        password: 'newuser'
      });

    const { token } = authResponse.body;

    await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 20.00,
        description: 'Deposit of 2000.00'
      })
      .set({
        authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get('/api/v1/statements/balance')
      .send()
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty('statement');
    expect(response.body).toHaveProperty('balance');
    expect(response.status).toBe(200);
  });

  it(`Should not be able to get a non-existent user's balance`, async () => {
    const response = await request(app)
      .get('/api/v1/statements/balance')
      .send()
      .set({
        authorization: `Bearer sdfffdsfdsfdsdfs`,
      });

    expect(response.status).toBe(401);
  });
});
