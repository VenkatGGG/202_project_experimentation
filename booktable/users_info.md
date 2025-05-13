# BookTable Application User Credentials

## Admin User
- Email: admin@booktable.com
- Password: Admin@123
- Role: Administrator
- Access: Full system access, can manage all restaurants and users

## Restaurant Managers
1. Manager 1
   - Email: manager1@booktable.com
   - Password: Manager@123
   - Role: Restaurant Manager
   - Access: Can manage their assigned restaurants

2. Manager 2
   - Email: manager2@booktable.com
   - Password: Manager@123
   - Role: Restaurant Manager
   - Access: Can manage their assigned restaurants

## Customer Users
1. Customer 1
   - Email: alice@example.com
   - Password: Customer@123
   - Role: Customer
   - Access: Can browse restaurants, make bookings, and write reviews

2. Customer 2
   - Email: bob@example.com
   - Password: Customer@123
   - Role: Customer
   - Access: Can browse restaurants, make bookings, and write reviews

## Notes
- All passwords are securely hashed in the database
- Each user type has different permissions and access levels
- Managers are automatically assigned to restaurants in a round-robin fashion
- Reviews are randomly generated for the customer users
