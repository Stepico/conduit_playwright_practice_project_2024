import { test, expect } from '@playwright/test';

import { generateUser, generateArticle } from '../../generate.js';

import { 
  general, 
  auth,
  articleCommands
} from '../../pageObject.js';

let user, article, anotherArticle, slug;

test.describe('Edit Article', () => {
  test.beforeEach(async ({ page }) => {
    user = generateUser();
    
    article = generateArticle();

    anotherArticle = generateArticle();

    await page.goto('/');
  
    await general.goto(page, 'user/register');

    await auth.signUp(page, user);

    await page.waitForURL('https://conduit.mate.academy');

    const token = await page.evaluate(() => {
      const user = JSON.parse(window.localStorage.user);
      return user.token;
    });

    slug = await articleCommands.createArticleAPI(article, token);

    await page.goto(`https://conduit.mate.academy/article/${slug}`);

    await articleCommands.editArticleBtnClick(page);

    await page.waitForURL(`https://conduit.mate.academy/editor/${slug}`);

    await articleCommands.removeTags(page);
  });

  test('should update article information with valid data', async ({ page }) => {
    await articleCommands.fillArticle(page, anotherArticle);

    await articleCommands.updateArticleBtnClick(page);

    await page.waitForURL(`https://conduit.mate.academy/article/${slug}`);

    await page.reload();

    await articleCommands.assertArticleCreated(page, anotherArticle, slug, user.username);

    await articleCommands.checkAddedtoMyPosts(page, anotherArticle, user.username);
  });

  test('should not update article information without title', async ({ page }) => {
    anotherArticle.title = '';

    await articleCommands.fillArticle(page, anotherArticle);

    await articleCommands.updateArticleBtnClick(page);

    await general.assertErrorMessage(page, '0:Article title cannot be empty');

    expect(page.url()).toEqual(`https://conduit.mate.academy/editor/${slug}`);
  });

  test('should not update article information without short description', async ({ page }) => {
    anotherArticle.shortDesc = '';

    await articleCommands.fillArticle(page, anotherArticle);

    await articleCommands.updateArticleBtnClick(page);

    await general.assertErrorMessage(page, '0:Article description cannot be empty');

    expect(page.url()).toEqual(`https://conduit.mate.academy/editor/${slug}`);
  });

  test('should not update article information without body', async ({ page }) => {
    anotherArticle.body = '';

    await articleCommands.fillArticle(page, anotherArticle);

    await articleCommands.updateArticleBtnClick(page);

    await general.assertErrorMessage(page, '0:Article body cannot be empty');

    expect(page.url()).toEqual(`https://conduit.mate.academy/editor/${slug}`);
  });

  test('should update article information without tags', async ({ page }) => {
    anotherArticle.tags = [];

    await articleCommands.fillArticle(page, anotherArticle);

    await articleCommands.updateArticleBtnClick(page);

    await page.waitForURL(`https://conduit.mate.academy/article/${slug}`);

    await page.reload();

    await articleCommands.assertArticleCreated(page, anotherArticle, slug, user.username);

    await articleCommands.checkAddedtoMyPosts(page, anotherArticle, user.username);
  });
});