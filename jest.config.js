module.exports = {
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // Use ts-jest for TypeScript files
    '^.+\\.jsx?$': 'babel-jest', // Use babel-jest for JavaScript files
  },
  testMatch: ['<rootDir>/test/**/*.test.(ts|js)'], // Match both .ts and .js test files
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/node_modules/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
};
