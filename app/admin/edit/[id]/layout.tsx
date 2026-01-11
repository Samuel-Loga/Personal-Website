import { Metadata } from 'next';
import React from 'react';

// This metadata object will be applied to the /login page and its children.
export const metadata: Metadata = {
  title: 'Edit Post | Samuel Loga Portfolio',
};

// This layout component wraps the page.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
