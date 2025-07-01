
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { checkForUpdates, applyUpdate, startVersionMonitoring } from '@/utils/versionCheck';

const VersionUpdateNotification: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Start monitoring for version updates
    const cleanup = startVersionMonitoring(() => {
      setUpdateAvailable(true);
      
      // Show toast notification
      toast({
        title: "Uusi versio saatavilla",
        description: "Sivustosta on saatavilla uudempi versio. Päivitä nähdäksesi uusimmat ominaisuudet.",
        duration: 0, // Don't auto-dismiss
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleUpdate}
            disabled={isUpdating}
          >
            {isUpdating ? 'Päivitetään...' : 'Päivitä'}
          </Button>
        ),
      });
    });

    // Initial check
    checkForUpdates().then(hasUpdate => {
      if (hasUpdate) {
        setUpdateAvailable(true);
      }
    });

    return cleanup;
  }, [toast]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      const success = await applyUpdate();
      
      if (success) {
        // Reload the page to use the new version
        window.location.reload();
      } else {
        // Fallback: force reload
        window.location.reload();
      }
    } catch (error) {
      console.error('Error applying update:', error);
      // Force reload as fallback
      window.location.reload();
    }
  };

  // Don't render anything - notifications are handled via toast
  return null;
};

export default VersionUpdateNotification;
