# CloudAdmin Suite

I have attached a ZIP file containing my existing application.

I want you to clone the application exactly as it is, preserving the UI, pages, components, routing, colors, animations, and functionality, then connect it to Lovable Cloud and build a complete backend with a secure Admin Panel.

Requirements

1. Clone the Application

 Extract the attached ZIP file.

 Recreate the entire application without changing the design.

 Keep all pages, layouts, animations, icons, and responsive behavior identical.

2. Connect to Lovable Cloud

 Set up the project to use Lovable Cloud.

 Configure the database.

 Configure authentication.

 Configure storage if needed.

 Configure real-time updates where appropriate.

3. Authentication

Create secure authentication with three roles:

 User

 Admin

 Super Admin

Only authorized users should access the Admin Dashboard.

4. Build a Complete Admin Panel

Create a professional Admin Dashboard with:

 Dashboard

 Users Management

 Referrals

 Deposits

 Withdrawals

 Transactions

 Investment Plans

 Pricing Settings

 Bank Account Settings

 Notifications

 Push Notifications

 Reports

 Audit Logs

 System Settings

5. Admin Features

Allow the Admin or Super Admin (according to permissions) to:

 View all users

 Search users

 Suspend users

 Activate users

 Delete users

 Approve deposits

 Reject deposits

 Approve withdrawals

 Reject withdrawals

 Generate withdrawal codes

 Edit user balances

 View transaction history

6. Pricing Management

Create a Pricing Settings page where I can edit:

 Registration fee

 Deposit amount

 Investment plan prices

 Referral bonus

 Welcome bonus

 Task rewards

 Withdrawal fee

 Minimum withdrawal amount

 Maximum withdrawal amount

Changes should update immediately throughout the app without editing the code.

7. Bank Settings

Create a Bank Settings page where I can change:

 Bank Name

 Account Name

 Account Number

 Payment Instructions

 QR Code (optional)

These details should automatically appear on the user payment page.

8. Investment Plans

Allow me to:

 Add plans

 Edit plans

 Delete plans

 Activate or deactivate plans

Each plan should include:

 Name

 Price

 Daily income

 Duration

 Status

9. Notifications

Allow Admin to:

 Send notifications to all users

 Send notifications to individual users

 Send announcements

 Send maintenance messages

10. Security

Implement role-based access control (RBAC):

 User

 Admin

 Super Admin

Only Super Admin can:

 Create Admins

 Delete Admins

 Change system settings

 Change bank information

 Change pricing

 View audit logs

11. Audit Log

Record every important action:

 Login

 Deposit approval

 Withdrawal approval

 Balance changes

 Settings changes

 User management

Include:

 User who performed the action

 Date and time

 Old value

 New value

12. Database

Store all application data in the Lovable Cloud database.

Do not hardcode:

 Prices

 Bank details

 Bonuses

 Plans

 Settings

Everything should be editable from the Admin Panel.

13. Performance

Optimize the application for:

 Desktop

 Mobile

 Fast loading

 Secure API calls

 Responsive design

14. Final Goal

I want the finished project to look exactly like the attached application while adding a fully functional backend and a complete Admin Panel connected to Lovable Cloud. Ensure all user actions and admin actions are stored in the database and update in real time where appropriate.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://betanon.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5ca1fb8a-f31e-4c80-ac2b-1fbed799ac6c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
