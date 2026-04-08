# Sequence Diagram: Đăng nhập bằng Google

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ đăng nhập bằng Google. Sau khi Google xác thực thành công, backend tạo một mã đăng nhập tạm thời, chuyển hướng về frontend, rồi hoàn tất đăng nhập thông qua bước xác minh mã này.

```mermaid
sequenceDiagram
	autonumber
	actor User
	participant FE as FE
	participant Google as Google
	participant BE as BE
	participant DB as DB
	participant Redis as Redis

	Note over User,Redis: Bước 1 - Xác thực với Google
	User->>FE: Chọn đăng nhập bằng Google
	FE->>Google: Chuyển người dùng sang Google để xác thực
	Google-->>User: Xác thực tài khoản Google
	Google->>BE: Gọi callback kèm authorization code
	BE->>Google: Đổi code lấy id_token
	BE->>BE: Giải mã id_token để lấy email
	BE->>Redis: Tạo token đăng nhập tạm thời
	BE-->>FE: Redirect về FE kèm action và token

	Note over User,Redis: Bước 2 - Xác minh token đăng nhập
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
