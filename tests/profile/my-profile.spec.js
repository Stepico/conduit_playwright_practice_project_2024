import { test, expect } from '@playwright/test';

import { defaultImageURL } from '../../test_data.js';

import { generateUser } from '../../generate.js';

import { general, auth } from '../../pageObject.js';

let user;

test.describe('My Personal Profile', () => {
  test.beforeEach(async ({ page }) => {
    user = generateUser();

    await page.goto('/');
  
    await general.goto(page, 'user/register');

    await auth.signUp(page, user);

    await general.assertUsernameHeader(page, user.username);
  });

  test('Avatar (profile image) should have a default value', async ({ page }) => {
    await general.goToMyProfile(page, user.username);

    const images = await page.getByRole('img').all();

    const srcPromises = images.map(async image => {
      return await image.getAttribute('src');
    });
    
    const srcValues = await Promise.all(srcPromises);
    
    const isDefault = srcValues.every(src => src === defaultImageURL);

    expect(isDefault).toEqual(true);
  });

  test('Your Feed should be empty by default', async ({ page }) => {
    const articles = await page.locator('div[class="article-preview"]').all();

    expect(articles.length).toEqual(1);

    await expect(articles[0]).toHaveText('No articles are here... yet.');
  });

  test('My Posts should be empty by default', async ({ page }) => {
    await general.goToMyProfile(page, user.username);

    await page.locator('a[class*="nav-link"]:has-text("My Posts")').click();

    const articles = await page.locator('div[class="article-preview"]').all();

    expect(articles.length).toEqual(1);

    await expect(articles[0]).toHaveText('No articles are here... yet.');
  });

  test('Favorited Posts should be empty by default', async ({ page }) => {
    await general.goToMyProfile(page, user.username);

    await page.locator('a[class*="nav-link"]:has-text("Favorited Posts")').click();

    const articles = await page.locator('div[class="article-preview"]').all();

    expect(articles.length).toEqual(1);

    await expect(articles[0]).toHaveText('No articles are here... yet.');
  });

  test('Username should be displayed below avatar', async ({ page }) => {
    await general.goToMyProfile(page, user.username);

    await expect(page.locator('h4')).toHaveText(user.username);
  });
});