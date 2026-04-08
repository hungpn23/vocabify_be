# Sequence Diagram: Khởi động lại tiến độ deck

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ khởi động lại tiến độ học của một deck trong module `deck`. Hệ thống đưa toàn bộ card trong deck về trạng thái học lại từ đầu.

```mermaid
sequenceDiagram
	autonumber
	actor User
	participant FE as FE
	participant BE as BE
	participant DB as DB
	participant Redis as Redis

	Note over User,Redis: Luồng khởi động lại tiến độ deck
	User->>FE: Chọn restart deck
	FE->>BE: Gửi yêu cầu restart deck kèm access token
	BE->>BE: Kiểm tra access token
	BE->>Redis: Đối chiếu phiên đăng nhập hiện tại
	alt Token không hợp lệ hoặc phiên không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Yêu cầu đăng nhập lại
	else Phiên hợp lệ
		BE->>DB: Tìm deck thuộc người dùng hiện tại
		alt Không tìm thấy deck phù hợp
			BE-->>FE: Báo không tìm thấy deck
			FE-->>User: Hiển thị thông báo lỗi
		else Tìm thấy deck
			BE->>DB: Lấy toàn bộ card trong deck
			BE->>DB: Reset streak và reviewDate của tất cả card
			BE-->>FE: Thành công
			FE-->>User: Restart deck thành công
		end
	end
```
