module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  roots: ['<rootDir>/apps/', '<rootDir>/libs/'],
  moduleNameMapper: {
    '^@app/common(|/.*)$': '<rootDir>/libs/common/src/$1',
    '^@app/core(|/.*)$': '<rootDir>/libs/core/src/$1',
    '^@app/database(|/.*)$': '<rootDir>/libs/database/src/$1',
    '^@app/proxy(|/.*)$': '<rootDir>/libs/proxy/src/$1',
    '^@app/utility(|/.*)$': '<rootDir>/libs/utility/src/$1',
    '^@app/global-dto(|/.*)$': '<rootDir>/libs/global-dto/src/$1',
    '^@app/notification(|/.*)$': '<rootDir>/libs/notification/src/$1',
    '^@app/notification-client(|/.*)$':
      '<rootDir>/libs/notification-client/src/$1',
    '^libs/(.*)$': '<rootDir>/libs/$1',
  },
};
