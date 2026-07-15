'use client';

import { useEffect } from 'react';
import { captureUtmParams } from '@/lib/utm';

export function UtmCapture() {
  useEffect(() => {
    captureUtmParams(window.location.search);
  }, []);

  return null;
}
