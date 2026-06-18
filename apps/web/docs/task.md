# TÀI LIỆU KHẢO SÁT & DANH SÁCH TÍNH NĂNG CHI TIẾT (PRODUCT BACKLOG)

## Dự án: PetLink - Nền tảng Đặt lịch Dịch vụ Thú y & Spa Thú cưng Đa nhà cung cấp

---

## 1. HƯỚNG DẪN TỔNG QUAN VỀ HỆ THỐNG

Tài liệu này chuẩn hóa và phân rã chi tiết toàn bộ các tính năng nghiệp vụ của dự án **PetLink** từ tài liệu SRS.

- **Mục tiêu:** Cung cấp thông tin chi tiết về mặt nghiệp vụ, điều kiện logic, và mô tả trải nghiệm người dùng giúp Agent/Developer hiểu rõ cách thức hoạt động của từng màn hình dựa trên khung UI/UX sẵn có.
- **Phạm vi:** Tập trung vào 4 vai trò vận hành trên hệ thống: **Guest**, **User (Pet Owner)**, **Service Provider**, và **Admin**.

---

## 2. QUY ĐỊNH CHUNG VỀ TRẠNG THÁI NGHIỆP VỤ (GLOBAL BUSINESS RULES)

### 2.1. Vòng đời của một Lịch hẹn (Booking Status)

- `PENDING` (Chờ duyệt): Lịch hẹn vừa được User đặt, chờ phía cơ sở xác nhận tiếp nhận.
- `CONFIRMED` (Đã xác nhận): Cơ sở dịch vụ chấp nhận lịch hẹn và giữ chỗ cho khách.
- `IN_PROGRESS` (Đang thực hiện): Thú cưng đã đến cơ sở và đang trong quá trình làm dịch vụ/khám bệnh.
- `COMPLETED` (Hoàn thành): Dịch vụ kết thúc, thanh toán thành công, mở quyền đánh giá và cập nhật sổ sức khỏe.
- `CANCELLED` (Đã hủy): Lịch hẹn bị hủy bỏ bởi User hoặc Cơ sở (bắt buộc kèm lý do hủy).

### 2.2. Phương thức thanh toán áp dụng

- Thanh toán trực tiếp (`CASH`): Khách hàng thanh toán tiền mặt/chuyển khoản tại quầy khi hoàn thành.
- Thanh toán trực tuyến (`ONLINE_MOMO`): Khách hàng thanh toán qua cổng điện tử MoMo ngay khi đặt lịch.

---

## 3. CHI TIẾT TÍNH NĂNG THEO TỪNG VAI TRÒ (ROLE)

### 3.1. PHÂN HỆ GUEST (KHÁCH VÃNG LAI)

#### Tính năng G-01: Khám phá Công khai & Giới hạn Quyền hạn

- **Mô tả chức năng:** Cho phép người dùng chưa đăng nhập tham quan hệ thống và tìm kiếm thông tin cơ bản.
- **Quy tắc nghiệp vụ & Logic xử lý:**
  - Guest được phép xem: Trang chủ, danh sách các cơ sở, bảng giá công khai, các bài viết blog/chia sẻ kiến thức nuôi thú cưng và các đánh giá từ khách hàng khác.
  - Hệ thống áp dụng cơ chế chặn (Route Guard): Khi Guest bấm vào các nút hành động như "Đặt lịch", "Chat với cửa hàng", "Thêm thú cưng", hoặc "Viết đánh giá", hệ thống sẽ tự động hiển thị Modal yêu cầu Đăng ký/Đăng nhập.
- **Yêu cầu Giao diện (UI Context):**
  1. Hiển thị Banner mời gọi đăng ký tài khoản ở các vị trí chiến lược (cuối bài blog, trang chi tiết dịch vụ).
  2. Thanh tìm kiếm cơ bản hỗ trợ tìm nhanh theo tên cơ sở hoặc tên dịch vụ ngay tại trang chủ mà không cần tài khoản.

---

### 3.2. PHÂN HỆ USER (PET OWNER)

#### Tính năng PO-01: Quản lý Tài khoản cá nhân

- **Mô tả chức năng:** Giúp người dùng đăng ký, đăng nhập và cá nhân hóa tài khoản cá nhân.
- **Quy tắc nghiệp vụ:** Hỗ trợ luồng Đăng ký, Đăng nhập, Đổi mật khẩu, Quên mật khẩu qua Email. Cho phép thay đổi thông tin liên hệ (Số điện thoại, địa chỉ) và tải lên hình ảnh đại diện (Avatar).

#### Tính năng PO-02: Quản lý Hồ sơ Thú cưng (Pet Portfolio)

- **Mô tả chức năng:** Cho phép chủ nuôi tạo, sửa, xóa và lưu trữ thông tin của nhiều thú cưng để chọn nhanh khi đặt lịch hẹn.
- **Quy tắc nghiệp vụ:**
  - Nhập các trường: Tên, Loài (Chó, Mèo, Khác), Giống, Giới tính, Ngày sinh, Cân nặng, Ảnh và Tình trạng sức khỏe hiện tại.
  - Ngày sinh không được là ngày tương lai; Cân nặng bắt buộc phải lớn hơn 0.
