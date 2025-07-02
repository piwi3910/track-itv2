# GIT WORKFLOW BEST PRACTICES

## MANDATORY GIT WORKFLOW FOR ALL TASKS

### Rule 1: Always Commit After Task Completion
**EVERY** task completion MUST be followed by:
1. `git add .`
2. `git commit -m "[descriptive commit message]"`
3. `git push`

**NO EXCEPTIONS** - This is mandatory for all code changes, documentation updates, or configuration modifications.

### Rule 2: Commit Message Standards

#### Format Structure
```
[Type #IssueNumber] Short summary (50 characters max)

Detailed explanation of what and why (not how)
- Bullet point for major changes
- Another bullet point for important details
- Include impact and reasoning

Resolves #IssueNumber
```

#### Commit Types
- `[Fix]` - Bug fixes and error corrections
- `[Feature]` - New functionality or enhancements
- `[Docs]` - Documentation updates
- `[Refactor]` - Code restructuring without functionality changes
- `[Test]` - Adding or modifying tests
- `[Config]` - Configuration file changes
- `[Security]` - Security-related changes
- `[Performance]` - Performance improvements

#### Examples
```bash
# Good commit messages
git commit -m "[Feature #42] Add user authentication with JWT tokens

- Implemented bcrypt password hashing for secure storage
- Added JWT token generation and validation middleware
- Created login/logout endpoints with proper error handling
- Updated user model to include password and session fields

Resolves #42"

git commit -m "[Fix #15] Resolve memory leak in task synchronization

- Fixed WebSocket connection cleanup on component unmount
- Added proper event listener removal in useEffect cleanup
- Implemented connection pooling to prevent excessive connections

Resolves #15"
```

### Rule 3: Branch Management

#### Branch Naming Convention
- **Feature branches**: `feature/issue-NUMBER-brief-description`
- **Bug fix branches**: `fix/issue-NUMBER-brief-description`
- **Hotfix branches**: `hotfix/issue-NUMBER-brief-description`
- **Documentation**: `docs/issue-NUMBER-brief-description`

#### Examples
```bash
git checkout -b feature/issue-42-user-authentication
git checkout -b fix/issue-15-memory-leak-websocket
git checkout -b docs/issue-30-api-documentation
```

### Rule 4: Pre-Commit Checklist

Before every commit, verify:
- ✅ Code follows project documentation standards
- ✅ All linting rules pass (`npm run lint`)
- ✅ All tests pass (`npm test`)
- ✅ No console.log() statements in production code
- ✅ No TODO comments without GitHub issue references
- ✅ Proper error handling implemented
- ✅ Security considerations addressed

### Rule 5: Atomic Commits

#### DO: Make Small, Focused Commits
- One logical change per commit
- Related changes grouped together
- Easy to review and understand
- Simple to revert if needed

#### DON'T: Make Large, Mixed Commits
- Multiple unrelated changes in one commit
- Mixing bug fixes with new features
- Combining code changes with dependency updates

### Rule 6: GitHub Integration

#### Always Reference Issues
- Every commit MUST reference a GitHub issue
- Use "Resolves #NUMBER" in commit body
- Close issues automatically through commits
- Link related issues with "Related to #NUMBER"

#### Pull Request Requirements
- Create PR for feature branches before merging
- Include detailed PR description
- Request code review from team members
- Ensure CI/CD checks pass before merging

### Rule 7: Repository Hygiene

#### Regular Maintenance
```bash
# Clean up merged branches
git branch -d feature/completed-branch
git push origin --delete feature/completed-branch

# Keep main branch updated
git checkout main
git pull origin main

# Rebase feature branches regularly
git checkout feature/my-branch
git rebase main
```

#### File Management
- Add appropriate entries to `.gitignore`
- Never commit sensitive information (API keys, passwords)
- Remove unused files and dependencies
- Keep repository size manageable

### Rule 8: Emergency Procedures

#### For Critical Hotfixes
1. Create hotfix branch from main
2. Make minimal necessary changes
3. Test thoroughly
4. Commit with clear emergency message
5. Push immediately
6. Create PR for review ASAP

```bash
git checkout main
git checkout -b hotfix/critical-security-fix
# Make fixes
git add .
git commit -m "[Security] Critical fix for authentication bypass

- Patched JWT token validation vulnerability
- Added additional input sanitization
- Updated security dependencies

URGENT: Resolves #999"
git push
```

### Rule 9: Collaboration Guidelines

#### Before Starting Work
1. Pull latest changes: `git pull origin main`
2. Create new branch for your work
3. Check GitHub issues for conflicts
4. Communicate with team about major changes

#### During Development
- Commit frequently (at least daily)
- Push to remote branch regularly
- Keep branch updated with main
- Write descriptive commit messages

#### After Completion
- Final commit with task completion
- Push all changes
- Create PR if using feature branches
- Update GitHub issue status

### Rule 10: Backup and Recovery

#### Daily Practices
- Push all work daily (minimum)
- Never work on main branch directly
- Keep local and remote branches synchronized
- Tag important releases

#### Recovery Commands
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Restore deleted file
git checkout HEAD -- filename

# View commit history
git log --oneline -n 10
```

## ENFORCEMENT

### Automated Checks
- Pre-commit hooks for linting and testing
- CI/CD pipeline validation
- Branch protection rules on main
- Required PR reviews for sensitive changes

### Manual Verification
- Weekly commit message review
- Monthly branch cleanup
- Quarterly workflow assessment
- Annual Git training updates

## VIOLATIONS AND CONSEQUENCES

### Warning Level
- Missing issue reference in commit
- Poor commit message format
- Forgetting to push after completion

### Serious Level
- Committing sensitive information
- Breaking main branch
- Ignoring pre-commit checks
- Large commits without proper breakdown

### Critical Level
- Force pushing to main branch
- Deleting important branches
- Committing malicious code
- Bypassing all safety checks

**Remember: Good Git practices save time, prevent conflicts, and maintain project integrity. When in doubt, commit early and often with clear messages.**