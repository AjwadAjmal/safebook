import { test } from 'node:test';
import assert from 'node:assert';
import { getPageTitleByPathname } from './navigation-utils';

test('getPageTitleByPathname should return "Dashboard" for the root path "/"', () => {
  assert.strictEqual(getPageTitleByPathname('/'), 'Dashboard');
});

test('getPageTitleByPathname should return "Kontenübersicht" for "/accounts"', () => {
  assert.strictEqual(getPageTitleByPathname('/accounts'), 'Kontenübersicht');
  assert.strictEqual(getPageTitleByPathname('/accounts/'), 'Kontenübersicht');
});

test('getPageTitleByPathname should return "Neue Transaktion" for "/transactions/new"', () => {
  assert.strictEqual(getPageTitleByPathname('/transactions/new'), 'Neue Transaktion');
  assert.strictEqual(getPageTitleByPathname('/transactions/new/'), 'Neue Transaktion');
});

test('getPageTitleByPathname should return fallback "Dashboard" for unknown routes, null, undefined, and empty string', () => {
  assert.strictEqual(getPageTitleByPathname('/unknown-route'), 'Dashboard');
  assert.strictEqual(getPageTitleByPathname(null), 'Dashboard');
  assert.strictEqual(getPageTitleByPathname(undefined), 'Dashboard');
  assert.strictEqual(getPageTitleByPathname(''), 'Dashboard');
});
