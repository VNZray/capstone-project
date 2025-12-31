/**
 * Authentication Route Tests
 */

import request from 'supertest';
import app from '../../../../src/app.js';
import db from '../../../../src/models/index.js';

describe('Auth Routes', () => {
  const testUser = {
    email: 'test@example.com',
    phone_number: '+639123456789',
    password: 'TestPass123!',
    first_name: 'Test',
    last_name: 'User'
  };

  beforeAll(async () => {
    // Clean up any existing test user
    await db.User.destroy({ where: { email: testUser.email }, force: true });
  });

  afterAll(async () => {
    // Clean up test data
    await db.User.destroy({ where: { email: testUser.email }, force: true });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new tourist user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...testUser,
          user_type: 'tourist'
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('email', testUser.email);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...testUser,
          phone_number: '+639987654321',
          user_type: 'tourist'
        })
        .expect('Content-Type', /json/)
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('email');
    });

    it('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'weak@example.com',
          phone_number: '+639111111111',
          password: '123',
          first_name: 'Weak',
          last_name: 'Password',
          user_type: 'tourist'
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeAll(async () => {
      // Verify the test user for login tests
      await db.User.update(
        { is_verified: true, is_active: true },
        { where: { email: testUser.email } }
      );
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('user');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!'
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!'
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
