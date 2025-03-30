# Contributing to DAO Voting App

Thank you for considering contributing to the DAO Voting App! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Consider constructive criticism as a valuable contribution
- Maintain a friendly and collaborative environment
- Focus on the problem, not the person

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please create an issue with the following information:
- A clear title and description
- Steps to reproduce the bug
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (browser, OS, etc.)

### Suggesting Enhancements

For feature requests:
- Clearly describe the enhancement
- Explain why it would be useful
- Consider including mockups or examples
- Discuss potential implementation approaches

### Pull Requests

1. Fork the repository
2. Create a new branch from `main`
3. Make your changes
4. Test your changes thoroughly
5. Submit a pull request with a clear description

#### Pull Request Process

1. Ensure your code follows the project's style guidelines
2. Include tests for new functionality
3. Update documentation as needed
4. Verify that all tests pass
5. Request review from maintainers

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/dao-voting-app.git
   cd dao-voting-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment configuration:
   ```bash
   cp .env.local.example .env.local
   ```
   Update with your development values.

4. Start the development server:
   ```bash
   npm run dev
   ```

### Testing

- Run smart contract tests:
  ```bash
  npx hardhat test
  ```

- Run frontend tests:
  ```bash
  npm test
  ```

## Style Guidelines

### Solidity Style Guide

- Follow [Solidity style guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use NatSpec comments for function documentation
- Prioritize security best practices
- Include thorough error handling

### JavaScript/TypeScript Style Guide

- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write meaningful function and variable names
- Include JSDoc comments for complex functions

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Consider using conventional commits format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `style:` for formatting changes
  - `refactor:` for code refactoring
  - `test:` for adding tests
  - `chore:` for maintenance tasks

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [MIT License](../LICENSE). 