CREATE TABLE IF NOT EXISTS test_drive_bookings (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  booking_date DATE NOT NULL,
  time_slot VARCHAR(30) NOT NULL,
  showroom VARCHAR(160) NOT NULL,
  status ENUM('Requested', 'Confirmed', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Requested',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_test_drive_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
