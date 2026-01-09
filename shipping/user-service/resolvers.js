const bcrypt = require('bcryptjs');
const pool = require('./db');
const { signToken } = require('./auth');

module.exports = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) return null;
      const res = await pool.query(
        'SELECT id,name,email,phone,address,role FROM users WHERE id=$1',
        [user.id]
      );
      return res.rows[0];
    },

    userById: async (_, { id }) => {
      const res = await pool.query(
        'SELECT id,name,email,phone,address,role FROM users WHERE id=$1',
        [id]
      );
      return res.rows[0];
    }
  },

  Mutation: {
    register: async (_, args) => {
      const hashed = await bcrypt.hash(args.password, 10);
      const res = await pool.query(
        `INSERT INTO users(name,email,password,phone,address)
         VALUES($1,$2,$3,$4,$5)
         RETURNING id,name,email,phone,address,role`,
        [args.name, args.email, hashed, args.phone, args.address]
      );
      return res.rows[0];
    },

    login: async (_, { email, password }) => {
      const res = await pool.query(
        'SELECT * FROM users WHERE email=$1',
        [email]
      );
      const user = res.rows[0];
      if (!user) throw new Error('User not found');

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error('Invalid password');

      const token = signToken(user);
      delete user.password;

      return { token, user };
    }
  }
};
