import * as React from 'react';

import { UI_CONFIG } from '@/constants/config';

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${UI_CONFIG.mobileBreakpoint - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < UI_CONFIG.mobileBreakpoint);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < UI_CONFIG.mobileBreakpoint);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}
