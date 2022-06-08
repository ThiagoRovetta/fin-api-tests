import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Create Statement Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to create a new deposit statement', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'New user 6',
        email: 'new_user_6@finapi.com',
        password: 'newuser'
      });

    const authResponse = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'new_user_6@finapi.com',
        password: 'newuser'
      });

    const { token } = authResponse.body;

    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 20.00,
        description: 'Deposit of 2000.00'
      })
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it('Should be able to create a new withdraw statement', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'New user 7',
        email: 'new_user_7@finapi.com',
        password: 'newuser'
      });

    const authResponse = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'new_user_7@finapi.com',
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
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 10.00,
        description: 'Withdraw of 10.00'
      })
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it('Should not be able to create a new statement with non-existent user', async () => {
    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 1000.00,
        description: 'Withdraw of 1000.00'
      })
      .set({
        authorization: `Bearer sdfdsfdsfdsfdsfdsf`,
      });

    expect(response.status).toBe(401);
  });

  it('Should not be able to create a withdraw statement with insufficients funds', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'New user 8',
        email: 'new_user_8@finapi.com',
        password: 'newuser'
      });

    const authResponse = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'new_user_8@finapi.com',
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
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 100.00,
        description: 'Withdraw of 100.00'
      })
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });
});
