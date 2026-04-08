# Sequence Diagram: Đánh dấu một thông báo đã đọc

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ đánh dấu một thông báo là đã đọc. Hệ thống chỉ cho phép cập nhật nếu thông báo thuộc về đúng người dùng hiện tại.

```mermaid
sequenceDiagram
	autonumber
	actor User
	participant FE as FE
	participant BE as BE
	participant DB as DB
	participant Redis as Redis

	Note over User,Redis: Luồng đánh dấu một thông báo đã đọc
	User->>FE: Chọn một thông báo
	FE->>BE: Gửi yêu cầu đánh dấu đã đọc kèm access token và notificationId
	BE->>BE: Kiểm tra access token
	BE->>Redis: Đối chiếu phiên đăng nhập hiện tại
	alt Token không hợp lệ hoặc phiên không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Yêu cầu đăng nhập lại
	else Phiên hợp lệ
		BE->>DB: Tìm thông báo theo notificationId và người nhận hiện tại
		alt Không tìm thấy thông báo phù hợp
			BE-->>FE: Báo không tìm thấy thông báo
			FE-->>User: Hiển thị thông báo lỗi
		else Tìm thấy thông báo
			BE->>DB: Cập nhật trạng thái đã đọc
			BE-->>FE: Thành công
			FE-->>User: Thông báo được đánh dấu đã đọc
		end
	end
```
