# Feature: User Notes

## Objective

Create a new, standalone feature that allows a logged-in user to write, save, and view a single private note associated with their account.

## Manual Pre-computation Steps

Before running the command, you need to add a new field to the database schema.

1. Open `src/prisma/site/schema/schema.prisma`.
2. Add the following field to the `User` model:

    ```prisma
    note String? @db.Text
    ```

3. Run the following command in your terminal to create and apply the migration:

    ```bash
    npm run db:migrate:dev -- --name add-user-note
    ```

## Feature Requirements

### 1. API (Backend)

In the new `user-notes` feature's API files:

- **`getNote` Query:** A `protectedProcedure` that fetches and returns the `note` for the current user.
- **`updateNote` Mutation:** A `protectedProcedure` that accepts a `note` string and updates it for the current user. It should return a success message.

### 2. Lib (Validation)

- Create a Zod schema named `UpdateNoteSchema`.
- It should validate an object with a single property: `note`.
- The `note` should be a string with a maximum length of 5000 characters.

### 3. Components / Pages (Frontend)

- Create a main page component for the `user-notes` feature.
- This component should:
    - Use the `getNote` query to fetch the user's current note and display it in a `<textarea>`.
    - Use `react-hook-form` and the `UpdateNoteSchema` for the form.
    - Include a "Save" button.
    - When the form is submitted, call the `updateNote` mutation with the new note content.
    - Display loading states on the button while saving.
    - Show a success toast notification upon successful save.
    - Handle and display any errors from the API.

### 4. Routing (Manual Post-computation Step)

To make the new page accessible, a new route will need to be added. You can provide instructions for me to do this after the feature is implemented. The target URL should be `/notes`.
