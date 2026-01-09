const fetch = require('node-fetch');

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;

module.exports = async (productId) => {
  const query = `
    query ($id: ID!) {
      productById(id: $id) {
        id
        name
        price
      }
    }
  `;

  const res = await fetch(PRODUCT_SERVICE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { id: productId }
    })
  });

  const json = await res.json();
  return json.data.productById;
};
