# Contributing to MarifetBul

Thanks for your interest in contributing.

## Ground Rules

- Be respectful in discussions and reviews.
- Keep pull requests focused and small when possible.
- Prefer tests and documentation updates with functional changes.

## Development Setup

1. Fork and clone the repository.
2. Install frontend dependencies from the repo root:
   - `npm install`
3. Configure environment files:
   - Root: copy `.env.example` to `.env.local`
   - Backend: copy `marifetbul-backend/.env.example` to `marifetbul-backend/.env`
4. Start required services (backend folder):
   - `docker compose up -d`
5. Run apps:
   - Frontend: `npm run dev`
   - Backend: `mvn -f marifetbul-backend/pom.xml spring-boot:run -Dspring-boot.run.profiles=dev`

## Pull Request Checklist

- [ ] Code builds locally.
- [ ] Relevant tests pass.
- [ ] New behavior is covered by tests where practical.
- [ ] Docs are updated for user-facing or API changes.
- [ ] No secrets are included in code, commits, or screenshots.

## Commit Style

Use clear, descriptive commit messages. Example:

- `feat(payment): add payout retry status endpoint`
- `fix(notification): prevent duplicate batch delivery`

## Reporting Bugs

Use the bug report template and include:

- expected behavior
- actual behavior
- steps to reproduce
- environment details

## Security

Please do not open public issues for security vulnerabilities.
Report them through the process in `SECURITY.md`.