- **Yêu cầu Giao diện:** Thiết kế dạng lưới (Grid Cards). Thú cưng có "Ghi chú y tế" đặc biệt (dị ứng, bệnh nền) bắt buộc phải hiển thị nhãn cảnh báo màu đỏ trực quan.

#### Tính năng PO-03: Bộ lọc Tìm kiếm Nâng cao (Advanced Service Discovery)

- **Mô tả chức năng:** Tìm kiếm nâng cao theo Vị trí, Khoảng cách, Giá cả, và Điểm đánh giá trung bình.
- **Quy tắc nghiệp vụ:** Phân loại rõ ràng theo 7 nhóm dịch vụ: Khám bệnh, Tiêm phòng, Spa, Grooming, Khách sạn thú cưng, Huấn luyện, Chăm sóc tại nhà.

#### Tính năng PO-04: Luồng Đặt lịch & Quản lý Lịch hẹn (Booking Workflow)

- **Mô tả chức năng:** Quy trình các bước để người dùng chọn dịch vụ, thời gian và quản lý trạng thái lịch hẹn.
- **Quy tắc nghiệp vụ & Logic xử lý:**
  - **Đặt lịch:** Hiển thị thời gian thực các khung giờ còn trống (Time Slots). Khung giờ đã kín hoặc quá tải sẽ tự động khóa.
  - **Hủy lịch:** Chỉ được hủy khi ở trạng thái `PENDING` hoặc `CONFIRMED` trước giờ hẹn tối thiểu 2 tiếng (Yêu cầu nhập lý do).
  - **Đổi lịch (Reschedule):** Cho phép người dùng yêu cầu đổi Ngày/Giờ hẹn mới (trước giờ hẹn 2 tiếng). Trạng thái sau khi đổi sẽ quay về `PENDING` để cơ sở duyệt lại.
- **Yêu cầu Giao diện:** Sử dụng thiết kế dạng các bước nối tiếp (Wizard/Stepper UI). Màn hình hoàn thành hiển thị Mã QR Code định danh để check-in nhanh tại cửa hàng.

#### Tính năng PO-05: Thanh toán & Quản lý Hóa đơn

- **Mô tả chức năng:** Hỗ trợ thanh toán qua cổng MoMo hoặc thanh toán tiền mặt tại cửa hàng. Cho phép xem lại chi tiết hóa đơn và lịch sử giao dịch trực quan.

#### Tính năng PO-06: Đánh giá & Phản hồi (Review & Rating)

- **Mô tả chức năng:** Cho phép đánh giá (Rating sao từ 1-5) và viết bình luận kèm tối đa 3 hình ảnh thực tế. Tính năng chỉ kích hoạt khi lịch hẹn đạt trạng thái `COMPLETED`. Mỗi lịch hẹn chỉ được đánh giá 1 lần.

#### Tính năng PO-07: Trung tâm Thông báo (Notification Center)

- **Mô tả chức năng:** Nhận thông báo đa kênh (In-app, Email) về: Nhắc lịch hẹn sắp tới, Thông báo khi lịch được xác nhận/thay đổi/hủy từ phía cửa hàng, và các thông báo chương trình khuyến mãi toàn sàn.

#### Tính năng PO-08: Sổ sức khỏe điện tử (Electronic Health Record)

- **Mô tả chức năng:** Lưu trữ dòng thời gian (Timeline UI) y tế của thú cưng bao gồm: Lịch sử khám bệnh, lịch sử tiêm phòng, đơn thuốc được đồng bộ tự động từ hệ thống (khi lịch đạt trạng thái `COMPLETED`) hoặc do chủ nuôi tự nhập tay thủ công.

---

### 3.3. PHÂN HỆ SERVICE PROVIDER (NHÀ CUNG CẤP)

#### Tính năng SP-01: Quản lý Hồ sơ Doanh nghiệp (Business Profile)

- **Mô tả chức năng:** Thiết lập thông tin hiển thị của cửa hàng bao gồm: Thông tin liên hệ, địa chỉ bản đồ, hình ảnh cơ sở vật chất, và cấu hình khung giờ hoạt động (mở cửa/đóng cửa).

#### Tính năng SP-02: Cấu hình Danh mục Dịch vụ (Service Management)

- **Mô tả chức năng:** Quản lý danh sách dịch vụ của cơ sở. Hỗ trợ phân loại linh hoạt (Ví dụ: Spa gồm Tắm, Cắt tỉa; Clinic gồm Khám tổng quát, Tiêm vaccine). Có công tắc (Toggle Switch) để Bật/Tắt hoạt động của dịch vụ ngay lập tức trên sàn.

#### Tính năng SP-03: Quản lý Giá & Gói Combo (Pricing & Promotions)

- **Mô tả chức năng:** Thiết lập bảng giá riêng biệt cho từng dịch vụ. Hỗ trợ tạo các chương trình khuyến mãi giảm giá hoặc tự ghép các dịch vụ lẻ thành "Gói Combo" giá ưu đãi kèm thời hạn áp dụng cụ thể.

