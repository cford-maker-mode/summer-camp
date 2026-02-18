
# Cloud Login Spec

## Feature Spec: User Login & Personal Cloud Data with Public Camp Catalog

### 1. User Experience Flow

#### A. First Visit / Sign Up
- User lands on the app and is prompted to “Sign in with Google Drive” (or other supported cloud providers).
- On sign-in, the app requests permission to access a specific folder in the user’s cloud storage (for personal data).
- User selects or confirms a folder (e.g., “Itinerino Summer Camp Data”).
- App creates initial personal data structure in that folder (if not present).
- **Onboarding:** The app clearly explains that all personal data is stored in the user’s own cloud (Google Drive), and the app never stores or transmits user data to its own servers. Users are shown how to find/manage their folder in Drive.

#### B. Main App Experience
- User sees the public, community-contributed camp catalog (read-only).
- User can:
  - Browse/search/filter the public catalog.
  - “Favorite” any camp (star icon).
  - Add a new camp (contributes to the public catalog, auto-favorited for the user).
  - Filter to see only their favorites.
- User’s summer plan, signups, and favorites are stored in their own cloud folder.
- All personal actions (plan, favorites, signups) are private to the user and synced to their cloud.
- **Drive Folder Management:** If the user deletes or moves the app folder/files in Drive, the app detects this and prompts the user to relink or recreate the folder.
- **Error Handling:** If Drive API access is lost (token expired, permissions revoked, quota exceeded), the app shows clear error messages and guides the user to re-authenticate or resolve the issue.

#### C. Returning User
- On return, user signs in with their cloud provider.
- App loads their personal data from their cloud folder and the latest public camp catalog.
- **Token Refresh:** The app ensures Drive API tokens are refreshed as needed for long sessions, and prompts the user to re-authenticate if required.


### 2. Data Structure & Integration

#### A. Public Camp Catalog (src/public-catalog/)
- All logic and types for the public camp catalog are in `src/public-catalog/`.
- Markdown files for camps are stored in a shared, public repo or cloud bucket (read-only for most users, write via PR or admin moderation).
- Each camp is a markdown file with structured frontmatter.
- The app loads the public catalog using the `public-catalog` module.

#### B. User Personal Data (src/user-data/)
- All logic and types for user-owned data are in `src/user-data/`.
- Folder structure in the user's cloud (Google Drive, OneDrive, etc.):
  ```
  /Itinerino/
    summer-2026/
      summer.md
      sessions/
        session-001.md
        ...
      events/
        event-001.md
    favorites.json
    signups.json
    user-profile.json
  ```
- `favorites.json` contains a list of camp IDs the user has starred (including those they created).
- `signups.json` tracks signup tasks and statuses.
- `user-profile.json` stores minimal user info and settings.
- **Schema Versioning:** Each file includes a version field in frontmatter or JSON. The app maintains a changelog and can prompt the user to migrate data if needed.
- The app reads/writes user data using the `user-data` module.

#### C. Integration & APIs
- Use OAuth2 for Google Drive/OneDrive login and file access.
- Use Google Drive/OneDrive REST APIs to read/write user data. All file operations are performed in the user’s cloud folder, never on the app’s servers.
- App backend (or serverless functions) mediates public catalog updates (for new camp contributions).
- All personal data operations (favorites, summer plan, signups) are client-side or via user’s cloud API, using the `user-data` module.

### 3. Feature Spec

#### 3.1 Authentication & Cloud Integration
- Support “Sign in with Google Drive” (OAuth2).
- On first login, prompt user to select/create a folder for Itinerino data.
- Store access token securely (session/local storage, never persisted to server).
- All personal data read/writes go to user’s cloud folder. The app never stores or transmits user data to its own servers.
- **Token Refresh:** Ensure Drive API tokens are refreshed as needed for long sessions, and prompt the user to re-authenticate if required.

#### 3.2 Public Camp Catalog
- Load public camp catalog from a shared repo/cloud bucket.
- Display all camps, searchable and filterable.
- “Add Camp” flow submits new camp to the public catalog (via PR or admin moderation).

#### 3.3 Favorites & Personalization
- User can star any camp (favorites).
- User’s favorites are stored in their cloud folder (favorites.json).
- Camps created by the user are auto-favorited.
- Filter to show only favorites.

#### 3.4 Personal Summer Plan & Signups
- All summer plan data, signups, and notes are stored in the user’s cloud folder.
- No personal data is stored on the app’s servers.
- **Drive Folder Management:** If the user deletes or moves the app folder/files in Drive, the app detects this and prompts the user to relink or recreate the folder.

#### 3.5 Data Sync, Privacy & Error Handling
- On login, app loads user’s data from their cloud.
- All personal actions (favorite, plan, signup) are synced to their cloud.
- Public catalog is always up-to-date from the shared source.
- **Error Handling:** If Drive API access is lost (token expired, permissions revoked, quota exceeded), the app shows clear error messages and guides the user to re-authenticate or resolve the issue.
- **Offline Support:** Editing requires online access. Viewing is allowed from last loaded data. Show a clear error message when offline: "You are offline. Editing is disabled. Viewing is from your last session."

### 4. Required Integrations & APIs

- Google Drive API (OAuth2, file/folder read/write, token refresh)
- (Optional) OneDrive API for future support
- GitHub API or cloud bucket API for public camp catalog contributions
- Markdown parsing/writing for camp/session/event files
- JSON read/write for favorites, signups, user profile

### 5. Gaps & Decisions Needed

- **Camp Contribution Workflow:** Camps are saved directly into the public catalog. No moderation or PR required for MVP.
- **Cloud Provider Support:** Support Google Drive, OneDrive, and Dropbox. Phase rollout: start with Google Drive, add others post-MVP.
- **User Data Privacy:** All personal data is saved in the user's cloud. Clear messaging: "Your data is private and not stored by us. If you delete your files, you will lose your data."
- **Drive Folder Management:** If the user deletes or moves the app folder/files in Drive, the app detects this and prompts the user to relink or recreate the folder.
- **Token Refresh & Permission Loss:** Ensure Drive API tokens are refreshed as needed, and handle permission loss or token expiration gracefully.
- **Offline Support:** Editing requires online access. Viewing is allowed from last loaded data. Show a clear error message when offline: "You are offline. Editing is disabled. Viewing is from your last session."
- **Error Handling:** Use standard error messages and UI alerts for cloud API errors, permission issues, and quota limits. Guide the user to re-authenticate or resolve issues as needed.

### 6. Next Steps

1. Confirm decisions on the above gaps.
2. Implement Google Drive OAuth2 login and folder selection, with onboarding and clear user messaging about data storage location and privacy.
3. Build personal data sync (favorites, summer plan, signups) to user’s cloud, including schema versioning and Drive folder management.
4. Integrate public camp catalog loading and contribution flow.
5. Add UI for favorites (star), filtering, and “Add Camp” with auto-favorite.
6. Implement robust error handling for Drive API errors, token refresh, permission loss, and offline scenarios.
7. Test end-to-end flow for new and returning users, including onboarding, Drive folder management, and error handling.
