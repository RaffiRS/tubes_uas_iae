const pool = require('./db');

module.exports = {
  Query: {
    products: async () => {
      const res = await pool.query('SELECT * FROM products');
      return res.rows;
    },
    productById: async (_, { id }) => {
      const res = await pool.query(
        'SELECT * FROM products WHERE id=$1',
        [id]
      );
      return res.rows[0];
    }
  },

  Mutation: {
    createProduct: async (_, args, { user }) => {
      if (!user || user.role !== 'admin')
        throw new Error('Unauthorized');

      const res = await pool.query(
        `INSERT INTO products(name,description,price,stock)
         VALUES($1,$2,$3,$4) RETURNING *`,
        [args.name, args.description, args.price, args.stock]
      );
      return res.rows[0];
    },

    updateProduct: async (_, args, { user }) => {
      if (!user || user.role !== 'admin')
        throw new Error('Unauthorized');

      const fields = [];
      const values = [];
      let idx = 1;

      for (const key in args) {
        if (key !== 'id') {
          fields.push(`${key}=$${idx++}`);
          values.push(args[key]);
        }
      }

      values.push(args.id);

      const res = await pool.query(
        `UPDATE products SET ${fields.join(',')}
         WHERE id=$${idx} RETURNING *`,
        values
      );

      return res.rows[0];
    },

    deleteProduct: async (_, { id }, { user }) => {
      if (!user || user.role !== 'admin')
        throw new Error('Unauthorized');

      await pool.query('DELETE FROM products WHERE id=$1', [id]);
      return true;
    }
  }
};
