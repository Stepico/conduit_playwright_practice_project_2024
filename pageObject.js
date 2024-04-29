import { expect } from '@playwright/test';

const axios = require('axios');

import { pauseValue } from './test_data.js';

const POM = {
  general: {
    goto: async function (page, pageName) {
      await page.locator(`li a[href="/${pageName}"]`).click();

      await page.waitForURL(`https://conduit.mate.academy/${pageName}`);
    },

    goToMyProfile: async function (page, username) {
      await page.locator(`nav a[href="/profile/${username}"]`).click();

      await page.waitForURL(`https://conduit.mate.academy/profile/${username}`);
    },

    assertUsernameHeader: async function (page, username) {
      await expect(page.locator('nav li:last-child a[class*="nav-link"]')).toHaveText(username);
    },

    assertErrorMessage: async function (page, errorMessage) {
      await expect(page.locator('ul[class="error-messages"]')).toBeVisible();

      await expect(page.locator('ul[class="error-messages"]')).toHaveText(errorMessage);

      await page.waitForTimeout(pauseValue);
    }
  },

  auth: {
    signUp: async function (page, userInfo, isSuccessful = true) {
      const { username, email, password } = userInfo;

      await page.getByPlaceholder('Username').fill(username);
      await page.getByPlaceholder('Email').fill(email);
      await page.getByPlaceholder('Password').fill(password);

      await page.locator('button:has-text("Sign up")').click();

      if (isSuccessful) {
        await page.waitForTimeout(pauseValue);
      }
    },

    signUpAPI: async function (userInfo) {
      const user = {
        user: userInfo
      };

      await axios.post('https://conduit.mate.academy/api/users', user);
    },

    signIn: async function (page, userInfo) {
      const { email, password } = userInfo;

      await page.getByPlaceholder('Email').fill(email);
      await page.getByPlaceholder('Password').fill(password);

      await page.locator('button:has-text("Sign in")').click();
    },

    signOut: async function (page) {
      await page.locator('button:has-text("Or click here to logout.")').click();

      await page.waitForURL('https://conduit.mate.academy/');
    }
  },

  settings: {
    updateSettings: async function (page) {
      await page.locator('button:has-text("Update Settings")').click();
    },

    assertSuccessfulUpdate: async function (page) {
     await page.waitForURL(/https:\/\/conduit\.mate\.academy\/profile\/.*/);
    },

    assertUnsuccessfulUpdate: async function (page) {
      expect(page.url()).toEqual('https://conduit.mate.academy/settings');

      await page.waitForTimeout(pauseValue);
    }
  },

  articleCommands: {
    fillArticle: async function (page, article) {
      const { title, shortDesc, body, tags } = article;

      await page.getByPlaceholder('Article Title').fill(title);
      await page.getByPlaceholder("What's this article about?").fill(shortDesc);
      await page.getByPlaceholder('Write your article (in markdown)').fill(body);

      for (const tag of tags) {
        await page.getByPlaceholder('Enter tags').fill(tag);
        await page.keyboard.press('Enter');
      }
    },

    publishArticleBtnClick: async function (page) {
      await page.locator('button:has-text("Publish Article")').click();
    },

    waitArticlePageLoaded: async function (page) {
      await page.waitForURL(/https:\/\/conduit\.mate\.academy\/article\/.*/);
    },

    assertArticleCreated: async function (page, article, slug, username) {
      const { title, body, tags } = article;

      await POM.articleCommands.waitArticlePageLoaded(page);

      expect(page.url()).toEqual(`https://conduit.mate.academy/article/${slug}`);

      await expect(page.locator('h1')).toHaveText(title);

      await expect(page.locator('div > p')).toHaveText(body);

      const articleTags = await page.locator('ul[class="tag-list"] li').all();

      expect(articleTags).toHaveLength(tags.length);

      const actualTags = await Promise.all(articleTags.map(tag => tag.textContent()));

      for (const expectedTag of tags) {
        expect(actualTags).toContain(expectedTag);
      }

      const authors = await page.locator('a[class="author"]').all();

      const authorNames = authors.map(async author => {
        return await author.textContent();
      });

      const authorValues = await Promise.all(authorNames);

      const isRightAuthor = authorValues.every(author => author === username);

      expect(isRightAuthor).toEqual(true);
    },

    createArticleAPI: async function (article, token) {
      const { title, shortDesc, body, tags } = article;

      const articleInfo = {
        article: {
          body,
          description: shortDesc,
          tagList: tags,
          title
        }
      };

      const headers = {
        'Authorization': `Token ${token}`
      };

      const response = await axios.post('https://conduit.mate.academy/api/articles', articleInfo, {
        headers: headers
      });

      return response.data.article.slug;
    },

    editArticleBtnClick: async function (page) {
      await page.locator('div[class="article-meta"]:first-child a[class*="btn"]').click();
    },

    updateArticleBtnClick: async function (page) {
      await page.locator('button:has-text("Update Article")').click();
    },

    removeTags: async function (page) {
      let tags = await page.locator('i[class="ion-close-round"]').all();

      while (tags.length > 0) {
        await tags[0].click();
        
        // Update the tags array to reflect the updated DOM
        tags = await page.locator('i[class="ion-close-round"]').all();
      }
    },

    checkAddedtoMyPosts: async function (page, article, username) {
      const { title, shortDesc } = article;

      await POM.general.goToMyProfile(page, username);

      await page.reload();

      const articleTitles = await page.locator('div[class="article-preview"] h1').all();

      expect(articleTitles.length).toEqual(1);

      const articleDescriptions = await page.locator('div[class="article-preview"] p').all();

      expect(articleDescriptions.length).toEqual(1);

      await expect(articleTitles[0]).toHaveText(`Article title: ${title}`);

      await expect(articleDescriptions[0]).toHaveText(`Article description: ${shortDesc}`);
    },

    postComment: async function (page, comment) {
      await page.getByPlaceholder('Write a comment...').fill(comment);
  
      await page.locator('button:has-text("Post Comment")').click();

      await page.waitForTimeout(pauseValue);
    },
  
    assertCommentPosted: async function (page, comment, author) {
      const comments = await page.locator('div[class="card"]').all();

      expect(comments.length).toEqual(1);

      const commentValue = await comments[0].locator('div[class="card-block"]');

      const commentText = await commentValue.textContent();

      expect(commentText).toEqual(comment);

      const authorValue = await comments[0].locator('div[class="card-footer"] a[class="comment-author"]:last-of-type');

      const authorText = await authorValue.textContent();

      expect(authorText).toEqual(author);
    },

    deleteArticle: async function (page) {
      page.on('dialog', async dialog => {
        await dialog.accept();
      });

      await page.locator('div[class="banner"] button').click();

      await page.waitForTimeout(pauseValue);
    }
  },
};

module.exports = POM;