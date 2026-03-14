'use server';

import { config } from '@/lib/config';

export function troubleshoot() {
  console.log('SMTP Host:', config.smtp.host);
  console.log('SMTP Port:', config.smtp.port);
  console.log('SMTP User:', config.smtp.user);
}
