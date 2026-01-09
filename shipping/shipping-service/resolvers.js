const pool = require('./db');
const getOrder = require('./orderClient');

module.exports = {
  Query: {
    shippingByOrder: async (_, { order_id }) => {
      const res = await pool.query(
        'SELECT * FROM shippings WHERE order_id=$1',
        [order_id]
      );
      return res.rows[0];
    },

    shippingLogs: async (_, { shipping_id }) => {
      const res = await pool.query(
        'SELECT * FROM shipping_logs WHERE shipping_id=$1 ORDER BY created_at',
        [shipping_id]
      );
      return res.rows;
    }
  },

  Mutation: {
    createShipping: async (_, args) => {
      const order = await getOrder(args.order_id);
      if (!order) throw new Error('Order not found');

      const res = await pool.query(
        `INSERT INTO shippings(order_id,courier,tracking_no,estimated_delivery)
         VALUES($1,$2,$3,$4) RETURNING *`,
        [args.order_id, args.courier, args.tracking_no, args.estimated_delivery]
      );

      return res.rows[0];
    },

    updateShippingStatus: async (_, { shipping_id, status, note }) => {
      const prev = await pool.query(
        'SELECT status FROM shippings WHERE id=$1',
        [shipping_id]
      );

      await pool.query(
        'UPDATE shippings SET status=$1 WHERE id=$2',
        [status, shipping_id]
      );

      await pool.query(
        `INSERT INTO shipping_logs(shipping_id,prev_status,new_status,note)
         VALUES($1,$2,$3,$4)`,
        [shipping_id, prev.rows[0].status, status, note]
      );

      const res = await pool.query(
        'SELECT * FROM shippings WHERE id=$1',
        [shipping_id]
      );

      return res.rows[0];
    },

    deleteShipping: async (_, { shipping_id }) => {
      await pool.query('DELETE FROM shipping_logs WHERE shipping_id=$1', [shipping_id]);
      await pool.query('DELETE FROM shippings WHERE id=$1', [shipping_id]);
      return true;
    }
  }
};
