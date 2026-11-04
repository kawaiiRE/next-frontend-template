// Disposable CI fixture only. No production URLs, data, credentials or SMTP traffic.
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, open, rm, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { once } from 'node:events';
import os from 'node:os';
import path from 'node:path';
import PocketBase from 'pocketbase';

assert.equal(process.env.GITHUB_ACTIONS, 'true', 'Disposable GitHub Actions runner required');
assert.equal(process.platform, 'linux', 'This fixture lifecycle is Linux-only');
const root = process.cwd();
const head = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' });
assert.equal(head.status, 0);
assert.equal(head.stdout.trim(), process.env.PR_HEAD_SHA);
const executable = path.resolve(process.env.MAIL_TEST_PB ?? 'backend/bin/pocketbase');
const frontend = process.env.MAIL_TEST_FRONTEND === 'root' ? root : path.join(root, 'frontend');
const collectionName = process.env.MAIL_TEST_FRONTEND === 'root' ? 'users' : 'owners';
const folder = await mkdtemp(path.join(os.tmpdir(), 'mail-confirmation-'));
const backendUrl = 'http://127.0.0.1:18090';
const origin = 'http://127.0.0.1:18091';
const children = [];
const log = await open(path.join(folder, 'fixture.log'), 'w', 0o600);
let stage = 'initialize';
let browser;
let browserPage;
let browserActionStatus;
function start(binary, args, cwd, extra = {}) {
  const child = spawn(binary, args, {
    cwd,
    detached: true,
    stdio: ['ignore', log.fd, log.fd],
    env: { ...process.env, ...extra },
  });
  children.push(child);
  return child;
}
async function ready(url, child) {
  for (let attempt = 0; attempt < 120; attempt++) {
    if (child.exitCode !== null) throw new Error('fixture exited');
    try {
      if ((await fetch(url, { signal: AbortSignal.timeout(1000) })).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('fixture readiness timeout');
}
async function action(body) {
  return fetch(origin + '/api/v1/mail-actions', {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    redirect: 'error',
  });
}
async function captured(expected) {
  for (let attempt = 0; attempt < 120; attempt++) {
    const response = await fetch(backendUrl + '/api/mail-fixture/captured', { redirect: 'error' });
    assert.equal(response.status, 200);
    const message = await response.json();
    for (const match of String(message.html ?? '').matchAll(/href=["']([^"']+)["']/g)) {
      const url = new URL(match[1].replaceAll('&amp;', '&'));
      if (url.pathname !== '/mail-actions') continue;
      assert.equal(url.origin, origin);
      const values = new URLSearchParams(url.hash.slice(1));
      if (values.get('action') !== expected) continue;
      assert.equal(values.get('collection'), collectionName);
      assert(values.get('token'));
      return { url: url.href, action: values.get('action'), token: values.get('token') };
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('fixture mail capture timed out');
}
try {
  const hooks = path.join(folder, 'hooks');
  await mkdir(hooks);
  const migrations = path.join(folder, 'migrations');
  await mkdir(migrations);
  for (const [source, destination] of [
    ['pb_hooks', hooks],
    ['pb_migrations', migrations],
    ['seed', path.join(folder, 'seed')],
  ]) {
    try {
      await cp(path.join(root, 'backend', source), destination, { recursive: true });
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  await writeFile(
    path.join(hooks, 'zz_mail_confirmation_fixture.pb.js'),
    `
onMailerSend((e) => {
  if ((e.message.html || '').indexOf('/mail-actions#action=') >= 0)
    e.app.store().set('mail-fixture', JSON.stringify({ html: e.message.html }));
  // Deliberately stop here: this fixture never delivers email outside the runner.
});
routerAdd('GET', '/api/mail-fixture/captured', (e) => {
  return e.json(200, JSON.parse(e.app.store().get('mail-fixture') || '{}'));
});
`,
    { mode: 0o600, flag: 'wx' },
  );
  const data = path.join(folder, 'data');
  const adminEmail = 'fixture-admin@mail-actions.invalid';
  const adminPassword = randomBytes(24).toString('base64url');
  const bootstrap = spawnSync(
    executable,
    ['superuser', 'upsert', adminEmail, adminPassword, '--dir=' + data],
    { cwd: folder, stdio: ['ignore', log.fd, log.fd] },
  );
  assert.equal(bootstrap.status, 0);
  stage = 'backend readiness';
  const backend = start(
    executable,
    [
      'serve',
      '--http=127.0.0.1:18090',
      '--dir=' + data,
      '--hooksDir=' + hooks,
      '--migrationsDir=' + migrations,
      '--automigrate=false',
    ],
    folder,
    {
      APP_MODE: 'canonical',
      APP_GATEWAY_KEY: randomBytes(32).toString('hex'),
      OWNER_EMAIL: 'fixture-owner@mail-actions.invalid',
      OWNER_PASSWORD: randomBytes(24).toString('base64url'),
      APP_ORIGIN: origin,
      SITE_ORIGIN: origin,
    },
  );
  await ready(backendUrl + '/api/health', backend);
  const admin = new PocketBase(backendUrl);
  await admin.collection('_superusers').authWithPassword(adminEmail, adminPassword);
  let collection;
  try {
    collection = await admin.collections.getOne(collectionName);
  } catch {
    collection = await admin.collections.create({
      name: collectionName,
      type: 'auth',
      authRule: '',
      passwordAuth: { enabled: true, identityFields: ['email'] },
    });
  }
  const templates = {};
  for (const [field, type] of [
    ['verificationTemplate', 'verification'],
    ['resetPasswordTemplate', 'password-reset'],
    ['confirmEmailChangeTemplate', 'email-change'],
  ]) {
    templates[field] = {
      subject: 'Disposable mail confirmation fixture',
      body:
        '<a href="{APP_URL}/mail-actions#action=' +
        type +
        '&amp;collection=' +
        collectionName +
        '&amp;token={TOKEN}">Continue</a>',
    };
  }
  await admin.collections.update(collection.id, {
    authRule: '',
    passwordAuth: { enabled: true, identityFields: ['email'] },
  });
  await admin.settings.update({
    meta: {
      appName: 'Disposable fixture',
      appURL: origin,
      senderName: 'Fixture',
      senderAddress: 'fixture@mail-actions.invalid',
    },
    smtp: { enabled: false },
  });
  const email = 'listener@mail-actions.invalid';
  const originalPassword = randomBytes(18).toString('base64url');
  const record = await admin.collection(collectionName).create({
    email,
    verified: false,
    password: originalPassword,
    passwordConfirm: originalPassword,
  });
  const existingSession = new PocketBase(backendUrl);
  await existingSession.collection(collectionName).authWithPassword(email, originalPassword);
  const beforeTemplates = await admin.collections.getOne(collection.id);
  await admin.collections.update(collection.id, templates);
  const afterTemplates = await admin.collections.getOne(collection.id);
  for (const field of [
    'authRule',
    'listRule',
    'viewRule',
    'createRule',
    'updateRule',
    'deleteRule',
    'manageRule',
    'fields',
    'passwordAuth',
    'authToken',
    'passwordResetToken',
    'verificationToken',
    'emailChangeToken',
    'oauth2',
    'otp',
    'mfa',
  ])
    assert.deepEqual(afterTemplates[field], beforeTemplates[field]);
  await existingSession.collection(collectionName).authRefresh();
  const publicClient = new PocketBase(backendUrl);
  stage = 'frontend readiness';
  const server = start(
    process.execPath,
    [
      path.join(root, 'node_modules/next/dist/bin/next'),
      'start',
      '--hostname',
      '127.0.0.1',
      '--port',
      '18091',
    ],
    frontend,
    {
      POCKETBASE_URL: backendUrl,
      APP_ORIGIN: origin,
      SITE_ORIGIN: origin,
      APP_GATEWAY_KEY: randomBytes(32).toString('hex'),
      NEXT_TELEMETRY_DISABLED: '1',
    },
  );
  await ready(origin + '/mail-actions', server);
  assert.equal((await fetch(origin + '/_/')).status, 404);
  stage = 'verification';
  await publicClient.collection(collectionName).requestVerification(email);
  const verification = await captured('verification');
  assert.equal(verification.action, 'verification');
  assert.equal((await admin.collection(collectionName).getOne(record.id)).verified, false);
  if (process.env.MAIL_TEST_BROWSER === 'true') {
    const { chromium } = await import('@playwright/test');
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    browserPage = page;
    page.on('response', (response) => {
      if (new URL(response.url()).pathname === '/api/v1/mail-actions')
        browserActionStatus = response.status();
    });
    stage = 'browser page';
    await page.goto(verification.url);
    await mkdir('.runtime', { recursive: true });
    await page.screenshot({ path: '.runtime/mail-confirmation-start.png' });
    stage = 'browser confirmation button';
    await page.getByRole('button', { name: 'Confirm', exact: true }).waitFor();
    const { default: AxeBuilder } = await import('@axe-core/playwright');
    const accessibility = await new AxeBuilder({ page })
      .include('[data-mail-confirmation]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    assert.equal(accessibility.violations.length, 0);
    assert.equal(new URL(page.url()).hash, '');
    assert.equal((await admin.collection(collectionName).getOne(record.id)).verified, false);
    await page.getByRole('button', { name: 'Confirm', exact: true }).click();
    stage = 'browser completion';
    await page.getByRole('status').filter({ hasText: 'Completed.' }).waitFor();
    await mkdir('.runtime', { recursive: true });
    await page.screenshot({ path: '.runtime/mail-confirmation-verified.png' });
    await page.getByRole('combobox').selectOption('ar');
    stage = 'browser Arabic';
    assert.equal(await page.locator('[data-mail-confirmation]').getAttribute('dir'), 'rtl');
    await page.screenshot({ path: '.runtime/mail-confirmation-ar.png' });
    await page.getByRole('combobox').selectOption('fr');
    stage = 'browser French';
    await page
      .getByRole('status')
      .filter({ hasText: /Termin\u00e9\./u })
      .waitFor();
    await page.screenshot({ path: '.runtime/mail-confirmation-fr.png' });
  } else
    assert.equal(
      (
        await action({
          action: 'verification',
          collection: collectionName,
          token: verification.token,
        })
      ).status,
      200,
    );
  assert.equal((await admin.collection(collectionName).getOne(record.id)).verified, true);
  stage = 'password reset';
  await publicClient.collection(collectionName).requestPasswordReset(email);
  const reset = await captured('password-reset');
  assert.equal(reset.action, 'password-reset');
  const password = randomBytes(18).toString('base64url');
  const resetInput = {
    action: 'password-reset',
    collection: collectionName,
    token: reset.token,
    password,
    passwordConfirm: password,
  };
  if (browserPage) {
    stage = 'browser password reset';
    await browserPage.goto(reset.url);
    await browserPage.getByRole('combobox').selectOption('en');
    await browserPage.getByLabel('New password', { exact: true }).fill(password);
    await browserPage.getByLabel('Confirm new password', { exact: true }).fill(password);
    await browserPage.getByRole('button', { name: 'Confirm', exact: true }).click();
    await browserPage.getByRole('status').filter({ hasText: 'Completed.' }).waitFor();
  } else assert.equal((await action(resetInput)).status, 200);
  assert.equal((await action(resetInput)).status, 400);
  await assert.rejects(() => existingSession.collection(collectionName).authRefresh());
  const signedIn = new PocketBase(backendUrl);
  await signedIn.collection(collectionName).authWithPassword(email, password);
  await assert.rejects(() =>
    new PocketBase(backendUrl).collection(collectionName).authWithPassword(email, originalPassword),
  );
  stage = 'email change';
  const newEmail = 'confirmed-listener@mail-actions.invalid';
  await signedIn.collection(collectionName).requestEmailChange(newEmail);
  const change = await captured('email-change');
  assert.equal(change.action, 'email-change');
  if (browserPage) {
    stage = 'browser email change';
    await browserPage.goto(change.url);
    await browserPage.getByRole('combobox').selectOption('en');
    await browserPage.getByLabel('Current password', { exact: true }).fill(password);
    await browserPage.getByRole('button', { name: 'Confirm', exact: true }).click();
    await browserPage.getByRole('status').filter({ hasText: 'Completed.' }).waitFor();
  } else
    assert.equal(
      (
        await action({
          action: 'email-change',
          collection: collectionName,
          token: change.token,
          password,
        })
      ).status,
      200,
    );
  assert.equal((await admin.collection(collectionName).getOne(record.id)).email, newEmail);
  stage = 'cross-origin rejection';
  const rejected = await fetch(origin + '/api/v1/mail-actions', {
    method: 'POST',
    headers: { Origin: 'https://foreign.invalid', 'Content-Type': 'application/json' },
    body: JSON.stringify(resetInput),
  });
  assert.equal(rejected.status, 403);
  await mkdir('.runtime', { recursive: true });
  await writeFile(
    '.runtime/mail-confirmation-result.json',
    JSON.stringify({
      verification: true,
      passwordReset: true,
      resetReplayRejected: true,
      emailChange: true,
      existingSessionsPreservedByTemplatePatch: true,
      otherCollectionOptionsPreserved: true,
      crossOriginRejected: true,
      externalMailSent: false,
      browser: process.env.MAIL_TEST_BROWSER === 'true',
      wcagAA: process.env.MAIL_TEST_BROWSER === 'true',
    }) + '\n',
  );
  console.log(
    'Disposable native mail fixture passed: verification, password reset, replay rejection, email change and Origin guard. No external mail was sent.',
  );
} catch (error) {
  console.error('Disposable mail fixture failed', {
    stage,
    kind: error instanceof Error ? error.name : 'UnknownError',
    browserActionStatus,
  });
  if (browserPage) {
    await mkdir('.runtime', { recursive: true });
    await browserPage.screenshot({ path: '.runtime/mail-confirmation-failed.png' }).catch(() => {});
  }
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  for (const child of children.reverse()) {
    if (child.pid && child.exitCode === null) {
      const exited = once(child, 'exit');
      try {
        process.kill(-child.pid, 'SIGTERM');
      } catch {}
      await Promise.race([exited, new Promise((resolve) => setTimeout(resolve, 5000))]);
      if (child.exitCode === null) {
        try {
          process.kill(-child.pid, 'SIGKILL');
        } catch {}
      }
    }
  }
  await log.close();
  assert(
    path.resolve(folder).startsWith(path.resolve(os.tmpdir()) + path.sep + 'mail-confirmation-'),
  );
  await rm(folder, { recursive: true, force: true });
}
