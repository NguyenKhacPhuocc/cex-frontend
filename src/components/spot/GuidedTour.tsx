// "use client";

// import { useEffect } from "react";
// import { driver } from "driver.js";
// import "driver.js/dist/driver.css";

// export default function IntroGuide() {
//     useEffect(() => {
//         const driverObj = driver({
//             showProgress: true,
//             allowClose: true,
//             steps: [
//                 {
//                     element: "#orderbook",
//                     popover: {
//                         title: "Đây là bước 1",
//                         description: "Giới thiệu phần đầu tiên của giao diện.",
//                     },
//                 },
//                 {
//                     element: "#order",
//                     popover: {
//                         title: "Bước 2",
//                         description: "Tiếp theo là phần thứ hai.",
//                     },
//                 },
//             ],
//         });

//         driverObj.drive();
//     }, []);

//     return (
//         <div className="p-4">
//             <h1 id="step1" className="text-2xl font-bold">Trang chính</h1>
//             <button id="step2" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
//                 Nhấn vào tôi
//             </button>
//         </div>
//     );
// }


// "use client";
// import { driver } from "driver.js";
// import "driver.js/dist/driver.css";

// export default function GuidedTour() {
//     const startTour = () => {
//         const tour = driver({
//             steps: [
//                 { element: "#orderbook", popover: { title: "OrderBook", description: "Sổ lệnh" } },
//                 { element: "#order", popover: { title: "Order", description: "Đặt lệnh" } },
//             ],
//         });
//         tour.drive();
//     };

//     return (
//         <div className="">
//             <button
//                 onClick={startTour}
//                 className="bg-green-600 text-white rounded"
//             >
//                 Bắt đầu hướng dẫn
//             </button>
//         </div>
//     );
// }
