# ip-lookup

[![CI](https://github.com/tmashara/ip-lookup/actions/workflows/ci.yml/badge.svg)](https://github.com/tmashara/ip-lookup/actions/workflows/ci.yml)
[![Deploy](https://github.com/tmashara/ip-lookup/actions/workflows/deploy.yml/badge.svg)](https://github.com/tmashara/ip-lookup/actions/workflows/deploy.yml)

A Vue 3 application for looking up IP addresses and displaying their geolocation information with live timezone.

## 🌐 Live Demo

**[https://tmashara.github.io/ip-lookup/](https://tmashara.github.io/ip-lookup/)**

## Solution Overview

### Features

- **Multi-IP Lookup**: Add/remove multiple IP address rows dynamically
- **Real-time Validation**: IPv4 and IPv6 address validation on blur
- **Geolocation Data**: Country, flag emoji, and timezone information
- **Live Timezone Clock**: Synchronized time display that updates every second

### Additional Features

- **Smart Caching**: LRU cache with TTL to minimize API calls
- **Accessibility**: WCAG compliant with ARIA labels, keyboard navigation, and focus management
- **Auto-focus**: New inputs automatically focused for seamless user experience

### Architecture

```
src/
├── components/
│   └── IpLookupInput.vue          # IP input row with lookup logic
├── composables/
│   ├── useFetch.ts                # Reusable fetch with LRU cache
│   └── useSynchronizedTime.ts     # Global timer for all timezone clocks
├── utils/
│   ├── isValidIP.ts               # IPv4/IPv6 validation
│   └── formatTime.ts              # Timezone formatting
├── types/
│   └── index.ts                   # TypeScript interfaces
└── App.vue                        # Main component (manages rows)
```

### Tech Stack

- **Framework**: Vue 3 (Composition API)
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite
- **Testing**: Vitest + Vue Test Utils (102 tests)
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions (lint → test → build → deploy)
- **Hosting**: GitHub Pages

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

## API

This application uses the [https://ipwhois.io/](https://ipwhois.io/) API for IP geolocation data.

## Potential Improvements

- Use **@vueuse/core** or **@tanstack/query** instead of custom useFetch
  - Current implementation is for demonstration/avoiding dependencies
- Race condition handling for duplicate IP addresses
- Add `.env` variables (at least for `API_URL`)
- Request retry logic for error handling
- Virtualization for long IP lists
- Async request pool (concurrent request limiting)
- E2E tests with Playwright/Cypress
- Better error messages for network failures
- API response validation with Zod or similar

## License

MIT License - see [LICENSE](LICENSE) file for details
