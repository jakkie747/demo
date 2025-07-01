
# Master Prompt: Build a Preschool Family Hub App

Hello! I need your help to build a complete web application from scratch. This app will be a "Family Hub" for a preschool, designed to connect parents, teachers, and administrators.

Please use the following tech stack: **Next.js with the App Router, React, TypeScript, Tailwind CSS, and ShadCN UI components**. For the backend, please use **Firebase (Authentication, Firestore, Storage, and Functions)**. For any AI features, please use **Genkit**.

Here are the detailed requirements:

---

## **1. Core Concept & Style**

The app should be called **"Preschool Family Hub"**. It needs to be professional, secure, and trustworthy, but also warm, cheerful, and inviting for parents.

- **Primary Color**: Cheerful light blue (`#59ABEF`)
- **Background Color**: Very light blue (`#E5F6FE`)
- **Accent Color**: Warm yellow (`#FDD764`)
- **Fonts**: Use "Lilita One" for headlines and "Poppins" for body text (from Google Fonts).
- **UI**: Use ShadCN UI components throughout the app for a modern and consistent look.

---

## **2. Public-Facing Features (No Login Required)**

These pages should be accessible to anyone visiting the site.

- **Homepage**: A welcoming page that introduces the school. It should feature a headline, a brief description, and prominent buttons to "Register Your Child" and "View Upcoming Events". It should also display the 3 most recent items from the Photo Gallery.
- **Child Registration Page (`/register`)**: A comprehensive form for parents to enroll a new child. It must capture:
    - **Child's Info**: Name, Date of Birth, Gender, optional Photo.
    - **Parent's Info**: Name, Email, Phone Number, Physical Address.
    - **Emergency Info**: Emergency Contact Name & Phone, Medical Conditions/Allergies.
    - **Other Info**: Previous preschool experience, and a field for additional notes.
- **Events Page (`/events`)**: Displays a list of all upcoming school events. Each event should be on a card with a title, description, date, and an image.
- **Photo Gallery Page (`/gallery`)**: Displays a grid of photos from school activities. Each photo should have a title and a short description.
- **Documents Page (`/documents`)**: A page where parents can view and download important files like newsletters or calendars. Each document should have a title and a "Download" button.
- **Multi-language Support**: The app must support both English and Afrikaans. Include a language toggle button in the header. All text should come from a central translation file.

---

## **3. Parent-Specific Features (Requires Login)**

- **Parent Login & Registration (`/parent-login`, `/parent-register`)**:
    - Parents must be able to create an account using an email and password.
    - **Crucially**, their login email must be the same one they used on the main child registration form to link them to their child's profile.
    - Provide a secure login page.
- **Parent Dashboard (`/parent/dashboard`)**:
    - After logging in, parents are taken here.
    - This page should display the daily reports for their child (or children).
    - If no child is linked to their email, it should show a message guiding them to contact the school.
    - Each daily report card should clearly show the **Date, Mood, Activities, Meals, Naps, an optional Photo, and any special notes from the teacher.**

---

## **4. Administrator Features (Requires Secure Admin Login)**

The admin section should be accessed via `/admin`. It should have a dedicated sidebar for navigation.

- **Secure Admin Login**: A separate login page for teachers and admins.
- **Admin Dashboard (`/admin/dashboard`)**: The main landing page after login. It should show key stats at a glance (e.g., total number of children, upcoming events) and have quick-link cards to all management pages.
- **Manage Children (`/admin/dashboard/children`)**:
    - A table displaying all registered children with their key details (photo, name, age, parent info).
    - Ability to **Import** children from a CSV file.
    - Ability to **Export** all children's data to a CSV file.
    - Ability to **Delete** a child's profile.
- **Manage Daily Reports (`/admin/dashboard/children/[childId]/reports`)**:
    - From the children list, an admin must be able to click on a child to manage their reports.
    - A form to **Create** a new daily report for that child (Date, Mood, Activities, Meals, Naps, Photo, Notes).
    - A list of past reports for that child, with options to **Edit** or **Delete** them.
- **Manage Events, Gallery, and Documents**:
    - Create three separate pages for managing Events, Gallery items, and Documents.
    - Each page should have a form on one side to **Create/Edit** items (Title, Date, Description, Image/File Upload) and a table on the other side to display existing items with **Edit** and **Delete** buttons.
- **Manage Teachers (`/admin/dashboard/teachers`)**:
    - A page that lists all registered teachers/admins.
    - **Important**: New teachers should be added via the Firebase Authentication console for security. This page should explain that.
    - For existing teachers, admins should be able to **Edit** their profile details (Name, Contact Info, Photo) and **Delete** them (which must also delete their Firebase Auth account).
- **Compose Message (`/admin/dashboard/notifications`)**:
    - A form to write a message (Subject and Body).
    - A button to "Send via Email" which opens the user's default email client with all parent emails pre-filled in the BCC field.
    - A button to "Send via WhatsApp" which opens WhatsApp with the message pre-filled.
- **AI Creative Assistant (`/admin/dashboard/ai-assistant`)**:
    - Use **Genkit** for this feature.
    - Provide two buttons: "Generate Story Starters" and "Generate Activity Ideas".
    - When clicked, the AI should generate and display 5 unique, age-appropriate ideas in cards.
- **Settings (`/admin/dashboard/settings`)**:
    - A page where the logged-in admin can change their own password. It should require them to enter their current password and a new password.

---

## **5. Backend & Database (Firebase)**

- **Authentication**: Use Firebase Auth for both Parent and Admin logins.
- **Firestore**: Create the following collections:
    - `children`: To store all child registration data.
    - `daily_reports`: To store the daily reports linked to a child's ID.
    - `events`: To store school events.
    - `activities`: To store the gallery photos and descriptions.
    - `documents`: To store info about uploaded files.
    - `teachers`: To store teacher profile information (linked by their Auth UID).
- **Storage**: Use Firebase Storage to host all uploaded images and documents.
- **Functions**: Create a Firebase Function (`deleteTeacherUser`) that allows a logged-in admin to delete another teacher's Firebase Authentication account and their Firestore document simultaneously.

Please start by setting up the project structure, installing the necessary dependencies, and then begin building out the features, starting with the public pages. Thank you!
