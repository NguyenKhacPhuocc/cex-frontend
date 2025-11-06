// Tour configurations cho các trang khác nhau

export interface TourStep {
  element: string;
  popover: {
    title: string;
    description: string;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
  };
}

export interface TourConfig {
  tourKey: string; // Key để lưu localStorage (ví dụ: "spot-tour-completed")
  steps: TourStep[];
}

// Tour cho trang Spot
export const spotTourConfig: TourConfig = {
  tourKey: "spot-tour-completed",
  steps: [
    {
      element: "#ticker",
      popover: {
        title: "Thông Tin Giá",
        description:
          "Đây là khu vực hiển thị giá hiện tại, biến động 24h và các thông tin quan trọng của cặp giao dịch.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#orderbook",
      popover: {
        title: "Sổ Lệnh (OrderBook)",
        description:
          "Hiển thị tất cả các lệnh mua (màu xanh) và lệnh bán (màu đỏ) đang chờ khớp. Giúp bạn xem được độ sâu thị trường.",
        side: "right",
        align: "start",
      },
    },
    {
      element: "#chart",
      popover: {
        title: "Biểu Đồ Giá",
        description:
          "Biểu đồ nến (candlestick) hiển thị diễn biến giá theo thời gian. Bạn có thể phân tích xu hướng và đưa ra quyết định giao dịch.",
        side: "left",
        align: "start",
      },
    },
    {
      element: "#order",
      popover: {
        title: "Đặt Lệnh",
        description:
          "Khu vực này cho phép bạn tạo lệnh mua hoặc bán. Chọn loại lệnh (Limit/Market), nhập số lượng và giá để giao dịch.",
        side: "top",
        align: "start",
      },
    },
    {
      element: "#trading-pairs",
      popover: {
        title: "Cặp Giao Dịch",
        description:
          "Danh sách tất cả các cặp tiền điện tử có thể giao dịch. Click vào để chuyển đổi giữa các cặp khác nhau.",
        side: "left",
        align: "start",
      },
    },
    {
      element: "#market-trades",
      popover: {
        title: "Giao Dịch Thị Trường",
        description:
          "Hiển thị các giao dịch vừa được khớp trên thị trường. Giúp bạn nắm bắt xu hướng mua bán ngắn hạn.",
        side: "left",
        align: "start",
      },
    },
    {
      element: "#open-orders",
      popover: {
        title: "Lệnh Của Bạn",
        description:
          "Quản lý tất cả các lệnh đang mở của bạn. Bạn có thể hủy hoặc chỉnh sửa lệnh tại đây.",
        side: "top",
        align: "start",
      },
    },
    {
      element: "#guild",
      popover: {
        title: "Hướng Dẫn",
        description: "Xem lại hướng dẫn tại đây.",
        side: "top",
        align: "start",
      },
    },
  ],
};

// Tour cho trang Futures (ví dụ)
export const futuresTourConfig: TourConfig = {
  tourKey: "futures-tour-completed",
  steps: [
    {
      element: "#futures-ticker",
      popover: {
        title: "Thông Tin Hợp Đồng",
        description:
          "Hiển thị thông tin về hợp đồng futures, giá đánh dấu, funding rate và thanh lý.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#futures-orderbook",
      popover: {
        title: "Sổ Lệnh Futures",
        description:
          "Sổ lệnh cho hợp đồng futures với khối lượng và độ sâu thị trường.",
        side: "right",
        align: "start",
      },
    },
    {
      element: "#futures-chart",
      popover: {
        title: "Biểu Đồ Futures",
        description: "Biểu đồ giá hợp đồng futures với các chỉ báo kỹ thuật.",
        side: "left",
        align: "start",
      },
    },
    {
      element: "#futures-order",
      popover: {
        title: "Đặt Lệnh Futures",
        description:
          "Chọn đòn bẩy, loại lệnh và khối lượng để giao dịch futures.",
        side: "top",
        align: "start",
      },
    },
    {
      element: "#leverage-slider",
      popover: {
        title: "Đòn Bẩy",
        description:
          "Điều chỉnh đòn bẩy từ 1x đến 125x. Lưu ý: Đòn bẩy cao có rủi ro lớn!",
        side: "top",
        align: "start",
      },
    },
    {
      element: "#position-management",
      popover: {
        title: "Quản Lý Vị Thế",
        description:
          "Xem và quản lý các vị thế futures đang mở, PnL và mức thanh lý.",
        side: "top",
        align: "start",
      },
    },
  ],
};

// Tour cho trang P2P (ví dụ)
export const p2pTourConfig: TourConfig = {
  tourKey: "p2p-tour-completed",
  steps: [
    {
      element: "#p2p-filter",
      popover: {
        title: "Bộ Lọc",
        description:
          "Chọn tiền tệ, phương thức thanh toán và số tiền muốn giao dịch.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#p2p-ads",
      popover: {
        title: "Danh Sách Quảng Cáo",
        description:
          "Các quảng cáo mua/bán từ người dùng khác với giá và điều kiện khác nhau.",
        side: "right",
        align: "start",
      },
    },
    {
      element: "#p2p-chat",
      popover: {
        title: "Chat P2P",
        description:
          "Giao tiếp trực tiếp với người mua/bán để thỏa thuận giao dịch.",
        side: "left",
        align: "start",
      },
    },
  ],
};

// Thêm các tour configs khác tùy theo nhu cầu...
