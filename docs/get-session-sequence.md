# Sequence Diagram: Lấy thông tin phiên hiện tại

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ lấy thông tin phiên đăng nhập hiện tại. Hệ thống chỉ trả dữ liệu khi access token hợp lệ và còn gắn với phiên đang hoạt động.

```mermaid
sequenceDiagram
	autonumber
	actor User
	participant FE as FE
	participant BE as BE
	participant DB as DB
	participant Redis as Redis

	rect rgb(245, 248, 255)
	Note over User,Redis: Luồng lấy thông tin phiên hiện tại
	User->>FE: Mở ứng dụng hoặc tải lại trang
	FE->>BE: Gửi yêu cầu lấy thông tin phiên kèm access token
	BE->>BE: Kiểm tra access token
	BE->>Redis: Đối chiếu phiên đăng nhập hiện tại
	alt Token không hợp lệ hoặc phiên không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Yêu cầu đăng nhập lại
	else Phiên hợp lệ
		BE->>DB: Lấy thông tin người dùng
		alt Không tìm thấy người dùng
			BE-->>FE: Báo không được phép truy cập
			FE-->>User: Yêu cầu đăng nhập lại
		else Tìm thấy người dùng
			BE-->>FE: Trả về thông tin phiên hiện tại
			FE-->>User: Hiển thị trạng thái đã đăng nhập
		end
	end
	end
```
