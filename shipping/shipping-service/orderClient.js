const fetch = require('node-fetch');
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;

module.exports = async (orderId) => {
  const query = `
    query ($id: ID!) {
      orderById(id: $id) {
        id
        status
        total
      }
    }
  `;

  const res = await fetch(ORDER_SERVICE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { id: orderId } })
  });

  const json = await res.json();
  return json.data.orderById;
};
