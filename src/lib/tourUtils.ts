import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { TourConfig } from "@/config/tourConfig";

// Function khởi tạo CSS cho driver.js (chỉ thực hiện 1 lần)
const initDriverStyles = () => {
  if (document.getElementById("driver-custom-styles")) return; // Đã tồn tại

  const style = document.createElement("style");
  style.id = "driver-custom-styles";
  style.innerHTML = `
            .driver-popover {
                background: linear-gradient(135deg, #1e2329 0%, #2b3139 100%) !important;
                border: 2px solid #FCD535 !important;
                border-radius: 8px !important;
                box-shadow: 0 10px 30px rgba(252, 213, 53, 0.3) !important;
            }
            
            .driver-popover-title {
                color: #FCD535 !important;
                font-size: 18px !important;
                font-weight: 600 !important;
                margin-bottom: 10px !important;
            }
            
            .driver-popover-description {
                color: #EAECEF !important;
                font-size: 14px !important;
                line-height: 1.6 !important;
            }
            
            .driver-popover-footer {
                margin-top: 15px !important;
            }
            
            .driver-popover-next-btn,
            .driver-popover-prev-btn,
            .driver-popover-close-btn {
                background: #FCD535 !important;
                color: #000 !important;
                border: none !important;
                padding: 8px 16px !important;
                border-radius: 4px !important;
                font-weight: 500 !important;
                transition: all 0.3s ease !important;
            }
            
            .driver-popover-next-btn:hover,
            .driver-popover-prev-btn:hover,
            .driver-popover-close-btn:hover {
                background: #FDDD5D !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 4px 12px rgba(252, 213, 53, 0.4) !important;
            }
            
            .driver-popover-prev-btn {
                background: transparent !important;
                color: #FCD535 !important;
                border: 1px solid #FCD535 !important;
            }
            
            .driver-popover-close-btn {
                background: transparent !important;
                color: #EAECEF !important;
                border: 1px solid #2b3139 !important;
            }
            
            .driver-popover-close-btn:hover {
                background: rgba(252, 213, 53, 0.1) !important;
                color: #FCD535 !important;
                border-color: #FCD535 !important;
            }
            
            .driver-popover-progress-text {
                color: #FCD535 !important;
                font-weight: 500 !important;
            }
            
            .driver-popover-arrow {
                background-color: transparent !important;
                width: 14px !important;
                height: 14px !important;
                border-width: 7px !important;
            }
            
            /* Arrow top - chỉ border top màu vàng, các border khác transparent */
            .driver-popover-arrow-side-top.driver-popover-arrow {
                border-top-color: #FCD535 !important;
                border-right-color: transparent !important;
                border-bottom-color: transparent !important;
                border-left-color: transparent !important;
            }
            
            /* Arrow bottom - chỉ border bottom màu vàng, các border khác transparent */
            .driver-popover-arrow-side-bottom.driver-popover-arrow {
                border-top-color: transparent !important;
                border-bottom-color: #FCD535 !important;
                border-right-color: transparent !important;
                border-left-color: transparent !important;
            }
            
            /* Arrow left - chỉ border left màu vàng, các border khác transparent */
            .driver-popover-arrow-side-left.driver-popover-arrow {
                border-top-color: transparent !important;
                border-right-color: transparent !important;
                border-bottom-color: transparent !important;
                border-left-color: #FCD535 !important;
            }
            
            /* Arrow right - chỉ border right màu vàng, các border khác transparent */
            .driver-popover-arrow-side-right.driver-popover-arrow {
                border-top-color: transparent !important;
                border-right-color: #FCD535 !important;
                border-bottom-color: transparent !important;
                border-left-color: transparent !important;
            }
            
            .driver-active-element {
                outline: 4px solid #FCD535 !important;
                outline-offset: 4px !important;
                position: relative !important;
                z-index: 9999 !important;

            }
            
            /* Style cho highlight stage (vùng được cut-out) - driver.js tạo ra */
            .driver-highlighted-element,
            .driver-stage {
                position: relative !important;
                background: transparent !important;
            }
            
            /* Làm tối các phần không được highlight để nổi bật vùng sáng */
            .driver-overlay {
                // background: rgba(0, 0, 0, 0.7) !important;
            }
            
            /* Đảm bảo popover luôn ở trên cùng */
            .driver-popover-wrapper {
                z-index: 10000 !important;
            }
        `;
  document.head.appendChild(style);
};

// Generic function để start tour với bất kỳ config nào
export const startTour = (config: TourConfig) => {
  initDriverStyles(); // Đảm bảo CSS đã được load

  const tour = driver({
    showProgress: true,
    allowClose: true,
    showButtons: ["next", "previous", "close"],
    smoothScroll: true,
    animate: true,
    overlayOpacity: 0.8,
    stagePadding: 10,
    stageRadius: 8,
    onHighlightStarted: async (element) => {
      // Scroll element vào view với smooth behavior
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }

      // Đợi layout ổn định xong
      await new Promise<void>((resolve) => setTimeout(resolve, 800));

      // Force reflow để đảm bảo layout stable
      if (element) void element.getBoundingClientRect();

      // 👉 Force driver tính lại vị trí popover sau khi scroll xong
      requestAnimationFrame(() => {
        try {
          // Try different methods depending on driver.js version
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const driverInstance = tour as any;
          if (driverInstance.refreshPopoverPosition) {
            driverInstance.refreshPopoverPosition();
          } else if (driverInstance.recalculatePosition) {
            driverInstance.recalculatePosition();
          } else if (driverInstance.refresh) {
            driverInstance.refresh();
          }
        } catch (err) {
          console.warn("Reposition popover failed:", err);
        }
      });
    },
    onHighlighted: () => {
      // Callback bổ sung để đảm bảo popover luôn đúng vị trí
      requestAnimationFrame(() => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const driverInstance = tour as any;
          if (driverInstance.refreshPopoverPosition) {
            driverInstance.refreshPopoverPosition();
          } else if (driverInstance.refresh) {
            driverInstance.refresh();
          }
        } catch {
          // Silent fail
        }
      });
    },
    steps: config.steps,
    onDestroyStarted: () => {
      // Đánh dấu đã xem tour khi user tắt (bằng cách click ra ngoài hoặc đóng)
      localStorage.setItem(config.tourKey, "true");
      tour.destroy();
    },
    onDestroyed: () => {
      // Đánh dấu đã hoàn thành tour
      localStorage.setItem(config.tourKey, "true");
    },
  });

  tour.drive();
};

// Check xem user đã hoàn thành tour chưa
export const isTourCompleted = (tourKey: string): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(tourKey) === "true";
};

// Reset tour (để test lại)
export const resetTour = (tourKey: string): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(tourKey);
};
