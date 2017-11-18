import path from 'path';

before(() => {
  const dir = path.join(__dirname, '../fixtures');
  process.chdir(dir);
});
