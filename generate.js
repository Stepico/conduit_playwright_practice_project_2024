const { faker } = require('@faker-js/faker');

export function generateUser() {
  const random = Math.random().toString().slice(2, 8);
  const username = faker.word.noun().toLocaleLowerCase() + random;

  return {
    username,
    email: `${username}@gmail.com`,
    password: faker.internet.password()
  };
};

export function generateText(wordsNum = 3) {
  return faker.lorem.words(wordsNum);
};

export function generateArticle() {
  return {
    title: generateText(),
    shortDesc: generateText(5),
    body: generateText(20),
    tags: [
      generateText(1),
      generateText(1),
      generateText(1)
    ]
  };
};

export function generateComment() {
  return generateText(2);
};
