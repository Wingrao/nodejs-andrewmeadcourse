const request = require('supertest');
const User = require('../src/models/user');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../src/app');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: 'Mike',
  email: 'mike@example.com',
  password: '56pass!!',
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
};

beforeEach(async () => {
  await User.deleteMany();
  await new User(userOne).save();
});

test('User Sign Up', async () => {
  const response = await request(app)
    .post('/users')
    .send({
      name: 'Andrew',
      email: 'Andrew@example.com',
      password: 'MyPass777',
    })
    .expect(201);

  const user = await User.findById(response.user._id);
  expect(user).not.toBeNull();
  expect(response.body).toMatchObject({
    user: { name: 'Andrew', email: 'Andrew@example.com', token: user.tokens[0].token },
  });
});

test('Logging Exisiting User', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);
  const user = await User.findById(response.user._id);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test('Login Failure', async () => {
  await request(app)
    .post('users/login')
    .send({
      email: userOne.email,
      password: 'WrongPassword',
    })
    .expect(400);
});

test('Should Get User Profile', async () => {
  await request(app).get('users/me').set('Authorization', `Bearer ${userOne.tokens[0].token}`).send().expect(200);
});

test('Should Not Get User Profile', async () => {
  await request(app).get('users/me').send().expect(404);
});

test('Should Delete Account', async () => {
  await request(app).delete('users/me').set('Authorization', `Bearer ${userOne.tokens[0].token}`).send().expect(200);
});

test('Should Not Delete Account', async () => {
  await request(app).delete('users/me').send().expect(200);
});

test('Should Have Avatar Pic', async () => {
  await request(app)
    .post('users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.png')
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should Update Valid User Fields', async () => {
  await request(app)
    .patch('users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ name: 'Jess' })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.name).toEqual('Jess');
});

est('Should Not Update Valid User Fields', async () => {
  await request(app)
    .patch('users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ location: 'Philly' })
    .expect(400);
});
