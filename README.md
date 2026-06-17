# TripPlanner IA

Planejador de viagens com inteligência artificial. Gera roteiros personalizados, mapas interativos, estimativas de orçamento e dicas de transporte local.

## Stack

- [TanStack Start](https://tanstack.com/start) + React 19
- [Turso](https://turso.tech/) (SQLite) + [Drizzle ORM](https://orm.drizzle.team/)
- [better-auth](https://www.better-auth.com/) (email/senha)
- Google Gemini (`gemini-3.5-flash`)
- i18n: Português (pt-BR) e English (en)
- Vitest + Testing Library

## Pré-requisitos

- Node.js 20+
- Chave da API Gemini

## Configuração

```bash
npm install
cp .env.example .env
```

Preencha o `.env`:

| Variável | Descrição |
|----------|-----------|
| `GEMINI_API_KEY` | Chave da API Google Gemini |
| `TURSO_DATABASE_URL` | `file:./data/trip-planner.sqlite` para dev local |
| `BETTER_AUTH_SECRET` | String aleatória longa (ex.: `openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | URL base em dev: `http://localhost:3000` |

```bash
npm run db:push
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000), crie uma conta e gere seu primeiro roteiro.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm test` | Testes (Vitest) |
| `npm run lint` | Typecheck (`tsc --noEmit`) |
| `npm run format` | Formata com Prettier |
| `npm run format:check` | Verifica formatação |
| `npm run ci` | format + lint + test + build |
| `npm run db:push` | Aplica schema no banco |

## Qualidade

- **CI:** GitHub Actions em `.github/workflows/ci.yml` (format, lint, test, build)
- **Pre-commit:** Husky roda `lint-staged` (Prettier), `lint` e `test`

Após `npm install`, o hook é ativado via `prepare` → `husky`.

## Licença

MIT