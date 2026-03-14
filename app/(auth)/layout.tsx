import React from 'react';

export const metadata = {
  title: 'Polaris Pilot - Authentication',
  description: 'Sign in to your Polaris Pilot account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
