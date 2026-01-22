# /commit

Create a well-formatted git commit for staged changes.

## Instructions

1. Run `git status` to see staged changes
2. Run `git diff --cached` to see the actual changes
3. Analyze the changes and create a commit message following conventional commits:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `refactor:` for refactoring
   - `test:` for tests
   - `chore:` for maintenance

4. The commit message should be concise but descriptive
5. Create the commit with the generated message

If no changes are staged, suggest what to stage based on `git status`.

$ARGUMENTS
