'use client';

import React from 'react';
import Link from 'next/link';

interface AnnouncementBarProps {
  text?: string;
  link?: string;
}

export function AnnouncementBar({
  text = 'Complimentary Express Delivery Across India on Orders Above ₹2,500',
  link = '/shop',
}: AnnouncementBarProps) {
  return (
    <div className="bg-charcoal text-ivory text-xs font-medium tracking-widest uppercase py-2 px-4 text-center transition-colors">
      <Link href={link} className="hover:text-gold transition-colors inline-block">
        {text}
      </Link>
    </div>
  );
}
