# Security Policy & Google Compliance

## HaiderSanitary POS System

This software is built following standard Google Security Policies for web applications:

1. **Role-Based Access Control (RBAC)**: Sensitive financial data, including expense sheets and global reports, are restricted to the Super Admin and Manager roles.
2. **Local Persistence Security**: All data is stored using browser-level sandboxed storage. No data is exposed to public search engines.
3. **Data Integrity**: Automated maintenance cycles (every 3 days) ensure database health and prompt for regular backups.
4. **Privacy First**: Customer contact information and Khata records are handled within the private session of the authenticated user.
5. **No Third-Party Exposure**: External integrations (like WhatsApp) are handled via direct user-initiated intent, ensuring no automated scraping of business data.

## Maintenance Schedule
- **Cycle**: Every 3 Days
- **Actions**: Database integrity check, Local storage cleanup, Cloud Backup verification.

## Master Software Bundle
A consolidated **Master Bundle (.tar.gz)** is available for the Super Admin. This includes:
1. **Full Source Code**: Every component and logic file.
2. **Mobile App (APK)**: For direct installation on Android.
3. **Security Docs**: This policy and compliance report.
