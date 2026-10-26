# CI Pipeline – GitHub Actions (AWDF Practical 12)

Workflow: `.github/workflows/ci.yml` (repo root). Runs on `push` and `pull_request` to `main`.

```
git push origin main -> lint job (npm install, npm run lint) -> build-and-test job (npm install, npm test) -> green check / red X
```

Tests: `backend/tests/tasks.test.js` (Jest + Supertest, 8 tests, MongoDB is mocked so no database is needed in CI).
`server.js` now exports `app` and only connects to MongoDB / opens the port when run directly (`node server.js`), so behaviour of the running app is unchanged.

## Run locally
```powershell
cd backend
npm install
npm test
npm run lint
```

## Demo steps (PowerShell, from repo root)
```powershell
# 1. Push workflow + tests (pipeline should pass)
git add .
git commit -m "ci: add GitHub Actions workflow, Jest tests and ESLint"
git push origin main

# 2. Deliberately break a test -> RED X
cd backend ; npm run demo:break ; npm test ; cd ..
git add . ; git commit -m "test: deliberately break test to demo failing CI" ; git push

# 3. Fix it -> GREEN check
cd backend ; npm run demo:fix ; cd ..
git add . ; git commit -m "test: fix test, CI passes" ; git push
```

## Screenshots to take (same order as the lab file)
Save in `backend/docs/screenshots/`.
1. Failed GitHub Actions pipeline – Actions tab, red run, open `build-and-test` > `npm test` log
2. Passed GitHub Actions pipeline – green run with both jobs
3. Local test success – `npm test` in the terminal
4. CI workflow – `.github/workflows/ci.yml` in VS Code
5. GitHub commit – repo page / commit list

## Key questions
1. **CI vs CD:** CI automatically installs, builds and tests on every push; CD automatically releases tested code to an environment. This practical demonstrates **CI**.
2. **Why earlier:** every push is tested immediately, so bugs are found while the change is small and fresh, not at release time.
3. **Wrong test path:** it fails at the same `npm test` step, but the log differs – a real failure shows expected vs received; a wrong path shows "No tests found".

## Supplementary problems
- ESLint job runs before the test job (`needs: lint`).
- Trigger: `push` to `main` kept (required by the main task) plus `pull_request` to `main`. For PR-only, delete the `push:` block.
- Status badge in the root `README.md`.
- Second test on a different endpoint (`GET /tasks/:id`).

## If your GitHub repo root is `backend/` (not this folder)
Move `.github/` into `backend/` and delete the `defaults: run: working-directory: backend` block from `ci.yml`.
