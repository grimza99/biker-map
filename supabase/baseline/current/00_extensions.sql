-- Extensions observed as installed and relevant to the application schema.

create extension if not exists pgcrypto with schema extensions;
create extension if not exists "uuid-ossp" with schema extensions;
