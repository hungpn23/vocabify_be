# Sequence Diagram: Xem danh sách deck cá nhân

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ xem danh sách deck cá nhân trong module `deck`. Hệ thống chỉ trả dữ liệu khi người dùng có phiên đăng nhập hợp lệ.

```mermaid
sequenceDiagram
	autonumber
	actor User
	participant FE as FE
	participant BE as BE
	participant DB as DB
	participant Redis as Redis

	Note over User,Redis: Luồng xem danh sách deck cá nhân
	User->>FE: Mở danh sách deck của tôi
	FE->>BE: Gửi yêu cầu lấy danh sách deck kèm access token
	BE->>BE: Kiểm tra access token
	BE->>Redis: Đối chiếu phiên đăng nhập hiện tại
	alt Token không hợp lệ hoặc phiên không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Yêu cầu đăng nhập lại
	else Phiên hợp lệ
		BE->>DB: Lấy các deck thuộc người dùng hiện tại
		BE->>DB: Áp dụng search, sort và pagination
		BE->>BE: Tính thống kê card cho từng deck
		BE-->>FE: Trả về danh sách deck và metadata
		FE-->>User: Hiển thị danh sách deck cá nhân
	end
```
