CREATE TABLE IF NOT EXISTS shippings (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL,
  courier VARCHAR(100),
  tracking_no VARCHAR(100),
  status VARCHAR(50) DEFAULT 'PREPARING',
  estimated_delivery DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shipping_logs (
  id SERIAL PRIMARY KEY,
  shipping_id INT NOT NULL,
  prev_status VARCHAR(50),
  new_status VARCHAR(50),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
