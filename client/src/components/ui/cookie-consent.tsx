import { useState, useEffect } from 'react';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookieConsent');
    if (!hasConsented) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setOpen(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'false');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. This website uses necessary cookies for functionality and third-party cookies for analytics and social media features.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">We use cookies for:</h4>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              <li>Essential website functionality</li>
              <li>Authentication and security</li>
              <li>Analytics and performance</li>
              <li>Social media integration</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleDecline}>
            Essential Only
          </Button>
          <Button onClick={handleAccept}>Accept All</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
