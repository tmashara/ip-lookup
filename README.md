# ip-lookup

[![CI](https://github.com/tmashara/ip-lookup/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR-USERNAME/ip-lookup/actions/workflows/ci.yml)
[![Deploy](https://github.com/tmashara/ip-lookup/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR-USERNAME/ip-lookup/actions/workflows/deploy.yml)

A Vue 3 application for looking up IP addresses and displaying their geolocation information with live timezone.

## 🌐 Live Demo

**[https://tmashara.github.io/ip-lookup/](https://tmashara.github.io/ip-lookup/)**

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## potential improvements

- request retry logic in case of error
- race condition between 2 inputs with the same ip address - I did not handle that because it creates bug when we add two inputs, then delete one of them and got abortion for both
- virtualization in case we need to handle long lists of ip inputs
- async pool (concurrent requests limit) - in case we have bulk upload/edit in future
- e2e
- .env variables - for at least API_URL
- error messages for network failures
- API response validation (zod or similar) - for external API, like in our case
