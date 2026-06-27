export const providerRegistrationSteps = [
  {
    id: 1,
    label: "Tài khoản",
    description: "Tạo tài khoản provider và thông tin doanh nghiệp",
  },
  {
    id: 2,
    label: "Xác minh",
    description: "CCCD, giấy phép, ảnh và thanh toán",
  },
  {
    id: 3,
    label: "Hoàn tất",
    description: "Kiểm tra lại và gửi hồ sơ",
  },
] as const;

export const providerRegistrationHeader = {
  title: "Đăng ký tài khoản nhà cung cấp",
  description:
    "Hoàn tất 3 bước để tạo tài khoản provider và gửi hồ sơ doanh nghiệp chờ quản trị viên duyệt.",
};
