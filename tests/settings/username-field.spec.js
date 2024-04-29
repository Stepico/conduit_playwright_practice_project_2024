import { test, expect } from '@playwright/test';

import { generateUser } from '../../generate.js';

import { 
  general, 
  auth,
  settings
} from '../../pageObject.js';

let user;

test.describe('Settings Username Field', () => {
  test.beforeEach(async ({ page }) => {
    user = generateUser();

    await page.goto('/');
  
    await general.goto(page, 'user/register');

    await auth.signUp(page, user);

    await general.goto(page, 'settings');
  });

  test('should be auto-filled with current value', async ({ page }) => {
    await expect(page.getByPlaceholder('Username')).toHaveValue(user.username);
  });

  test('should be updated with unique valid value', async ({ page }) => {
    user.username += 'l';

    await page.getByPlaceholder('Username').fill(user.username);

    await settings.updateSettings(page);

    await settings.assertSuccessfulUpdate(page);

    await general.assertUsernameHeader(page, user.username);
  });

  test('should not be updated with not unique value', async ({ page }) => {
    const anotherUser = generateUser();

    await auth.signUpAPI(anotherUser);

    await page.getByPlaceholder('Username').fill(anotherUser.username);

    const [response] = await Promise.all([
      page.waitForResponse(res => res.url() === 'https://conduit.mate.academy/api/user'),
      settings.updateSettings(page)
    ]);

    const responseData = await response.json();

    expect(responseData.errors.username[0]).toEqual('This username is taken.');

    await settings.assertUnsuccessfulUpdate(page);
  });

  test('should not be updated with blank value', async ({ page }) => {
    await page.getByPlaceholder('Username').fill('');

    const [response] = await Promise.all([
      page.waitForResponse(res => res.url() === 'https://conduit.mate.academy/api/user'),
      settings.updateSettings(page)
    ]);

    const responseData = await response.json();

    expect(responseData.errors.username[0]).toEqual('Username must start with a letter, have no spaces, and be 3 - 40 characters.');

    await settings.assertUnsuccessfulUpdate(page);
  });
});