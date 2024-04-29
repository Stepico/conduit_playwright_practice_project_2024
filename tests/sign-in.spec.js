import { test, expect } from '@playwright/test';

import { generateUser } from '../generate.js';

import { general, auth } from '../pageObject.js';

test.describe('Sign In', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  
    await general.goto(page, 'user/login');
  });

  test('should have right title', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Sign in');
  });

  test('should have Need an account link', async ({ page }) => {
    const link = page.locator('a[href="/user/register"]:has-text("Need an account?")');

    await expect(link).toBeVisible();

    await link.click();

    await page.waitForURL('https://conduit.mate.academy/user/register');

    await expect(page.locator('h1')).toHaveText('Sign up');
  });

  test('should log in a user', async ({ page }) => {
    const user = generateUser();

    await auth.signUpAPI(user);

    await auth.signIn(page, user);

    await page.waitForURL('https://conduit.mate.academy');

    await general.assertUsernameHeader(page, user.username);
  });

  test('should not log in a user without email', async ({ page }) => {
    const user = generateUser();

    await auth.signUpAPI(user);

    const userCopy = {...user};
    userCopy.email = '';

    await auth.signIn(page, userCopy);

    await general.assertErrorMessage(page, "email:can't be blank");

    expect(page.url()).toEqual('https://conduit.mate.academy/user/login');
  });

  test('should not log in a user without password', async ({ page }) => {
    const user = generateUser();

    await auth.signUpAPI(user);

    const userCopy = {...user};
    userCopy.password = '';

    await auth.signIn(page, userCopy);

    await general.assertErrorMessage(page, "password:can't be blank");

    expect(page.url()).toEqual('https://conduit.mate.academy/user/login');
  });

  test('should not log in a user with incorrect credentials', async ({ page }) => {
    const user = generateUser();

    await auth.signUpAPI(user);

    const userCopy = {...user};
    userCopy.password += 'u';

    await auth.signIn(page, userCopy);

    await general.assertErrorMessage(page, "email or password:is invalid");

    expect(page.url()).toEqual('https://conduit.mate.academy/user/login');
  });
});