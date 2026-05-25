## Parent

gh#13

## What to build

Bereinigung der Nomenklatur im Middleware-Proxy und zugehörigen Tests. Die Logik und das Routing bleiben identisch, jedoch müssen Kommentare und Testbeschreibungen im Routing-Proxy (`src/proxy.ts` und `src/proxy.test.ts`) so angepasst werden, dass sie klar zwischen Profilerstellung (`/createprofile`) und Haushalts-Onboarding (`/onboarding/household`) unterscheiden, anstatt alles pauschal "onboarding" zu nennen.

## Acceptance criteria

- [ ] Kommentare in `src/proxy.ts` wurden an die neue Begriffstrennung angepasst.
- [ ] Testbeschreibungen in `src/proxy.test.ts` wurden angepasst.
- [ ] Alle Unit- und Integrationstests im Projekt laufen erfolgreich durch (`npm run test`).
- [ ] Das Projekt lintert ohne Fehler (`npm run lint`).
- [ ] Das Projekt lässt sich ohne Fehler builden (`npm run build`).

## Blocked by

- gh#15
- gh#16
