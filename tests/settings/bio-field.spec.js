import { test, expect } from '@playwright/test';

import { generateUser, generateText } from '../../generate.js';

import { 
  general, 
  auth,
  settings
} from '../../pageObject.js';

let user;

test.describe('Settings Short Bio Field', () => {
  test.beforeEach(async ({ page }) => {
    user = generateUser();

    await page.goto('/');
  
    await general.goto(page, 'user/register');

    await auth.signUp(page, user);

    await general.goto(page, 'settings');
  });

  test('should be empty by default', async ({ page }) => {
    await expect(page.getByPlaceholder('Short bio about you')).toHaveText('');
  });

  test('should update profile bio', async ({ page }) => {
    const testText = generateText(5);

    await page.getByPlaceholder('Short bio about you').fill(testText);

    await settings.updateSettings(page);

    await settings.assertSuccessfulUpdate(page);

    await expect(page.locator('div[class="user-info"] p')).toHaveText(testText);

    await general.goto(page, 'settings');

    await expect(page.getByPlaceholder('Short bio about you')).toHaveText(testText);
  });
});