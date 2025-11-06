import { useEffect } from "react";
import { TourConfig } from "@/config/tourConfig";
import { startTour, isTourCompleted } from "@/lib/tourUtils";

interface UseTourOptions {
  config: TourConfig;
  autoStart?: boolean; // Tự động start tour lần đầu tiên
  delay?: number; // Delay trước khi start (ms)
}

export const useTour = ({
  config,
  autoStart = false,
  delay = 1000,
}: UseTourOptions) => {
  useEffect(() => {
    if (autoStart) {
      const tourCompleted = isTourCompleted(config.tourKey);
      if (!tourCompleted) {
        // Delay để đảm bảo trang đã load xong
        setTimeout(() => {
          startTour(config);
        }, delay);
      }
    }
  }, [config, autoStart, delay]);

  // Return function để start tour manually
  const handleStartTour = () => {
    startTour(config);
  };

  return {
    startTour: handleStartTour,
    isCompleted: isTourCompleted(config.tourKey),
  };
};
