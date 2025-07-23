# 🏠 Hüttenapp - Cabin Booking Management System

A modern, intuitive cabin booking management system built with Laravel and React. Perfect for managing single cabin bookings with role-based access control and advanced calendar visualization.

## ✨ Features

### 🗓️ Advanced Calendar System

- **Dual Calendar Views**: Dashboard mini-calendar and full-year calendar
- **Half-Day Visualization**: Visual representation of arrival/departure days
- **Smart Click Detection**: Intelligent position-based booking creation
- **Real-time Availability**: Instant visual feedback on booking status

### 👥 Role-Based Access Control

- **Admin Users**: Full access to all bookings and management features
- **Guest Users**: Can create, view, and manage their own bookings only
- **Flexible Permissions**: Granular control over booking operations

### 📅 Booking Management

- **Easy Booking Creation**: Click on free calendar slots to create bookings
- **Booking Details**: Comprehensive view of all booking information
- **Overlap Prevention**: Smart validation to prevent booking conflicts
- **Status Management**: Pending, confirmed, and cancelled booking states

### 🎨 Modern UI/UX

- **Responsive Design**: Works perfectly on desktop and mobile
- **shadcn/ui Components**: Beautiful, accessible UI components
- **German Localization**: Full German language support
- **Intuitive Navigation**: Clean topbar navigation with cabin logo

## 🚀 Technology Stack

### Backend

- **Laravel 11**: Modern PHP framework
- **MySQL/SQLite**: Database management
- **Inertia.js**: SPA experience without API complexity
- **Laravel Policies**: Role-based authorization
- **Form Requests**: Comprehensive validation with German messages

### Frontend

- **React 19**: Latest React with function components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: High-quality component library
- **Vite**: Fast build tool and development server

## 📦 Installation

### Prerequisites

- PHP 8.2+
- Node.js 18+
- Composer
- MySQL/SQLite

### Setup Steps

1. **Clone the repository**

    ```bash
    git clone https://github.com/itsjustvita/booking-calendar.git
    cd huettenapp
    ```

2. **Install PHP dependencies**

    ```bash
    composer install
    ```

3. **Install Node.js dependencies**

    ```bash
    npm install
    ```

4. **Environment setup**

    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

5. **Database setup**

    ```bash
    # Configure your database in .env file
    php artisan migrate
    php artisan db:seed
    ```

6. **Build frontend assets**

    ```bash
    npm run build
    ```

7. **Start development server**
    ```bash
    php artisan serve
    ```

## 👤 Default Users

After seeding, you can login with:

### Admin User

- **Email**: admin@huettenapp.com
- **Password**: password
- **Role**: Admin (can manage all bookings)

### Guest Users

- **Email**: guest1@huettenapp.com, guest2@huettenapp.com, etc.
- **Password**: password
- **Role**: Guest (can manage own bookings only)

## 🎯 Usage

### Creating Bookings

1. Navigate to Dashboard or Year Calendar
2. Click on any free calendar day (left half = morning arrival, right half = afternoon)
3. Fill out the booking form with details
4. Submit to create the booking

### Viewing Bookings

1. Click on any booked day (blue colored)
2. View comprehensive booking details
3. Edit or delete (if you have permissions)

### Managing Bookings

- **Admins**: Can edit/delete any booking
- **Guests**: Can only edit/delete their own bookings
- **Visual Status**: See booking status through color coding

## 🎨 Calendar Features

### Half-Day Visualization

- **Arrival Days**: Left half free (green/transparent), right half booked (blue)
- **Departure Days**: Left half booked (blue), right half free (green/transparent)
- **Full Days**: Completely booked (blue)
- **Free Days**: Completely free (transparent)

### Smart Interactions

- **Position-Based Clicks**: Left click = morning, right click = afternoon
- **Hover Tooltips**: Instant information about availability
- **Seamless UX**: No dead zones, entire day is clickable

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start Vite dev server
php artisan serve    # Start Laravel server

# Building
npm run build        # Build for production
npm run check        # Type checking

# Database
php artisan migrate:fresh --seed  # Reset database with sample data
php artisan tinker                # Laravel REPL
```

### File Structure

```
app/
├── Http/Controllers/     # Laravel controllers
├── Models/              # Eloquent models
├── Policies/            # Authorization policies
└── Http/Requests/       # Form validation

resources/js/
├── components/          # React components
├── layouts/            # Page layouts
├── pages/              # Inertia pages
└── types/              # TypeScript definitions

database/
├── migrations/         # Database migrations
└── seeders/           # Sample data
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Laravel](https://laravel.com) - The PHP framework
- [React](https://react.dev) - The JavaScript library
- [Inertia.js](https://inertiajs.com) - The modern monolith
- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework

## 📞 Support

For support, email [support@huettenapp.com](mailto:support@huettenapp.com) or create an issue on GitHub.

---

**Built with ❤️ for cabin booking management**
