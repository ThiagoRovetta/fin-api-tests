import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Get Statement Operation Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it(`Should be able to get a user's statement operation`, async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'New user 10',
        email: 'new_user_10@finapi.com',
        password: 'newuser'
      });

    const authResponse = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'new_user_10@finapi.com',
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

    const balanceResponse = await request(app)
      .get('/api/v1/statements/balance')
      .send()
      .set({
        authorization: `Bearer ${token}`,
      });

    const { statement } = balanceResponse.body;

    const response = await request(app)
      .get(`/api/v1/statements/${statement[0].id}`)
      .send()
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('user_id');
    expect(response.body).toHaveProperty('description');
    expect(response.body).toHaveProperty('amount');
    expect(response.body).toHaveProperty('type');
    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');
    expect(response.body.description).toEqual('Deposit of 2000.00');
    expect(response.body.amount).toEqual('20.00');
    expect(response.body.type).toEqual('deposit');
    expect(response.status).toBe(200);
  });

  it(`Should not be able to get a non-existent user's statement operation`, async () => {
    const response = await request(app)
      .get('/api/v1/statements/2435bh45f')
      .send()
      .set({
        authorization: `Bearer sdfffdsfdsfdsdfs`,
      });

    expect(response.status).toBe(401);
  });

  it(`Should not be able to get a non-existent statement operation`, async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'New user 11',
        email: 'new_user_11@finapi.com',
        password: 'newuser'
      });

    const authResponse = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'new_user_11@finapi.com',
        password: 'newuser'
      });

    const { token } = authResponse.body;

    const response = await request(app)
      .get('/api/v1/statements/bd6de9eb-cbda-4f05-873c-e1f4843fecfd')
      .send()
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });
});
