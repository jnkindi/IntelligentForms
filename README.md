# Intelligent Forms

**Privacy-first, self-hosted form management for organizations that value data sovereignty.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13%2B-blue)](https://www.postgresql.org/)
[![npm](https://img.shields.io/badge/npm-%3E%3D9.0.0-red)](https://www.npmjs.com/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D8.0.0-orange)](https://pnpm.io/)

---

## 🌟 Overview

Intelligent Forms is an enterprise-ready, open-source form management system designed for organizations that prioritize data privacy and control. Built with Next.js 14, it provides dynamic form creation, robust user management, role-based access control, and offline-first functionality.

### Why Choose Intelligent Forms?

- **🔐 Privacy-First** - Self-hosted solution ensuring complete data sovereignty
- **📱 Offline Functionality** - IndexedDB-powered offline form submissions with automatic sync
- **👥 Multi-User Support** - Role-based access control (Admin, Manager, User)
- **🎯 Dynamic Forms** - Flexible form builder with multiple field types
- **📊 Real-Time Analytics** - Comprehensive statistics and submission tracking
- **🔌 API Integration** - External API webhooks for form submissions
- **📄 Export Capabilities** - PDF, CSV, and JSON export formats
- **🎨 Modern UI** - Clean, responsive interface with consistent blue/white/black branding
- **🔒 Enterprise Security** - bcrypt password hashing, JWT authentication, RBAC

---

## 📦 Technology Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL 13+
- **Authentication:** NextAuth.js with JWT
- **Styling:** Tailwind CSS (Blue/White/Black theme)
- **Validation:** Zod
- **Icons:** Lucide React
- **Package Manager:** npm or pnpm

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0 or pnpm >= 8.0.0
- PostgreSQL >= 13.0.0
- Git

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/jnkindi/intelligent-forms.git
cd intelligent-forms
```

**2. Install dependencies**

Using npm:

```bash
npm install
```

Or using pnpm:

```bash
pnpm install
```

**3. Configure environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/intelligentforms?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-random-secret-key-change-in-production"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NODE_ENV="development"
TZ="UTC"
```

**Important:** Generate a secure NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

**4. Set up the database**

```bash
# Using createdb command
createdb intelligentforms

# Or using psql
psql -U postgres -c "CREATE DATABASE intelligentforms;"
```

**5. Generate Prisma Client and push schema**

Using npm:

```bash
npm run db:generate
npm run db:push
```

Or using pnpm:

```bash
pnpm db:generate
pnpm db:push
```

**6. Start the development server**

Using npm:

```bash
npm run dev
```

Or using pnpm:

```bash
pnpm dev
```

Visit `http://localhost:3000` to access the application.

---

## ⚙️ First-Time Setup

On first launch, you'll be redirected to the setup wizard (`/setup`) where you'll:

### Step 1: Organization Details

- Organization name (required)
- Tagline
- Description
- Contact email and phone
- Support email
- Website URL
- Physical address

### Step 2: Admin Account

- Full name (required)
- Email address (required)
- Password (required, minimum 6 characters)
- Confirm password

### Step 3: Review & Confirm

- Review all entered information
- Complete setup with one click

After setup, you'll be redirected to `/login` to sign in with your admin credentials.

---

## 👥 User Management

### Creating Users

1. Navigate to **Admin** → **User Management**
2. Click **Add User**
3. Fill in user details:
   - Full name \*
   - Email address \*
   - Job title (optional)
   - Role (Admin/Manager/User) \*
   - Password \*
4. Click **Create User**

### User Roles

- **ADMIN**: Full system access, manage all users and roles
- **MANAGER**: Create USER role only, manage forms
- **USER**: Limited to assigned forms only

### Editing Users

1. Go to **Admin** → **User Management**
2. Click the edit icon next to a user
3. Update user details
4. Click **Save Changes**

### Assigning Form Access

Control which users can access specific forms with granular permissions:

1. Go to **Admin** → **User Management**
2. Click on a user to expand details
3. View current form access assignments
4. Assign access with permission levels:
   - **VIEW**: Read-only access to form and submissions
   - **EDIT**: Can modify form structure and view submissions
   - **FULL**: Complete control including settings and API integration

**Global Form Access**: Assign `null` formId to grant access to ALL forms.

---

## 🏢 Organization Settings

Customize your organization's branding (Admin only):

1. Navigate to **Admin** → **Organization Settings**
2. Configure:
   - **Basic Information**: Name, tagline, description
   - **Contact Information**: Contact email/phone, support email, website, address
3. Click **Save Changes**

---

## 📝 Creating Forms

### Dynamic Form Builder

1. Click **Create Form** from dashboard
2. Fill in form details:
   - Title and description
   - Choose type (Form or Survey)
   - Add multiple field types:
     - Text input
     - Text area
     - Number
     - Email
     - Phone
     - Date
     - Single-choice (radio)
     - Multiple-choice (checkbox)
   - Configure required/optional
   - Set custom placeholders
3. Save the form

### Form Features

- **Multiple field types** with validation
- **Required/optional fields**
- **Custom placeholders**
- **Field ordering**
- **Form types**: Forms and Surveys

---

## 📱 Offline Functionality

Forms support offline submission using IndexedDB:

- Automatic offline detection
- Local storage of submissions
- Background sync when connection restored
- Encrypted data storage option
- Queue management for failed submissions

**How it works:**

1. User fills out form while offline
2. Data saved to IndexedDB locally
3. When connection restored, automatically syncs to server
4. Submission appears in database

---

## 🔌 External API Integration

Forward form submissions to external systems:

1. Navigate to form settings
2. Configure webhook:
   - URL
   - HTTP method (GET, POST, PUT, PATCH)
   - Custom headers
   - Field mapping
3. Save configuration

**Features:**

- Detailed logging with request/response capture
- Error tracking and retry mechanism
- Enable/disable without deleting configuration
- View API call history and status

---

## 📊 Analytics & Reporting

Comprehensive statistics including:

- Total submissions by form
- Submission trends (last 7 days, all time)
- Active vs. inactive forms
- Response rates and completion metrics
- User activity tracking
- API call success rates

---

## 💾 Export Options

Export submission data in multiple formats:

- **PDF**: Beautifully formatted document with branding
- **CSV**: Spreadsheet-compatible format
- **JSON**: Developer-friendly structured data

---

## 📖 API Documentation

### Authentication

All protected endpoints require NextAuth session authentication.

### Organization Endpoints

- `GET /api/organization/setup` - Check if setup is completed
- `POST /api/organization/setup` - Complete initial organization setup
- `GET /api/organization` - Get organization details (authenticated)
- `PATCH /api/organization` - Update organization (Admin only)

### User Management Endpoints

- `GET /api/users` - List all users (Admin/Manager only)
- `POST /api/users` - Create new user (Admin/Manager)
- `GET /api/users/[id]` - Get user details
- `PATCH /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user (Admin only)

### Form Access Endpoints

- `GET /api/form-access` - List form access records (Admin/Manager)
- `POST /api/form-access` - Assign form access to user
- `PATCH /api/form-access/[id]` - Update access level
- `DELETE /api/form-access/[id]` - Revoke form access

### Form Endpoints

- `GET /api/forms` - List forms (respects user permissions)
- `POST /api/forms` - Create new form
- `GET /api/forms/[id]` - Get form details
- `PATCH /api/forms/[id]` - Update form
- `DELETE /api/forms/[id]` - Delete form

### Form Submission Endpoints

- `GET /api/forms/[id]/submissions` - Get form submissions
- `POST /api/forms/[hash]/submit` - Submit form (public)
- `GET /api/forms/[id]/export/pdf` - Export as PDF
- `GET /api/forms/[id]/export/csv` - Export as CSV
- `GET /api/forms/[id]/export/json` - Export as JSON

---

## 🧪 Testing

### Manual Testing Checklist

**1. First-Time Setup**

- Visit `http://localhost:3000`
- Complete 3-step setup wizard
- Verify redirect to login page

**2. Authentication**

- Login with admin credentials
- Verify session persistence
- Test logout functionality

**3. Dashboard**

- Check statistics cards display correctly
- Verify quick actions work
- Confirm recent forms list

**4. User Management**

- Create new users with different roles
- Edit user information
- Toggle user active/inactive status
- Delete users (Admin only)

**5. Form Creation**

- Create form with multiple field types
- Test form validation
- Publish and access public form

**6. Form Submissions**

- Submit form while online
- Submit form while offline (test sync)
- View submissions in dashboard
- Export to PDF/CSV/JSON

**7. Organization Settings**

- Update organization details
- Verify changes reflect across app

**8. Production Build**

Using npm:

```bash
npm run build
npm start
```

Or using pnpm:

```bash
pnpm build
pnpm start
```

Expected: Build completes with 25/25 pages generated. Note: 4 pages (login, add-form, api-logs, save-data-externally) will show pre-rendering warnings - this is expected for dynamic client pages.

---

## 📝 Available Scripts

### Development

**Using npm:**

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Lint all code
- `npm run format` - Format with Prettier
- `npm run clean` - Clean build artifacts

**Using pnpm:**

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Lint all code
- `pnpm format` - Format with Prettier
- `pnpm clean` - Clean build artifacts

### Database

**Using npm:**

- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio (GUI)
- `npm run db:seed` - Seed with sample data (optional)

**Using pnpm:**

- `pnpm db:generate` - Generate Prisma Client
- `pnpm db:push` - Push schema to database
- `pnpm db:migrate` - Create and run migrations
- `pnpm db:studio` - Open Prisma Studio (GUI)
- `pnpm db:seed` - Seed with sample data (optional)

---

## 🚢 Deployment

### Production Build

Using npm:

```bash
npm run build
npm run start
```

Or using pnpm:

```bash
pnpm build
pnpm start
```

### Environment Variables for Production

```env
DATABASE_URL="postgresql://user:pass@host:5432/intelligentforms?schema=public"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-super-secure-random-secret"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXT_PUBLIC_API_URL="https://your-domain.com/api"
NODE_ENV="production"
```

### Deployment Platforms

#### Vercel (Recommended)

```bash
vercel --prod
```

Add PostgreSQL via Vercel Postgres or external provider.

#### Railway

```bash
railway up
```

Includes PostgreSQL database.

#### Docker

See `Dockerfile` in repository for containerized deployment.

#### AWS / Azure / GCP

Deploy on cloud VMs with PM2 or Docker.

---

## 🔒 Security Features

- **Authentication**: NextAuth.js with JWT (30-day sessions)
- **Password Hashing**: bcrypt (10 rounds)
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **Input Validation**: Zod schemas for all user input
- **CSRF Protection**: NextAuth built-in protection
- **Role-Based Access Control (RBAC)**: Granular permissions
- **Active Status Check**: Inactive users cannot login
- **Self-Protection**: Users cannot delete/deactivate themselves

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

**Copyright © 2025 Jacques Nyilinkindi**

### What the MIT License Allows:

✅ **Commercial Use** - Use in commercial products and services  
✅ **Modification** - Modify the source code to fit your needs  
✅ **Distribution** - Share and redistribute the software  
✅ **Private Use** - Use privately for your organization  
✅ **Contribution** - Contribute back to the project

### What the MIT License Requires:

📋 **License and Copyright Notice** - Include the original license and copyright notice in all copies

### What the MIT License Disclaims:

⚠️ **No Liability** - The author is NOT liable for any damages or issues arising from the use of this software  
⚠️ **No Warranty** - The software is provided "AS IS" without any warranty of any kind

**In Plain English:** You can use Intelligent Forms for anything - personal projects, commercial products, or internal company use. You can modify it, sell it, or give it away. The only requirement is to keep the license notice. However, the author takes no responsibility for any issues that may arise from using this software.

---

## 🤝 Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Guidelines:**

- Follow existing code style
- Write TypeScript for type safety
- Use Zod for runtime validation
- Use Prisma for database operations
- Write meaningful commit messages
- Update documentation for new features

---

## 💡 Support

### Community Support (Free)

- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and share ideas
- **Documentation**: This README covers all features

### Professional Setup Support (Paid)

Need help setting up Intelligent Forms for your organization? I offer professional services:

**Services Include:**

- Infrastructure setup and deployment
- Custom branding and theming
- Integration with existing systems
- Staff training for administrators
- Ongoing technical support packages
- Custom feature development

**Contact:** jacques@jnkindilogs.xyz

---

## 🙏 Acknowledgments

Built with modern open-source technologies:

- [Next.js](https://nextjs.org/) - The React Framework for the Web
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [Lucide](https://lucide.dev/) - Beautiful & consistent icon toolkit

---

## 📞 Contact

- **Email**: jacques@jnkindilogs.xyz
- **GitHub**: https://github.com/jnkindi/intelligent-forms
- **Issues**: https://github.com/jnkindi/intelligent-forms/issues
- **Discussions**: https://github.com/jnkindi/intelligent-forms/discussions

---

## 🎨 Branding & Theme

**Color Scheme:**

- Primary: Blue (#0ea5e9 and variants)
- Background: White and light grays
- Text: Black and dark grays
- Accents: Blue for buttons, links, badges

All pages maintain consistent blue/white/black branding throughout the application.

---

**Made with ❤️ for organizations that value data privacy and sovereignty**

**Version:** 2.0.1  
**Last Updated:** October 25, 2025  
**License:** MIT  
**Copyright:** © 2025 Jacques Nyilinkindi
