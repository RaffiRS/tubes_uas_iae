const pool = require('./db');
const getProduct = require('./productClient');

module.exports = {
  Query: {
    myOrders: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');

      const orders = await pool.query(
        'SELECT * FROM orders WHERE user_id=$1',
        [user.id]
      );

      for (let o of orders.rows) {
        const items = await pool.query(
          'SELECT product_id,product_name,price,qty,subtotal FROM order_items WHERE order_id=$1',
          [o.id]
        );
        o.items = items.rows;
      }

      return orders.rows;
    },

    orderById: async (_, { id }) => {
      const order = await pool.query(
        'SELECT * FROM orders WHERE id=$1',
        [id]
      );
      if (!order.rows[0]) return null;

      const items = await pool.query(
        'SELECT product_id,product_name,price,qty,subtotal FROM order_items WHERE order_id=$1',
        [id]
      );

      order.rows[0].items = items.rows;
      return order.rows[0];
    }
  },

  Mutation: {
    createOrder: async (_, { productId, qty }, { user }) => {
      if (!user) throw new Error('Unauthorized');

      const product = await getProduct(productId);
      if (!product) throw new Error('Product not found');

      const subtotal = product.price * qty;

      const orderRes = await pool.query(
        `INSERT INTO orders(user_id,user_name,user_email,total)
         VALUES($1,$2,$3,$4) RETURNING *`,
        [user.id, user.id, user.role, subtotal]
      );

      await pool.query(
        `INSERT INTO order_items(order_id,product_id,product_name,price,qty,subtotal)
         VALUES($1,$2,$3,$4,$5,$6)`,
        [orderRes.rows[0].id, product.id, product.name, product.price, qty, subtotal]
      );

      orderRes.rows[0].items = [{
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        qty,
        subtotal
      }];

      return orderRes.rows[0];
    },

    updateOrderStatus: async (_, { id, status }) => {
      const res = await pool.query(
        'UPDATE orders SET status=$1 WHERE id=$2 RETURNING *',
        [status, id]
      );
      return res.rows[0];
    },

    deleteOrder: async (_, { id }) => {
      await pool.query('DELETE FROM order_items WHERE order_id=$1', [id]);
      await pool.query('DELETE FROM orders WHERE id=$1', [id]);
      return true;
    }
  }
};
