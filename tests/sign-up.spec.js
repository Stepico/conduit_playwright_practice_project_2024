import { test, expect } from '@playwright/test';

import { generateUser } from '../generate.js';

import { general, auth } from '../pageObject.js';

test.describe('Sign Up', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  
    await general.goto(page, 'user/register');
  });

  test('should have right title', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Sign up');
  });

  test('should have Have an account link', async ({ page }) => {
    const link = page.locator('a[href="/user/login"]:has-text("Have an account?")');

    await expect(link).toBeVisible();

    await link.click();

    await page.waitForURL('https://conduit.mate.academy/user/login');

    await expect(page.locator('h1')).toHaveText('Sign in');
  });

  test('should create a user', async ({ page }) => {
    const user = generateUser();

    await auth.signUp(page, user);

    await page.waitForURL('https://conduit.mate.academy');

    await general.assertUsernameHeader(page, user.username);
  });

  test('should not create a user without username', async ({ page }) => {
    const user = generateUser();
    user.username = '';

    await auth.signUp(page, user);

    await general.assertErrorMessage(page, 'username:Username must start with a letter, have no spaces, and be 3 - 40 characters.');

    expect(page.url()).toEqual('https://conduit.mate.academy/user/register');
  });

  test('should not create a user without email', async ({ page }) => {
    const user = generateUser();
    user.email = '';

    await auth.signUp(page, user, false);

    await general.assertErrorMessage(page, 'email:This email does not seem valid.');

    expect(page.url()).toEqual('https://conduit.mate.academy/user/register');
  });

  test('should not create a user without password', async ({ page }) => {
    const user = generateUser();
    user.password = '';

    await auth.signUp(page, user, false);

    await general.assertErrorMessage(page, "password:can't be blank");

    expect(page.url()).toEqual('https://conduit.mate.academy/user/register');
  });

  test('should not create a user with not unique email', async ({ page }) => {
    const user = generateUser();

    await auth.signUpAPI(user);

    const userCopy = {...user};
    userCopy.username += 'u';

    await auth.signUp(page, userCopy, false);

    await general.assertErrorMessage(page, 'email:This email is taken.');

    expect(page.url()).toEqual('https://conduit.mate.academy/user/register');
  });

  test('should not create a user with not unique username', async ({ page }) => {
    const user = generateUser();

    await auth.signUpAPI(user);

    const userCopy = {...user};
    
    const idxOfAt = userCopy.email.indexOf('@');

    userCopy.email = userCopy.email.slice(0, idxOfAt) + 'u' + userCopy.email.slice(idxOfAt);

    await auth.signUp(page, userCopy, false);

    await general.assertErrorMessage(page, 'username:This username is taken.');

    expect(page.url()).toEqual('https://conduit.mate.academy/user/register');
  });
});