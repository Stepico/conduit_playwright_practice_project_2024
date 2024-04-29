import { test, expect } from '@playwright/test';

import { 
  generateUser, 
  generateArticle
} from '../../generate.js';

import { 
  general, 
  auth,
  articleCommands
} from '../../pageObject.js';

let user, article, slug;

test.describe('Delete Article', () => {
  test.beforeEach(async ({ page }) => {
    user = generateUser();
    
    article = generateArticle();

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
  });

  test('should delete an article', async ({ page }) => {
    await articleCommands.deleteArticle(page);

    await general.goToMyProfile(page, user.username);

    await page.locator('a[class*="nav-link"]:has-text("My Posts")').click();

    const articles = await page.locator('div[class="article-preview"]').all();

    expect(articles.length).toEqual(1);

    await expect(articles[0]).toHaveText('No articles are here... yet.');
  });
});