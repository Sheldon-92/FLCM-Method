module.exports = {
  '*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    () => 'tsc --noEmit',
  ],
  '*.{js,jsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,yaml,yml}': ['prettier --write'],
  '*.md': ['prettier --write'],
  '**/*.test.{ts,js}': ['jest --bail --findRelatedTests'],
};