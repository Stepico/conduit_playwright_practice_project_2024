import { test } from '@playwright/test';

import { 
  generateUser, 
  generateArticle,
  generateComment
} from '../../generate.js';

import { 
  general, 
  auth,
  articleCommands
} from '../../pageObject.js';

let user, article, comment, slug;

test.describe('Comment Article', () => {
  test.beforeEach(async ({ page }) => {
    user = generateUser();
    
    article = generateArticle();

    comment = generateComment();

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

  test('should post a comment', async ({ page }) => {
    await articleCommands.postComment(page, comment);

    await articleCommands.assertCommentPosted(page, comment, user.username)
  });
});