#### Tính năng SP-04: Bảng điều khiển Quản lý Đặt lịch (Booking Board)

- **Mô tả chức năng:** Nhân viên tiếp nhận lịch (`CONFIRMED`), từ chối (`REJECTED` kèm lý do), hoặc chuyển trạng thái lên `IN_PROGRESS` và `COMPLETED`.
- **Yêu cầu Giao diện:** Giao diện Kanban Board (Chờ duyệt | Đã xác nhận | Đang thực hiện | Hoàn thành) hỗ trợ kéo thả. Hệ thống phải phát âm thanh cảnh báo thời gian thực khi có lịch `PENDING` mới.

#### Tính năng SP-05: Quản lý Khách hàng & Lịch sử Dịch vụ

- **Mô tả chức năng:** Xem danh sách khách hàng và danh sách thú cưng đã từng sử dụng dịch vụ tại cơ sở. Cho phép bác sĩ/nhân viên truy xuất nhanh lịch sử y tế và ghi chú đơn thuốc mới sau khi hoàn thành dịch vụ để đồng bộ vào sổ sức khỏe của thú cưng.

#### Tính năng SP-06: Báo cáo Thống kê Doanh thu (Revenue Dashboard)

- **Mô tả chức năng:** Thống kê doanh thu theo bộ lọc ngày/tháng bằng biểu đồ đường (Line Chart). Phân tích dữ liệu tự động về: Các dịch vụ được đặt nhiều nhất và Tỷ lệ hủy lịch (Cancellation rate). Cảnh báo màu đỏ nếu tỷ lệ hủy > 15%.

#### Tính năng SP-07: Giao tiếp & Tương tác Khách hàng

- **Mô tả chức năng:**
  - Tích hợp hộp thoại Chat trực tiếp (Real-time Chat) với chủ thú cưng để tư vấn trước khi đặt lịch hoặc trao đổi tình hình thú cưng đang gửi tại cửa hàng.
  - Cho phép cơ sở viết phản hồi (Reply) trực tiếp dưới các bài đánh giá/bình luận của khách hàng.

---

### 3.4. PHÂN HỆ ADMIN (QUẢN TRỊ VIÊN HỆ THỐNG)

#### Tính năng A-01: Quản lý Tài khoản & Chế tài Xử phạt (User Control)

- **Mô tả chức năng:** Quản lý toàn bộ danh sách Pet Owner và Service Provider dưới dạng Datatable lớn. Thực hiện lệnh Khóa (`BAN` có thời hạn hoặc vĩnh viễn kèm lý do) giúp đăng xuất cưỡng chế (Force Logout) các tài khoản vi phạm chính sách hoặc spam.

#### Tính năng A-02: Xác thực Nhà cung cấp mới (Provider Verification)

- **Mô tả chức năng:** Quy trình kiểm duyệt hồ sơ đăng ký kinh doanh của các đối tác mới.
- **Yêu cầu Giao diện:** Thiết kế màn hình chia đôi (Split View), cho phép xem trực tiếp (File Viewer) các giấy tờ pháp lý, chứng chỉ thú y dạng PDF/Ảnh mà không cần tải về máy trước khi bấm "Phê duyệt" hoặc "Từ chối".

#### Tính năng A-03: Kiểm duyệt Nội dung & Xử lý Báo cáo (Service Moderation)

- **Mô tả chức năng:**
  - Kiểm duyệt thông tin dịch vụ, hình ảnh và bảng giá của các Provider đẩy lên sàn nhằm tránh thông tin sai lệch hoặc vi phạm pháp luật.
  - Tiếp nhận và xử lý các báo cáo (Report) khiếu nại từ người dùng về các cơ sở cung cấp dịch vụ kém chất lượng.

#### Tính năng A-04: Giám sát Đặt lịch & Giải quyết Tranh chấp

- **Mô tả chức năng:** Theo dõi tổng quan luồng đặt lịch trên toàn sàn. Đóng vai trò trọng tài can thiệp trực tiếp vào các ca tranh chấp tiền bạc hoặc dịch vụ lỗi giữa hai bên để đưa ra quyết định hoàn tiền (Refund) hoặc đóng khiếu nại (Ghi nhận doanh thu cho cơ sở). Có lưu nhật ký hệ thống (Audit Log).

#### Tính năng A-05: Bảng điều khiển Phân tích Toàn sàn (Analytics Dashboard)

- **Mô tả chức năng:** Thống kê số lượng biểu đồ về Tổng số User, Tổng số Booking và doanh thu hoa hồng/phí đăng ký mà nền tảng thu được. Xuất bảng xếp hạng Top dịch vụ thịnh hành và Top Provider xuất sắc nhất theo tháng.

#### Tính năng A-06: Quản trị Banner & Mã giảm giá Toàn sàn

- **Mô tả chức năng:** Quản lý kéo thả thay đổi thứ tự hiển thị của các Banner quảng cáo trên Trang chủ. Tạo mã giảm giá (Coupon), chương trình Flash Sale áp dụng chung cho toàn bộ hệ thống.
