DELETE FROM demo_users;
INSERT INTO demo_users (id, login, password_hash, token, token_created_at, data, created_at) VALUES
(
  'a8337333-73b8-46cd-8e81-6efb883a5e36',
  'conversion@test.com',
  '$2b$10$W7rTK0xU.oVXt4b.MbJySOeKRT17A85Vs4x4ePG1NjmXCCd23zsBK',
  null,
  null,
  '[{"type":"email","key":"email1","value":{"address":"conversion@test.com","isValidated":true}}]',
  '2020-10-30 15:52:48'
),
(
  'cc38b4a5-074e-420c-b560-32e4d7eabb77',
  'conversionWithToken@test.com',
  '$2b$10$msVVydRwgbmjeboH0g3xYeQvJbrqVXOSlMAeTb/bcyVPNJNJUZBJe',
  'cc38b4a5-074e-420c-b560-32e4d7eabb78',
  '2200-10-30 15:52:48',
  '[{"type":"email", "key":"email1", "value":{"address":"conversionWithToken@test.com","isValidated":true}}]',
  '2020-10-30 16:01:41'
);
