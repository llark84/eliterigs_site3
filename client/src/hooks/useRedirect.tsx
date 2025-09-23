import { useEffect } from 'react';
import { useLocation } from 'wouter';

import { getRedirectForPath } from '@/utils/redirectMap';

/**
 * Hook to handle URL redirects based on the redirect map
 * Automatically redirects users from old URLs to new ones
 */
export function useRedirect() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const redirectRule = getRedirectForPath(location);

    if (redirectRule) {
      console.log(`Redirecting from ${location} to ${redirectRule.to} (${redirectRule.reason})`);

      // Use replace for permanent redirects to avoid back button issues
      if (redirectRule.type === 'permanent') {
        // Update the URL without adding to browser history
        window.history.replaceState(null, '', redirectRule.to);
        setLocation(redirectRule.to);
      } else {
        // Temporary redirects use normal navigation
        setLocation(redirectRule.to);
      }
    }
  }, [location, setLocation]);

  return null;
}
