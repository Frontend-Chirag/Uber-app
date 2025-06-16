# Multi-Tenant Uber-like Application

## Overview
This application is a multi-tenant ride-sharing platform that allows different organizations (tenants) to operate their own ride-sharing services while sharing the same infrastructure. Each tenant can have their own drivers, riders, and business rules while maintaining data isolation.

## Multi-Tenancy Benefits

1. **Cost Efficiency**
   - Shared infrastructure reduces operational costs
   - Economies of scale in maintenance and updates
   - Reduced development time for new tenants

2. **Data Isolation**
   - Each tenant's data is completely separated
   - Enhanced security and privacy
   - Compliance with data protection regulations

3. **Customization**
   - Tenant-specific branding and UI
   - Custom business rules and pricing
   - Flexible feature sets per tenant

4. **Scalability**
   - Easy addition of new tenants
   - Independent scaling of tenant resources
   - Efficient resource utilization

## Architecture Changes

### 1. Tenant Model
```prisma
model Tenant {
    id            String   @id @default(auto()) @map("_id") @db.ObjectId
    name          String
    domain        String   @unique
    logo          String?
    theme         Json?    // Custom theme configuration
    settings      Json?    // Tenant-specific settings
    isActive      Boolean  @default(true)
    createdAt     DateTime @default(now())
    updatedAt     DateTime @updatedAt
}
```

### 2. User Model Changes
- Removed `role` field from User model
- Added `tenantId` to associate users with specific tenants
- Users can now be both riders and drivers within the same tenant

### 3. Driver and Rider Models
- Added `tenantId` to both models
- Maintained separate collections for better data isolation
- Added tenant-specific configurations

## Implementation Details

### 1. Tenant Identification
- Subdomain-based routing (e.g., tenant1.yourapp.com)
- Custom domain support
- Tenant context middleware

### 2. Data Isolation
- Database-level tenant filtering
- Row-level security
- Tenant-specific indexes

### 3. Authentication & Authorization
- Tenant-aware authentication
- Role-based access control within tenants
- Cross-tenant access restrictions

### 4. API Changes
- All endpoints now require tenant context
- Tenant-specific rate limiting
- Tenant-aware caching

## Getting Started

1. **Environment Setup**
   ```bash
   # Required environment variables
   DATABASE_URL=your_mongodb_url
   DIRECT_DATABASE_URL=your_direct_mongodb_url
   JWT_SECRET=your_jwt_secret
   ```

2. **Database Migration**
   ```bash
   npx prisma migrate dev
   ```

3. **Running the Application**
   ```bash
   npm run dev
   ```

## Best Practices

1. **Tenant Management**
   - Implement tenant provisioning process
   - Regular tenant health checks
   - Tenant-specific monitoring

2. **Security**
   - Strict tenant isolation
   - Regular security audits
   - Tenant-specific security policies

3. **Performance**
   - Tenant-aware caching
   - Efficient query optimization
   - Resource usage monitoring

4. **Maintenance**
   - Regular database maintenance
   - Tenant-specific backups
   - Version control for tenant configurations

## Future Enhancements

1. **Tenant Analytics**
   - Tenant-specific dashboards
   - Performance metrics
   - Usage statistics

2. **Customization Options**
   - Tenant-specific features
   - Custom workflows
   - Branding options

3. **Integration Capabilities**
   - Tenant-specific APIs
   - Third-party integrations
   - Custom webhooks

## Contributing
Please read our contributing guidelines before submitting pull requests.

## License
This project is licensed under the MIT License.
