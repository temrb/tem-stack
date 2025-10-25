---
description: Creates and implements a feature end-to-end using the scaffolding script.
argument-hint: '[feature-name] [path/to/instructions.md] (optional: module1 module2...)'
---

Your task is to create a new feature named `$1` by following the instructions in the file `@$2`. You will use the project's scaffolding script `npm run create`.

This is a two-step process:

1. **Scaffolding:** You will determine the necessary modules and guide the user to run the scaffolding script.
2. **Implementation:** After the user confirms that the files are created, you will write the code for the new feature.

## Step 1: Scaffolding

First, analyze the feature requirements detailed in `@$2`.

Based on your analysis, determine which of the following modules are required. The available modules are:

- `api`: For tRPC routes and services.
- `components`: For React components.
- `lib`: For TypeScript types and Zod validation schemas.
- `pages`: For reusable page sections.
- `header-actions`: For dynamic header content.
- `modals`: For dialogs or drawers.

**If optional arguments `$3`, `$4`, etc. are provided, use them as the definitive list of modules instead of analyzing the instructions file.**

After determining the required modules, present the list to the user. Then, instruct the user to run the `npm run create` command and select the modules you have identified. Provide the exact command to run.

Example response for Step 1:
"I will create the feature `$1`.
Based on the instructions in `@$2`, I've determined that we need the following modules: `[list of modules]`.

Please run this command in your terminal:
`npm run create -- $1`

When you are prompted to 'Select the modules to create for this feature:', use the spacebar to select the modules I listed above, and then press Enter to continue.

Let me know once the files have been created, and I will proceed with the implementation."

## Step 2: Implementation

Once the user confirms that the scaffolding is complete, you will implement the feature.

1. Refer back to the instructions in `@$2`.
2. Review the newly created boilerplate files in `src/features/$1/`.
3. Implement the feature logic, components, types, and API endpoints as required.
4. Ensure your implementation follows the conventions and architecture described in `CLAUDE.md`.
5. Provide the complete code for each new or modified file.

Utilize `.claude/agents` and `.claude/commands` as needed to assist with code generation, testing, and validation.
