# psql -Upostgres -h localhost

create role api_user with login password '___';
alter role api_user createdb;
\q;

# psql -Uapi_user -h localhost
create database soce;

create table options_test ( 
  id SERIAL PRIMARY KEY,
  option_id VARCHAR(50) UNIQUE NOT NULL,
  buyer_id VARCHAR(128),
  seller_id VARCHAR(128),
  buyer_percent NUMERIC,
  seller_percent NUMERIC,
  buyer_volume NUMERIC,
  seller_volume NUMERIC,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

