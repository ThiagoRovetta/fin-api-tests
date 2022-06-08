import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Show User Profile Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to show a user profile', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'New user 5',
        email: 'new_user_5@finapi.com',
        password: 'newuser'
      });

    const authResponse = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'new_user_5@finapi.com',
        password: 'newuser'
      });

    const { token } = authResponse.body;

    const response = await request(app)
      .get('/api/v1/profile')
      .send()
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');
    expect(response.body.name).toEqual('New user 5');
    expect(response.body.email).toEqual('new_user_5@finapi.com');
    expect(response.status).toBe(200);
  });

  it('Should not be able to show the profile of a non-existent user', async () => {
    const response = await request(app)
      .get('/api/v1/profile')
      .set({
        authorization: `Bearer sdfsdfsfss`,
      });

    expect(response.status).toBe(401);
  });
});
