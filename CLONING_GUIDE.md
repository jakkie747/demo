
# How to Clone This App for a New School: A Step-by-Step Guide

This guide provides detailed instructions on how to create a complete copy of this application for a new school. It covers everything from creating the backend in Firebase to customizing the branding. Follow these steps carefully to ensure a successful setup.

---

## **Part 1: Create a New Firebase Project**

Every new school needs its own separate, secure backend. This is the most important part of the process.

1.  **Go to the Firebase Console:**
    *   Open your web browser and go to [https://console.firebase.google.com/](https://console.firebase.google.com/).
    *   Log in with your Google account if you haven't already.

2.  **Add a New Project:**
    *   Click the **"Add project"** button.
    *   Give your project a unique name. This should be something related to the new school (e.g., "SunnySide-Preschool-App").
    *   Click **"Continue"**.
    *   You can disable Google Analytics for this project if you wish. It's not required for the app to function.
    *   Click **"Create project"** and wait for it to finish.

3.  **Enable Required Firebase Services:**
    You need to "turn on" the services your new app will use. From the main menu on the left side of your new Firebase project's dashboard:

    *   **Authentication:**
        *   Click on **Build > Authentication**.
        *   Click the **"Get started"** button.
        *   In the list of providers, select **"Email/Password"** and enable it. Click **"Save"**.

    *   **Firestore Database:**
        *   Click on **Build > Firestore Database**.
        *   Click the **"Create database"** button.
        *   Choose **"Start in production mode"**.
        *   Click **"Next"**.
        *   Select a location for your database (choose the one closest to the school's location).
        *   Click **"Enable"**.

    *   **Storage:**
        *   Click on **Build > Storage**.
        *   Click the **"Get started"** button.
        *   Choose **"Start in production mode"**.
        *   Click **"Next"** and then **"Done"**.

---

## **Part 2: Connect Your Code to the New Firebase Project**

Now, you'll tell your copied code to use the new Firebase project you just created.

1.  **Find Your Firebase Credentials:**
    *   In your new Firebase project's dashboard, click the **Gear icon** (Project settings) at the top of the left menu.
    *   In the "General" tab, scroll down to the "Your apps" section.
    *   Click the **Web icon** (`</>`) to create a new web app.
    *   Give the app a nickname (e.g., "SunnySide Web App") and click **"Register app"**.
    *   You will now see a `firebaseConfig` object on the screen. **Do not close this page.** It contains the unique keys for your new project.

2.  **Update the Code:**
    *   In your code editor, open the file: `src/lib/firebase.ts`.
    *   Carefully copy each key and value from the `firebaseConfig` object in your browser (e.g., `apiKey`, `authDomain`, etc.) and paste it into the corresponding placeholder in the `src/lib/firebase.ts` file.
    *   **Important:** After pasting your credentials, your `firebaseConfig` object in the code should look something like this, but with your own unique values:
        ```javascript
        export const firebaseConfig = {
          apiKey: "AIzaSyB...your...unique...key",
          authDomain: "sunnyside-preschool-app.firebaseapp.com",
          projectId: "sunnyside-preschool-app",
          storageBucket: "sunnyside-preschool-app.appspot.com",
          messagingSenderId: "123456789012",
          appId: "1:123456789012:web:a1b2c3d4e5f6g7h8i9j0"
        };
        ```

---

## **Part 3: Configure Security and Storage**

These steps are crucial for ensuring your app is secure and that file uploads will work correctly.

1.  **Set Firestore Security Rules:**
    *   Go back to your **Firestore Database** page in the Firebase Console.
    *   Click the **"Rules"** tab at the top.
    *   Copy the entire content from the `firestore.rules` file in this project.
    *   Paste it into the editor in the Firebase Console, completely replacing the default rules.
    *   Click **"Publish"**.

2.  **Set Storage Security Rules:**
    *   Go to the **Storage** page in the Firebase Console.
    *   Click the **"Rules"** tab at the top.
    *   Copy the entire content from the `storage.rules` file in this project.
    *   Paste it into the editor, replacing the default rules.
    *   Click **"Publish"**.

3.  **Configure Storage for File Uploads (CORS - Very Important):**
    This step allows the website to upload images and documents to your Firebase Storage. It requires using the command line.

    *   Go to the [Google Cloud Shell](https://console.cloud.google.com/).
    *   Make sure your new Firebase project is selected at the top of the page.
    *   When the command line terminal appears at the bottom of the screen, run the following command exactly as it is and press Enter:
        ```bash
        echo '[{"origin": ["*"], "method": ["GET", "PUT", "POST"], "responseHeader": ["Content-Type"], "maxAgeSeconds": 3600}]' > cors.json
        ```
    *   Now, run the second command. **You must replace `your-new-project-id` with your actual new Firebase Project ID** (e.g., `sunnyside-preschool-app`).
        ```bash
        gsutil cors set cors.json gs://your-new-project-id.appspot.com
        ```
    *   This command configures your storage bucket to accept uploads from your website.

---

## **Part 4: Customize App Branding and Content**

Now you can change the app's appearance for the new school.

1.  **Change the Colors:**
    *   Open `src/app/globals.css`.
    *   At the top, you'll see a `:root` block with CSS variables for colors (e.g., `--primary`, `--accent`). You can change the HSL values here to match the new school's brand colors.
        *   `--primary`: The main brand color (e.g., buttons, titles).
        *   `--accent`: The highlight color.

2.  **Change the Fonts:**
    *   The app uses Google Fonts. To change them, open `src/app/layout.tsx`.
    *   Find the `<link>` tag that imports fonts from `fonts.googleapis.com`. You can change the `family=` parameter to any other fonts available on Google Fonts.
    *   Then, open `tailwind.config.ts` and update the `fontFamily` section to use your new font names.

3.  **Update the Logo:**
    *   Replace the SVG code inside `src/components/Logo.tsx` with the new school's logo SVG.

4.  **Update Text Content:**
    *   All user-facing text is in `src/lib/translations.ts`.
    *   Go through this file and change all instances of "Blinkogies" to the new school's name.
    *   You can also adjust any other default text here to fit the new school's tone and messaging.

5.  **Update Environment Variables:**
    *   Open the `.env` file. If you plan to use any external services (like the Stitch payment gateway), you must update the API keys here with the new school's keys.

---

## **Part 5: Deployment**

Once all the changes are made, you are ready to deploy the new app. The process will be the same as for this app, but it will now be connected to your new Firebase project, creating a completely separate and independent application for the new school.

You've now successfully cloned the application!
