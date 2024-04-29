import { test, expect } from '@playwright/test';

import { generateUser } from '../../generate.js';

import { 
  general, 
  auth,
  settings
} from '../../pageObject.js';

let user;

test.describe('Settings Email Field', () => {
  test.beforeEach(async ({ page }) => {
    user = generateUser();

    await page.goto('/');
  
    await general.goto(page, 'user/register');

    await auth.signUp(page, user);

    await general.goto(page, 'settings');
  });

  test('should be auto-filled with current value', async ({ page }) => {
    await expect(page.getByPlaceholder('Email')).toHaveValue(user.email);
  });

  test('should be of type email', async ({ page }) => {
    const emailField = page.getByPlaceholder('Email');

    expect(await emailField.getAttribute('type')).toEqual('email');
  });

  test('should be updated with unique valid value', async ({ page }) => {
    const idxOfAt = user.email.indexOf('@');

    user.email = user.email.slice(0, idxOfAt) + 'l' + user.email.slice(idxOfAt);

    await page.getByPlaceholder('Email').fill(user.email);

    await settings.updateSettings(page);

    await settings.assertSuccessfulUpdate(page);

    await general.goto(page, 'settings');

    await auth.signOut(page);

    await general.goto(page, 'user/login');

    await auth.signIn(page, user);

    await page.waitForURL('https://conduit.mate.academy');

    await general.assertUsernameHeader(page, user.username);
  });

  test('should not log in with previous value', async ({ page }) => {
    const idxOfAt = user.email.indexOf('@');

    const newEmail = user.email.slice(0, idxOfAt) + 'l' + user.email.slice(idxOfAt);

    await page.getByPlaceholder('Email').fill(newEmail);

    await settings.updateSettings(page);

    await settings.assertSuccessfulUpdate(page);

    await general.goto(page, 'settings');

    await auth.signOut(page);

    await general.goto(page, 'user/login');

    await auth.signIn(page, user);

    await general.assertErrorMessage(page, "email or password:is invalid");

    expect(page.url()).toEqual('https://conduit.mate.academy/user/login');
  });

  test('should not be updated with not unique value', async ({ page }) => {
    const anotherUser = generateUser();

    await auth.signUpAPI(anotherUser);

    await page.getByPlaceholder('Email').fill(anotherUser.email);

    const [response] = await Promise.all([
      page.waitForResponse(res => res.url() === 'https://conduit.mate.academy/api/user'),
      settings.updateSettings(page)
    ]);

    const responseData = await response.json();

    expect(responseData.errors.email[0]).toEqual('This email is taken.');

    await settings.assertUnsuccessfulUpdate(page);
  });

  test('should not be updated with blank value', async ({ page }) => {
    await page.getByPlaceholder('Email').fill('');

    const [response] = await Promise.all([
      page.waitForResponse(res => res.url() === 'https://conduit.mate.academy/api/user'),
      settings.updateSettings(page)
    ]);

    const responseData = await response.json();

    expect(responseData.errors.email[0]).toEqual('This email does not seem valid.');

    await settings.assertUnsuccessfulUpdate(page);
  });
});