# Separate Next.js frontend, Node.js API, and MySQL

Dongmodel uses a separate Next.js frontend, a separate NestJS backend API, and MySQL as the primary database. The backend owns authentication, image upload coordination, Modong and Wanted Item domain behavior, public share links, Owner Gallery access, and admin-managed options. Database access goes through Prisma so domain code does not spread raw SQL throughout the application.
