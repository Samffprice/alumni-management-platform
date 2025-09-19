# Alumni Management Platform

A comprehensive alumni management platform built with **Nuxt 3**, **Supabase**, and **TypeScript**. This platform provides a complete solution for managing alumni networks with user authentication, role-based access control, contact management, and administrative features.

## 🚀 Features

### Authentication & Authorization
- **Secure Authentication** with Supabase Auth
- **Email Verification** with confirmation workflow
- **Role-Based Access Control** (Member, Officer, VP)
- **Approval Workflow** for new user registrations
- **SSR-Compatible** authentication with proper hydration

### User Management (VP Only)
- **View All Users** with roles and approval status
- **Approve/Unapprove Users** with one-click actions
- **Change User Roles** (Member → Officer → VP)
- **Remove Users** with confirmation dialogs
- **Real-time Updates** with loading states and notifications

### Contact Management
- **CRUD Operations** for alumni contacts
- **Advanced Search & Filtering** by name, company, graduation year
- **Detailed Contact Profiles** with comprehensive information
- **Role-Based Permissions** (View: All, Edit: Officer+, Delete: VP)
- **Responsive Design** with mobile-friendly interface

### Dashboard & Analytics
- **User Statistics** and platform metrics
- **Recent Activity** tracking
- **Admin Controls** for platform management
- **Responsive Charts** and data visualization

### Technical Features
- **Server-Side Rendering (SSR)** with Nuxt 3
- **TypeScript** for type safety
- **Tailwind CSS** for responsive design
- **Pinia** for state management
- **Comprehensive Error Handling** with user-friendly messages
- **Loading States** and optimistic updates
- **Security Best Practices** with input validation

## 🛠️ Tech Stack

- **Frontend**: Nuxt 3, Vue 3, TypeScript
- **Styling**: Tailwind CSS, Heroicons
- **Backend**: Supabase (Auth, Database, RLS)
- **State Management**: Pinia
- **Deployment**: Vercel/Netlify ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Samffprice/alumni-management-platform.git
cd alumni-management-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Database Setup

1. Create a new Supabase project
2. Run the SQL migration script in your Supabase SQL editor:

```bash
# Copy the contents of supabase-migration.sql to your Supabase SQL editor
```

3. Set up Row Level Security policies using `test-rls-policies.sql`

### 5. Create Your First VP User

After setting up the database, create your first VP user:

```bash
# Run the SQL in make-user-vp.sql, replacing the email with your email
```

### 6. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application!

## 📁 Project Structure

```
├── components/          # Vue components
│   ├── AppHeader.vue   # Navigation header
│   ├── ContactForm.vue # Contact creation/editing
│   ├── ContactTable.vue # Contact listing
│   └── UserManagementTable.vue # User admin table
├── composables/         # Vue composables
│   ├── useAuth.ts      # Authentication logic
│   ├── useNotifications.ts # Toast notifications
│   └── useSupabaseOperations.ts # Database operations
├── layouts/            # Nuxt layouts
│   ├── auth.vue       # Authentication layout
│   └── default.vue    # Main application layout
├── middleware/         # Route middleware
│   ├── auth.global.ts # Global authentication
│   └── vp-only.ts     # VP-only route protection
├── pages/             # Application pages
│   ├── admin/         # Admin pages
│   ├── contacts/      # Contact management
│   ├── dashboard.vue  # Main dashboard
│   ├── login.vue      # Login page
│   └── signup.vue     # Registration page
├── plugins/           # Nuxt plugins
│   ├── auth.client.ts # Client-side auth
│   └── auth.server.ts # Server-side auth
├── server/            # API routes
│   └── api/           # Server endpoints
├── store/             # Pinia stores
│   └── user.ts        # User state management
└── types/             # TypeScript definitions
```

## 🔐 Security Features

- **Row Level Security (RLS)** policies in Supabase
- **Server-side validation** for all API endpoints
- **Role-based middleware** protection
- **Input sanitization** and validation
- **Secure environment variable** handling
- **CSRF protection** with Nuxt security headers

## 🎨 User Interface

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark/Light Mode** support (configurable)
- **Accessible Components** with proper ARIA labels
- **Loading States** for better UX
- **Toast Notifications** for user feedback
- **Form Validation** with real-time feedback

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Netlify

1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.output/public`
4. Add environment variables

### Manual Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Samffprice/alumni-management-platform/issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 🙏 Acknowledgments

- [Nuxt.js](https://nuxt.com/) for the amazing framework
- [Supabase](https://supabase.com/) for backend services
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Heroicons](https://heroicons.com/) for beautiful icons

---

**Built with ❤️ for alumni communities**