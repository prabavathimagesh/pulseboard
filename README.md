# PulseBoard

A compact ticket board for small teams built with React, TypeScript, and Supabase.

## Features

- **Authentication**: Email OTP login with Supabase Auth
- **Ticket Management**: Create, view, and manage tickets
- **Comments**: Add comments to tickets with real-time updates
- **Labels**: Organize tickets with custom labels
- **Search & Filter**: Search by title/description and filter by status/labels
- **Role-based Access**: Admin users can close tickets and manage labels
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Routing**: React Router DOM

## Setup Instructions

### 1. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL schema from `supabase-schema.sql` to create the required tables and policies

### 2. Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under "API".

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### First Time Setup

1. **Login**: Use the email OTP login system
2. **Admin Setup**: To make a user an admin, update their role in the `profiles` table:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE user_id = 'your-user-id';
   ```

### User Features

- **Create Tickets**: Click "Create New Ticket" to add new tickets
- **View Tickets**: Browse all tickets with search and filter options
- **Add Comments**: Click on any ticket to view details and add comments
- **Filter**: Use the search bar and filters to find specific tickets

### Admin Features

- **Close/Reopen Tickets**: Admins can change ticket status
- **Manage Labels**: Go to Settings to create and edit labels
- **Full Access**: Admins can see and manage all tickets

## Database Schema

The application uses the following main tables:

- `profiles`: User information and roles
- `tickets`: Ticket data with status and metadata
- `labels`: Custom labels for organizing tickets
- `tickets_labels`: Many-to-many relationship between tickets and labels
- `comments`: Comments on tickets with author information

## Development

### Project Structure

```
src/
├── api/           # Supabase API functions
├── context/       # React context providers
├── pages/         # Page components
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

### Key Components

- **AuthProvider**: Manages authentication state
- **Tickets**: Main ticket listing with search/filter
- **CreateTicket**: Form for creating new tickets
- **TicketDetails**: Individual ticket view with comments
- **Settings**: Admin panel for label management

## Deployment

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Ensure environment variables are set in your hosting environment

## License

MIT License
