import { Metadata } from 'next';
import React from 'react';

// This metadata object will be applied to the /blog page and its children.
export const metadata: Metadata = {
  title: 'Blog | Samuel Loga Portfolio',
};

// This layout component wraps the page.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
