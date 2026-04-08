# Sequence Diagram: Đăng nhập bằng Magic Link

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ đăng nhập bằng magic link. Người dùng yêu cầu nhận liên kết đăng nhập qua email, sau đó frontend dùng token trong liên kết để hoàn tất đăng nhập.

```mermaid
sequenceDiagram
	autonumber
	actor User
	participant FE as FE
	participant BE as BE
	participant DB as DB
	participant Redis as Redis

	Note over User,Redis: Bước 1 - Yêu cầu gửi magic link
	User->>FE: Nhập email đăng nhập
	FE->>BE: Gửi yêu cầu nhận magic link
	BE->>BE: Tạo token đăng nhập và gửi email chứa magic link
	BE->>Redis: Lưu token đăng nhập tạm thời
	BE-->>FE: Thành công
	FE-->>User: Thông báo kiểm tra email

	Note over User,Redis: Bước 2 - Mở magic link
	User->>FE: Mở liên kết đăng nhập từ email
	FE->>BE: Gửi yêu cầu verify token
	BE->>Redis: Kiểm tra token đăng nhập tạm thời
	alt Token không tồn tại hoặc đã hết hạn
		BE-->>FE: Báo token không hợp lệ
		FE-->>User: Hiển thị thông báo lỗi
	else Token hợp lệ
		BE->>DB: Tìm người dùng theo email
		alt Người dùng chưa tồn tại
			BE->>BE: Tạo username tự động và khởi tạo tài khoản
			BE->>DB: Tạo tài khoản mới với email đã xác thực
		else Người dùng đã tồn tại
			BE->>BE: Sử dụng tài khoản hiện có
		end
		BE->>BE: Tạo phiên đăng nhập và token truy cập
		BE->>Redis: Lưu phiên đăng nhập và xóa token tạm thời
		BE->>DB: Lưu thay đổi nếu có
		BE-->>FE: Trả về access token và refresh token
		FE-->>User: Đăng nhập thành công
	end
```
