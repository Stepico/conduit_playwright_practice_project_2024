import { test, expect } from '@playwright/test';

import { generateUser } from '../../generate.js';

import { 
  general, 
  auth,
  settings
} from '../../pageObject.js';

let user;

test.describe('Settings Password Field', () => {
  test.beforeEach(async ({ page }) => {
    user = generateUser();

    await page.goto('/');
  
    await general.goto(page, 'user/register');

    await auth.signUp(page, user);

    await general.goto(page, 'settings');
  });

  test('should not be auto-filled with current value', async ({ page }) => {
    await expect(page.getByPlaceholder('Password')).toHaveValue('');
  });

  test('should be of type password', async ({ page }) => {
    const passwordField = page.getByPlaceholder('Password');

    expect(await passwordField.getAttribute('type')).toEqual('password');
  });

  test('should log in with new value', async ({ page }) => {
    user.password += '1';

    await page.getByPlaceholder('Password').fill(user.password);

    await settings.updateSettings(page);

    await settings.assertSuccessfulUpdate(page);

    await general.goto(page, 'settings');

    await auth.signOut(page);

    await general.goto(page, 'user/login');

    await auth.signIn(page, user);

    await general.assertUsernameHeader(page, user.username);
  });

  test('should not log in with previous value', async ({ page }) => {
    const newPassword = user.password + '1';

    await page.getByPlaceholder('Password').fill(newPassword);

    await settings.updateSettings(page);

    await settings.assertSuccessfulUpdate(page);

    await general.goto(page, 'settings');

    await auth.signOut(page);

    await general.goto(page, 'user/login');

    await auth.signIn(page, user);

    await general.assertErrorMessage(page, "email or password:is invalid");

    expect(page.url()).toEqual('https://conduit.mate.academy/user/login');
  });
});