import { test, expect } from '@playwright/test';

import { generateUser, generateArticle } from '../../generate.js';

import { 
  general, 
  auth,
  articleCommands
} from '../../pageObject.js';

let user, article;

test.describe('New Article', () => {
  test.beforeEach(async ({ page }) => {
    user = generateUser();
    
    article = generateArticle();

    await page.goto('/');
  
    await general.goto(page, 'user/register');

    await auth.signUp(page, user);

    await general.goto(page, 'editor');
  });

  test('should create an article with valid data', async ({ page }) => {
    await articleCommands.fillArticle(page, article);

    const [response] = await Promise.all([
      page.waitForResponse(res => res.url() === 'https://conduit.mate.academy/api/articles'),
      await articleCommands.publishArticleBtnClick(page)
    ]);

    const responseData = await response.json();
    
    const slug = responseData.article.slug;

    await articleCommands.assertArticleCreated(page, article, slug, user.username);

    await articleCommands.checkAddedtoMyPosts(page, article, user.username);
  });

  test('should not create an article without title', async ({ page }) => {
    article.title = '';

    await articleCommands.fillArticle(page, article);

    await articleCommands.publishArticleBtnClick(page);

    await general.assertErrorMessage(page, '0:Article title cannot be empty');

    expect(page.url()).toEqual('https://conduit.mate.academy/editor');
  });

  test('should not create an article without short description', async ({ page }) => {
    article.shortDesc = '';
  
    await articleCommands.fillArticle(page, article);

    await articleCommands.publishArticleBtnClick(page);

    await general.assertErrorMessage(page, '0:Article description cannot be empty');

    expect(page.url()).toEqual('https://conduit.mate.academy/editor');
  });

  test('should not create an article without body', async ({ page }) => {
    article.body = '';

    await articleCommands.fillArticle(page, article);

    await articleCommands.publishArticleBtnClick(page);

    await general.assertErrorMessage(page, '0:Article body cannot be empty');

    expect(page.url()).toEqual('https://conduit.mate.academy/editor');
  });

  test('tags should be optional', async ({ page }) => {
    articleCommands.tags = [];

    await articleCommands.fillArticle(page, article);

    const [response] = await Promise.all([
      page.waitForResponse(res => res.url() === 'https://conduit.mate.academy/api/articles'),
      await articleCommands.publishArticleBtnClick(page)
    ]);

    const responseData = await response.json();
    
    const slug = responseData.article.slug;

    await articleCommands.assertArticleCreated(page, article, slug, user.username);

    await articleCommands.checkAddedtoMyPosts(page, article, user.username);
  });

  test('should not allow XSS', async ({ page }) => {
    const tag = 'qa';

    article.body = `<${tag}>` + article.body + `</${tag}>`;

    await articleCommands.fillArticle(page, article);

    await articleCommands.publishArticleBtnClick(page);

    await articleCommands.waitArticlePageLoaded(page);

    const body = page.locator('div > p');

    const tagCount = await body.locator(tag).count();

    expect(tagCount).toEqual(0);
  });
});