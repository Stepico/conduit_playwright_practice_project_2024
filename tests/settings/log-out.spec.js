import { test, expect } from '@playwright/test';

import { generateUser } from '../../generate.js';

import { general, auth } from '../../pageObject.js';

let user;

test.describe('Or click here to logout button', () => {
  test.beforeEach(async ({ page }) => {
    user = generateUser();

    await page.goto('/');
  
    await general.goto(page, 'user/register');

    await auth.signUp(page, user);
  });

  test('should log a user out', async ({ page }) => {
    await expect(page.locator('a[class="nav-link"]:has-text("Sign in")')).toHaveCount(0);

    await expect(page.locator('a[class="nav-link"]:has-text("Sign up")')).toHaveCount(0);

    await expect(page.locator('a:has-text("Your Feed")')).toHaveCount(1);

    await general.goto(page, 'settings');

    await page.locator('button:has-text("Or click here to logout.")').click();

    expect(page.url()).toEqual('https://conduit.mate.academy/');

    await expect(page.locator('a[class="nav-link"]:has-text("Sign in")')).toHaveCount(1);

    await expect(page.locator('a[class="nav-link"]:has-text("Sign up")')).toHaveCount(1);

    await expect(page.locator('a:has-text("Your Feed")')).toHaveCount(0);
  });
});