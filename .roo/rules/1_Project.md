# PROJECT DOCUMENTATION ADHERENCE PROTOCOL

## MANDATORY PRE-CODING WORKFLOW

### Step 1: Documentation Discovery & Analysis
Before writing ANY code, you MUST:

1. **Scan Project Directory**: Use available tools to identify and read ALL documentation files in the project, including but not limited to:
   - `README.md` files at root and in subdirectories
   - All files in `docs/`, `documentation/`, `Project-setup/`, or similar directories
   - `package.json`, `tsconfig.json`, and other configuration files
   - Any `.md` files containing project specifications, architecture, or guidelines

2. **Extract Key Requirements**: From the documentation, identify:
   - **Architecture patterns** (monorepo structure, folder organization, etc.)
   - **Technology stack** (frameworks, libraries, tools specified)
   - **Coding standards** (naming conventions, code structure, linting rules)
   - **Design patterns** (component architecture, state management, etc.)
   - **Business rules** (authentication flows, data models, user roles)
   - **File naming conventions** and directory structures
   - **Dependencies** and version requirements

3. **Create Compliance Checklist**: Before coding, create a mental checklist of all documented requirements that your code must satisfy.

### Step 2: Code Implementation
While coding, continuously reference the extracted requirements to ensure:
- File placement follows documented directory structure
- Naming conventions match project standards
- Technology choices align with specified stack
- Code patterns follow documented architecture
- Dependencies match specified versions
- Business logic adheres to documented rules

### Step 3: MANDATORY POST-CODING QUALITY CONTROL

After writing code, you MUST perform this quality control process:

1. **Re-read Relevant Documentation**: Quickly review the project docs that relate to what you just coded

2. **Compliance Verification**: Check each piece of code against the documentation for:
   - ✅ **Architecture Compliance**: Does the code follow documented patterns?
   - ✅ **Technology Stack Adherence**: Are you using the specified frameworks/libraries?
   - ✅ **Naming Conventions**: Do files, functions, and variables follow documented standards?
   - ✅ **Directory Structure**: Are files placed in the correct documented locations?
   - ✅ **Dependency Management**: Are you using the correct versions and packages?
   - ✅ **Business Logic**: Does the implementation match documented requirements?
   - ✅ **Code Standards**: Does the code follow documented style guidelines?

3. **Gap Analysis**: If ANY gaps are found between your code and the documentation:
   - **STOP** and explain the discrepancy
   - **ASK** for clarification if documentation is unclear
   - **REVISE** the code to match documentation requirements
   - **RE-CHECK** compliance after revisions

4. **Documentation Impact Assessment**: Determine if your changes require updates to:
   - API documentation
   - Architecture diagrams
   - Configuration examples
   - User guides or README files

### Step 4: Compliance Declaration
Before completing any coding task, explicitly state:
- "✅ Code reviewed against project documentation"
- "✅ All documented requirements satisfied"
- "✅ No conflicts with existing architecture/standards"
- OR list specific areas where clarification is needed

## FAILURE PROTOCOL
If you proceed with code that violates documented standards:
1. **Acknowledge the violation** explicitly
2. **Explain the reasoning** for the deviation
3. **Request approval** for the exception
4. **Document the deviation** for future reference

## DOCUMENTATION PRECEDENCE
When conflicts arise between different sources:
1. **Technical Specification** (highest priority)
2. **Architecture documentation**
3. **Project setup/configuration files**
4. **README files**
5. **Code comments** (lowest priority)

Remember: The project documentation is the single source of truth. Your role is to implement solutions that perfectly align with the documented vision, architecture, and standards.