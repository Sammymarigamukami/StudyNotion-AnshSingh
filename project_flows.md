# 📂 StudyNotion — Complete Project Flows Reference Guide

This document maps out **every single operational flow** implemented in StudyNotion. Each flow is broken down sequentially from the **User Interface (UI) trigger**, through **Redux state dispatches**, **Axios API connector calls**, **Express routes & middlewares**, **Prisma controller queries**, and finally **Database operations & External integrations**.

---

## Table of Contents
1. [User Authentication & Access Control Flows](#1-user-authentication--access-control-flows)
   - Signup OTP Flow
   - Registration (SignUp) Flow
   - Login Flow
   - Logout Flow
   - Password Change Flow
   - Password Reset Token Generation Flow
   - Password Reset Execution Flow
2. [Profile & Settings Management Flows](#2-profile--settings-management-flows)
   - Update Display Picture Flow
   - Edit Profile Information Flow
   - Account Deletion Flow
3. [Instructor Course Creation & Management Flows](#3-instructor-course-creation--management-flows)
   - Dashboard Analytics & Revenue Summary Flow
   - Course Creation Step 1: Base Details Form
   - Course Creation Step 2: Section & SubSection Builder
   - Course Creation Step 3: Publish Settings
   - Delete Course Flow
4. [Shopping Cart & Checkout Flows](#4-shopping-cart--checkout-flows)
   - Add/Remove Items in Cart
   - Course Purchase & Checkout Flow (Razorpay)
5. [Student Course Consumption & Progress Tracking Flows](#5-student-course-consumption--progress-tracking-flows)
   - Video Playback & Lecture Consumption Flow
   - Progress Completion Tracker Flow
   - Ratings & Review Creation Flow
6. [Admin Platform Management Flows](#6-admin-platform-management-flows)
   - Create Category Flow
7. [Public Catalog & User Engagement Flows](#7-public-catalog--user-engagement-flows)
   - Category Catalog Filtering Page Flow
   - Contact Us Form Submission Flow

---

## 1. User Authentication & Access Control Flows

### 1.1 Signup OTP Flow
*   **UI Trigger:** User enters registration details on `/signup` and clicks the "Send OTP" button.
*   **Redux Dispatch:** Dispatches `setSignupData(formData)` (to preserve user entries in the store during OTP verification).
*   **API Client Action:** Calls `apiConnector("POST", SENDOTP_API, { email })`.
*   **Express Route:** Matches `POST /api/v1/auth/sendotp`.
*   **Backend Controller (`Auth.sendotp`):**
    1.  Queries PostgreSQL: `prisma.user.findUnique({ where: { email } })`. If exists, returns `401` ("User is Already Registered").
    2.  Generates a 6-digit numeric OTP using the `otp-generator` library.
    3.  Runs a verification loop against the database (`prisma.oTP.findFirst({ where: { otp } })`) to ensure the generated OTP is unique.
    4.  Calls the `sendVerificationEmail` helper which triggers Nodemailer to email the code to the user using the `emailVerificationTemplate`.
    5.  Saves the OTP: `prisma.oTP.create({ data: { email, otp } })`.
*   **Database Operation:** Writes a new record to the `OTP` table with an indexed email address.
*   **UI Result:** Redirects user to `/verify-email` rendering a 6-digit OTP input interface.

### 1.2 Registration (SignUp) Flow
*   **UI Trigger:** User enters the 6-digit code on the `/verify-email` route and submits.
*   **API Client Action:** Calls `apiConnector("POST", SIGNUP_API, { ...signupData, otp })`.
*   **Express Route:** Matches `POST /api/v1/auth/signup`.
*   **Backend Controller (`Auth.signup`):**
    1.  Validates that all mandatory fields are present and matches `password` against `confirmPassword`.
    2.  Queries the most recent OTP for the email: `prisma.oTP.findMany({ where: { email }, orderBy: { createdAt: "desc" }, take: 1 })`.
    3.  Asserts that the OTP matches and was created within the last 5 minutes.
    4.  Hashes the password with `bcryptjs` (10 rounds).
    5.  Determines initial approval status (`approved: false` if user role is `Instructor`, otherwise `true`).
    6.  Performs a nested transactional write: creates a `User` record and its related empty `Profile` record simultaneously.
*   **Database Operation:** `User` table insert linked to a `Profile` table insert with a cascading deletion policy.
*   **UI Result:** Redirects user to `/login` with a success toast.

### 1.3 Login Flow
*   **UI Trigger:** User enters credentials on `/login` and clicks submit.
*   **Redux Dispatch:** Sets `auth.loading` to `true`.
*   **API Client Action:** Calls `apiConnector("POST", LOGIN_API, { email, password })`.
*   **Express Route:** Matches `POST /api/v1/auth/login`.
*   **Backend Controller (`Auth.login`):**
    1.  Checks email and password availability.
    2.  Queries database: `prisma.user.findUnique({ where: { email }, include: { profile: true } })`.
    3.  Compares passwords: `bcrypt.compare(password, user.password)`.
    4.  Signs JWT payload containing `{ email, id, accountType }` with `expiresIn: "24h"`.
    5.  Sets the HTTPOnly cookie: `token` with a 3-day cookie expiration.
    6.  Transforms the `profile` row to match the Mongoose-compatible response schema (`additionalDetails`).
    7.  Removes the password hash from the JSON response before returning the payload.
*   **Redux Dispatch:** Saves the token in `auth.token`, updates the user object in `profile.user`, and stores both in `localStorage`.
*   **UI Result:** Redirects to `/dashboard/my-profile`.

### 1.4 Logout Flow
*   **UI Trigger:** User clicks "Logout" in the Navbar dropdown or Sidebar.
*   **Redux Dispatch:** Clears state variables: `dispatch(setToken(null))`, `dispatch(setUser(null))`, and `dispatch(resetCart())`.
*   **Local Storage Action:** Runs `localStorage.removeItem("token")`, `localStorage.removeItem("user")`, and `localStorage.removeItem("cart")`.
*   **UI Result:** Redirects to the homepage (`/`) and closes any active sidebar navigation.

### 1.5 Password Change Flow (Authenticated)
*   **UI Trigger:** User goes to Dashboard Settings, fills "Change Password" form, and clicks update.
*   **API Client Action:** Calls `apiConnector("POST", CHANGE_PASSWORD_API, formData, { Authorization: `Bearer ${token}` })`.
*   **Express Route:** Matches `POST /api/v1/auth/changepassword` guarded by the `auth` verification middleware.
*   **Backend Controller (`Auth.changePassword`):**
    1.  Retrieves `req.user.id` from the decoded token and queries: `prisma.user.findUnique({ where: { id: req.user.id } })`.
    2.  Compares the input current password with the hashed password from the database.
    3.  Encrypts the new password and updates the database: `prisma.user.update({ where: { id: req.user.id }, data: { password: encryptedPassword } })`.
    4.  Triggers Nodemailer to send a password update email.
*   **UI Result:** Shows a success notification and clears form fields.

### 1.6 Password Reset Token Flow (Forgot Password)
*   **UI Trigger:** User clicks "Forgot Password" on `/login`, enters their email, and clicks reset.
*   **API Client Action:** Calls `apiConnector("POST", RESET_PASSWORD_TOKEN_API, { email })`.
*   **Express Route:** Matches `POST /api/v1/auth/reset-password-token`.
*   **Backend Controller (`ResetPassword.resetPasswordToken`):**
    1.  Verifies if the email exists in the `User` table.
    2.  Generates a random token string: `crypto.randomBytes(20).toString("hex")`.
    3.  Saves the token and expiry date (1-hour limit) to the user's record.
    4.  Sends an email containing the URL: `http://localhost:3000/update-password/${token}`.
*   **UI Result:** Displays a message prompting the user to check their email inbox.

### 1.7 Password Reset Execution Flow
*   **UI Trigger:** User opens the email link, enters a new password on `/update-password/:token`, and submits.
*   **API Client Action:** Calls `apiConnector("POST", RESET_PASSWORD_API, { password, confirmPassword, token })`.
*   **Express Route:** Matches `POST /api/v1/auth/reset-password`.
*   **Backend Controller (`ResetPassword.resetPassword`):**
    1.  Queries user: `prisma.user.findFirst({ where: { token } })`.
    2.  Checks if the token has expired: `resetPasswordExpires < new Date()`.
    3.  Hashes the new password and updates the user's password field, clearing the `token` and `resetPasswordExpires` values.
*   **UI Result:** Redirects user to `/login` with a success toast.

---

## 2. Profile & Settings Management Flows

### 2.1 Update Display Picture Flow
*   **UI Trigger:** User drops or selects an image in settings and clicks upload.
*   **API Client Action:** Sends file payload via `FormData` to `apiConnector("PUT", UPDATE_DISPLAY_PICTURE_API, formData, headers)`.
*   **Express Route:** Matches `PUT /api/v1/profile/updateDisplayPicture` guarded by the `auth` middleware.
*   **Backend Controller (`Profile.updateDisplayPicture`):**
    1.  Extracts the file using `req.files.displayPicture`.
    2.  Uploads the file to Cloudinary under the configured folder name.
    3.  Updates the user's avatar path: `prisma.user.update({ where: { id: req.user.id }, data: { image: uploadDetails.secure_url } })`.
*   **Redux Dispatch:** Updates user state: `dispatch(setUser(updatedUserObject))` and syncs with `localStorage`.
*   **UI Result:** The Navbar and Profile displays update with the new user avatar.

### 2.2 Edit Profile Information Flow
*   **UI Trigger:** User changes details (e.g., gender, DOB, contact details, bio) and clicks save in Settings.
*   **API Client Action:** Calls `apiConnector("PUT", UPDATE_PROFILE_API, formData)`.
*   **Express Route:** Matches `PUT /api/v1/profile/updateProfile`.
*   **Backend Controller (`Profile.updateProfile`):**
    1.  Updates profile details: `prisma.profile.update({ where: { userId: req.user.id }, data: { dateOfBirth, about, contactNumber, gender } })`.
    2.  Updates corresponding properties in the `User` table (`firstName`, `lastName`).
    3.  Queries the complete updated user record, including the profile relation, and parses it for response.
*   **Redux Dispatch:** Dispatches `setUser(updatedUserObject)`.
*   **UI Result:** Settings panel renders updated fields.

### 2.3 Account Deletion Flow
*   **UI Trigger:** User clicks "Delete Account" and confirms on the warning modal.
*   **API Client Action:** Calls `apiConnector("DELETE", DELETE_PROFILE_API)`.
*   **Express Route:** Matches `DELETE /api/v1/profile/deleteProfile`.
*   **Backend Controller (`Profile.deleteAccount`):**
    1.  Retrieves `userId` from token payload.
    2.  Queries user: `prisma.user.findUnique({ where: { id: userId } })`.
    3.  Deletes the user record: `prisma.user.delete({ where: { id: userId } })`.
    4.  *Database Cascading:* The foreign key relations (`userId` on `Profile`, `CourseProgress`, `RatingAndReview`) handle the deletion of associated profiles, progress records, and reviews automatically.
*   **Redux Dispatch:** Clears local credentials via `dispatch(logout)`.
*   **UI Result:** Redirects user to the homepage.

---

## 3. Instructor Course Creation & Management Flows

### 3.1 Dashboard Analytics Flow
*   **UI Trigger:** Instructor navigates to the `/dashboard/instructor` route.
*   **API Client Action:** Calls `apiConnector("GET", GET_INSTRUCTOR_DATA_API)`.
*   **Express Route:** Matches `GET /api/v1/profile/instructorDashboard` guarded by `auth` and `isInstructor`.
*   **Backend Controller (`Profile.instructorDashboard`):**
    1.  Queries all courses matching the instructor: `prisma.course.findMany({ where: { instructorId: req.user.id }, include: { enrolledStudents: true } })`.
    2.  Aggregates metrics for each course: total enrolled students and generated revenue (calculated as `enrolledStudents.length * price`).
    3.  Returns a summary object mapping course names to student counts and earnings.
*   **UI Result:** Renders interactive pie charts using Chart.js to show student distribution and course revenue.

### 3.2 Course Creation Step 1: Base Details Form
*   **UI Trigger:** Instructor fills out Step 1 form fields, uploads a thumbnail, and clicks "Next".
*   **API Client Action:** Submits payload using `FormData` to `apiConnector("POST", CREATE_COURSE_API, formData)`.
*   **Express Route:** Matches `POST /api/v1/course/createCourse` guarded by `auth` and `isInstructor`.
*   **Backend Controller (`Course.createCourse`):**
    1.  Validates that fields (name, description, price, category) are present.
    2.  Uploads the thumbnail to Cloudinary, saving the secure URL.
    3.  Inserts the course record with `status: Draft`:
        ```javascript
        prisma.course.create({
            data: { courseName, courseDescription, price, thumbnail: thumbnailImage.secure_url, instructorId, categoryId }
        })
        ```
*   **Redux Dispatch:** Dispatches `setCourse(createdCourseObject)` and updates wizard step via `dispatch(setStep(2))`.
*   **UI Result:** Interface transitions to the Step 2 Course Builder.

### 3.3 Course Creation Step 2: Section & SubSection Builder
This step manages course curriculum structure using two sub-flows:

#### Flow A: Managing Course Sections
*   **UI Action:** Instructor clicks "Create Section" or edits/deletes an existing section name.
*   **API Client Action:** Calls `apiConnector("POST", CREATE_SECTION_API / UPDATE_SECTION_API / DELETE_SECTION_API, body)`.
*   **Express Route:** Matches `/api/v1/course/addSection`, `/api/v1/course/updateSection`, or `/api/v1/course/deleteSection`.
*   **Backend controllers (`section.js`):**
    *   *Create:* Saves `prisma.section.create({ data: { sectionName, courseId } })`.
    *   *Update:* Updates section title: `prisma.section.update({ where: { id: sectionId }, data: { sectionName } })`.
    *   *Delete:* Removes the section: `prisma.section.delete({ where: { id: sectionId } })` (cascading to delete related subsections).
*   **Database Query Response:** Returns the complete updated course model hierarchy.
*   **Redux Dispatch:** Updates the course state: `dispatch(setCourse(updatedCourseObject))`.

#### Flow B: Managing SubSections (Lectures)
*   **UI Action:** Instructor clicks "Add Lecture", inputs title and description, drops a video file, and clicks save.
*   **API Client Action:** Sends video payload via `FormData` to `/api/v1/course/addSubSection`.
*   **Backend Controller (`Subsection.createSubSection`):**
    1.  Extracts the file using `req.files.video`.
    2.  Uploads the file to Cloudinary with `resource_type: "auto"` to accept video payloads.
    3.  Cloudinary returns the secure CDN link and the video runtime duration.
    4.  Saves the subsection: `prisma.subSection.create({ data: { title, description, timeDuration, videoUrl, sectionId } })`.
    5.  Returns the updated course curriculum hierarchy.
*   **Redux Dispatch:** Updates course state: `dispatch(setCourse(updatedCourseObject))`.

### 3.4 Course Creation Step 3: Publish Settings
*   **UI Trigger:** Instructor toggles visibility status (Draft or Published) and clicks save.
*   **API Client Action:** Calls `apiConnector("POST", EDIT_COURSE_API, { courseId, status: "Published" })`.
*   **Express Route:** Matches `POST /api/v1/course/editCourse`.
*   **Backend Controller (`Course.editCourse`):**
    *   Updates the course status: `prisma.course.update({ where: { id: courseId }, data: { status: "Published" } })`.
*   **Redux Dispatch:** Clears editing state: `dispatch(setStep(1))`, `dispatch(setCourse(null))`, `dispatch(setEditCourse(false))`.
*   **UI Result:** Redirects the instructor to their course listing table `/dashboard/my-courses`.

### 3.5 Delete Course Flow
*   **UI Trigger:** Instructor clicks the delete icon next to a course and confirms.
*   **API Client Action:** Calls `apiConnector("DELETE", DELETE_COURSE_API, { courseId })`.
*   **Express Route:** Matches `DELETE /api/v1/course/deleteCourse`.
*   **Backend Controller (`Course.deleteCourse`):**
    1.  Queries the course by ID: `prisma.course.findUnique({ where: { id: courseId } })`.
    2.  Deletes the course: `prisma.course.delete({ where: { id: courseId } })`.
    3.  *Database Cascading:* Deletes associated sections, subsections, and student progress records automatically.
*   **UI Result:** Renders the updated course list, removing the deleted course row from the UI.

---

## 4. Shopping Cart & Checkout Flows

### 4.1 Add/Remove Items in Cart
*   **UI Trigger:** Student clicks "Add to Cart" or "Remove" on a course details page.
*   **Redux Dispatch:**
    *   *Add:* Dispatches `addToCart(courseObject)`. Checks for duplicates. If unique, pushes the item to the cart array and updates totals.
    *   *Remove:* Dispatches `removeFromCart(courseId)`. Filters out the course ID and updates totals.
*   **Local Storage Action:** Redux reducers update and sync the cart array, total cost, and item count keys in `localStorage`.
*   **UI Result:** The cart icon indicator in the Navbar updates.

### 4.2 Course Purchase & Checkout Flow (Razorpay)
*   **UI Trigger:** Student clicks "Buy Now" on a course details page or clicks "Checkout" in their Cart.
*   **Axios / API Action:** Client calls `apiConnector("POST", CAPTURE_PAYMENT_API, { courses: [courseId] })`.
*   **Backend Controller (`Payments.capturePayment`):**
    1.  Sums up course prices.
    2.  Checks if the user is already enrolled in any of the courses.
    3.  Initiates the order with Razorpay: `instance.orders.create({ amount: totalAmount * 100, currency: "INR", receipt })`.
    4.  Returns the order details (order ID, amount, currency) to the client.
*   **UI Action:** Client receives the order details, loads the Razorpay checkout script, and opens the payment modal.
*   **Razorpay Action:** Student enters payment details and receives verification metadata (payment ID, order ID, signature) upon success.
*   **Verify API Action:** Client calls `apiConnector("POST", VERIFY_PAYMENT_API, metadata)`.
*   **Backend Controller (`Payments.verifyPayment`):**
    1.  Computes the expected signature: `HMAC-SHA256(order_id + "|" + payment_id, process.env.RAZORPAY_SECRET)`.
    2.  If it matches, updates the database:
        ```javascript
        prisma.course.update({
            where: { id: courseId },
            data: { enrolledStudents: { connect: { id: userId } } }
        })
        ```
    3.  Triggers Nodemailer to send payment receipt and enrollment confirmation emails.
*   **Redux Dispatch:** Clears checkout state: `dispatch(resetCart())` and clears local storage.
*   **UI Result:** Redirects user to `/dashboard/enrolled-courses`.

---

## 5. Student Course Consumption & Progress Tracking Flows

### 5.1 Video Playback & Sidebar Navigation Flow
*   **UI Trigger:** Student clicks a course on `/dashboard/enrolled-courses`.
*   **API Client Action:** Calls `apiConnector("POST", GET_FULL_COURSE_DETAILS_API, { courseId })`.
*   **Express Route:** Matches `POST /api/v1/course/getFullCourseDetails`.
*   **Backend Controller (`Course.getFullCourseDetails`):**
    *   Queries the course hierarchy including sections, subsections, and the user's completed lectures: `prisma.courseProgress.findUnique({ where: { courseId_userId: { courseId, userId } } })`.
*   **Redux Dispatch:** Saves progress data: `dispatch(setEntireCourseData(course))`, `dispatch(setCompletedLectures(completedVideos))`.
*   **UI Result:** Renders the video player view (`/view-course/:courseId`) with sidebar navigation showing sections and video lecture links.

### 5.2 Progress Completion Tracker Flow
*   **UI Trigger:** Student clicks "Mark as Completed" while watching a video lecture.
*   **API Client Action:** Calls `apiConnector("POST", UPDATE_COURSE_PROGRESS_API, { courseId, subsectionId })`.
*   **Express Route:** Matches `POST /api/v1/course/updateCourseProgress`.
*   **Backend Controller (`courseProgress.updateCourseProgress`):**
    1.  Queries student progress: `prisma.courseProgress.findUnique({ where: { courseId_userId } })`.
    2.  Updates progress by linking the subsection ID to the completed videos relation:
        ```javascript
        prisma.courseProgress.update({
            where: { id: progressId },
            data: { completedVideos: { connect: { id: subsectionId } } }
        })
        ```
    3.  Returns the updated list of completed video IDs.
*   **Redux Dispatch:** Updates progress state: `dispatch(updateCompletedLectures(subsectionId))`.
*   **UI Result:** Checkmarks in the course outline sidebar are filled, and the progress bar updates.

### 5.3 Ratings & Review Creation Flow
*   **UI Trigger:** Student clicks "Add Review", rates the course, enters text feedback, and submits the modal.
*   **API Client Action:** Calls `apiConnector("POST", CREATE_RATING_API, { courseId, rating, review })`.
*   **Express Route:** Matches `POST /api/v1/course/createRating`.
*   **Backend Controller (`RatingAndReview.createRating`):**
    1.  Verifies the student is enrolled in the course.
    2.  Checks for existing reviews using the compound unique constraint: `@@unique([userId, courseId])`.
    3.  Creates the review: `prisma.ratingAndReview.create({ data: { rating, review, userId, courseId } })`.
*   **UI Result:** Closes the modal and shows a success toast.

---

## 6. Admin Platform Management Flows

### 6.1 Create Category Flow
*   **UI Trigger:** Admin enters category details in their dashboard panel and submits.
*   **API Client Action:** Calls `apiConnector("POST", CREATE_CATEGORY_API, { name, description })`.
*   **Express Route:** Matches `POST /api/v1/course/createCategory` guarded by `auth` and `isAdmin`.
*   **Backend Controller (`Category.createCategory`):**
    *   Saves the new category: `prisma.category.create({ data: { name, description } })`.
*   **UI Result:** Clears form fields and updates the category list dropdown in the Navbar.

---

## 7. Public Catalog & User Engagement Flows

### 7.1 Category Catalog Filtering Page Flow
*   **UI Trigger:** Visitor hovers over the Navbar dropdown and clicks a category link (e.g., "Web Development").
*   **API Client Action:** Calls `apiConnector("POST", GET_CATALOG_PAGE_DATA_API, { categoryId })`.
*   **Express Route:** Matches `POST /api/v1/course/getCategoryPageDetails`.
*   **Backend Controller (`Category.categoryPageDetails`):**
    1.  Queries the selected category's courses: `prisma.category.findUnique({ where: { id: categoryId }, include: { courses: { include: { instructor: true, ratingsAndReviews: true } } } })`.
    2.  Queries a random different category's courses to provide recommendations.
    3.  Queries the top 10 most-purchased courses across all categories based on student enrollment count.
*   **UI Result:** Renders `/catalog/:categoryName` with slides displaying category courses and recommendations.

### 7.2 Contact Us Form Submission Flow
*   **UI Trigger:** User fills out the form on `/contact` and clicks send.
*   **API Client Action:** Calls `apiConnector("POST", CONTACT_US_API, formData)`.
*   **Express Route:** Matches `POST /api/v1/reach/contact`.
*   **Backend Controller (`ContactUs.contactUsController`):**
    1.  Extracts user details (name, email, phone, message).
    2.  Sends an email confirmation to the user acknowledging receipt of their message.
    3.  Sends a notification email to the administrator containing the user's message payload.
*   **UI Result:** Shows a success toast and resets the contact form fields.
