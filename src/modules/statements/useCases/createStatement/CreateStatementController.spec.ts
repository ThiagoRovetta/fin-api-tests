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

  it('Should be able to create a new transfer statement', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'New user 12',
        email: 'new_user_12@finapi.com',
        password: 'newuser'
      });

    const authResponse = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'new_user_12@finapi.com',
        password: 'newuser'
      });

    const { token } = authResponse.body;

    const response = await request(app)
      .get('/api/v1/profile')
      .send()
      .set({
        authorization: `Bearer ${token}`,
      });

    const receiver_id = response.body.id;

    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'New user 13',
        email: 'new_user_13@finapi.com',
        password: 'newuser'
      });

    const authResponse2 = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'new_user_13@finapi.com',
        password: 'newuser'
      });

    const { token: token2 } = authResponse2.body;

    await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 200.00,
        description: 'Deposit of 200.00'
      })
      .set({
        authorization: `Bearer ${token2}`,
      });

    const response2 = await request(app)
      .post(`/api/v1/statements/transfer/${receiver_id}`)
      .send({
        amount: 20.00,
        description: 'Transfer of 20.00'
      })
      .set({
        authorization: `Bearer ${token2}`,
      });

    expect(response2.status).toBe(201);
  });

  it('Should not be able to create a transfer statement with insufficients funds', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'New user 14',
        email: 'new_user_14@finapi.com',
        password: 'newuser'
      });

    const authResponse = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'new_user_14@finapi.com',
        password: 'newuser'
      });

    const { token } = authResponse.body;

    const response = await request(app)
      .get('/api/v1/profile')
      .send()
      .set({
        authorization: `Bearer ${token}`,
      });

    const receiver_id = response.body.id;

    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'New user 15',
        email: 'new_user_15@finapi.com',
        password: 'newuser'
      });

    const authResponse2 = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'new_user_15@finapi.com',
        password: 'newuser'
      });

    const { token: token2 } = authResponse2.body;

    await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 200.00,
        description: 'Deposit of 200.00'
      })
      .set({
        authorization: `Bearer ${token2}`,
      });

    const response2 = await request(app)
      .post(`/api/v1/statements/transfer/${receiver_id}`)
      .send({
        amount: 300.00,
        description: 'Transfer of 300.00'
      })
      .set({
        authorization: `Bearer ${token2}`,
      });

    expect(response2.status).toBe(400);
  });
});
