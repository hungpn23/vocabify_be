# Sequence Diagram: Xem chi tiết deck cá nhân

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ xem chi tiết một deck cá nhân trong module `deck`. Khi mở deck thành công, hệ thống cập nhật thời điểm mở gần nhất của deck đó.

```mermaid
sequenceDiagram
	autonumber
	actor User
	participant FE as FE
	participant BE as BE
	participant DB as DB
	participant Redis as Redis

	Note over User,Redis: Luồng xem chi tiết deck cá nhân
	User->>FE: Chọn một deck của mình
	FE->>BE: Gửi yêu cầu lấy chi tiết deck kèm access token
	BE->>BE: Kiểm tra access token
	BE->>Redis: Đối chiếu phiên đăng nhập hiện tại
	alt Token không hợp lệ hoặc phiên không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Yêu cầu đăng nhập lại
	else Phiên hợp lệ
		BE->>DB: Tìm deck thuộc người dùng hiện tại và lấy danh sách card
		alt Không tìm thấy deck phù hợp
			BE-->>FE: Báo không tìm thấy deck
			FE-->>User: Hiển thị thông báo lỗi
		else Tìm thấy deck
			BE->>DB: Cập nhật thời điểm mở deck
			BE-->>FE: Trả về chi tiết deck và danh sách card
			FE-->>User: Hiển thị chi tiết deck
		end
	end
```
