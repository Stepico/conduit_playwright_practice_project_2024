import { test, expect } from '@playwright/test';

import { testImageURL } from '../../test_data.js';

import { generateUser } from '../../generate.js';

import { 
  general, 
  auth,
  settings
} from '../../pageObject.js';

let user;

test.describe('Settings URL Field', () => {
  test.beforeEach(async ({ page }) => {
    user = generateUser();

    await page.goto('/');
  
    await general.goto(page, 'user/register');

    await auth.signUp(page, user);

    await general.goto(page, 'settings');
  });

  test('should be empty by default', async ({ page }) => {
    await expect(page.getByPlaceholder('URL of profile picture')).toHaveValue('');
  });

  test('should update profile picture', async ({ page }) => {
    await page.getByPlaceholder('URL of profile picture').fill(testImageURL);

    await settings.updateSettings(page);

    await settings.assertSuccessfulUpdate(page);

    await page.reload();

    const images = await page.getByRole('img').all();

    const srcPromises = images.map(async image => {
      return await image.getAttribute('src');
    });
    
    const srcValues = await Promise.all(srcPromises);
    
    const isUpdated = srcValues.every(src => src === testImageURL);

    expect(isUpdated).toEqual(true);

    await general.goto(page, 'settings');

    await expect(page.getByPlaceholder('URL of profile picture')).toHaveValue(testImageURL);
  });
});