# HTTP-only session cookies for web auth

Dongmodel uses HTTP-only session cookies for authenticated web requests between the Next.js frontend and NestJS backend. The product is browser-first, and cookie sessions avoid storing bearer tokens in browser-accessible storage. Public share links remain accessible without authentication, while Owner-only actions require a valid session.
