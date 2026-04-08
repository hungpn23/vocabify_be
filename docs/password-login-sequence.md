# Sequence Diagram: Đăng nhập bằng email và mật khẩu

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ đăng nhập bằng email và mật khẩu. Khi thông tin hợp lệ, hệ thống tạo phiên đăng nhập và trả về bộ token cho frontend.

```mermaid
sequenceDiagram
	autonumber
	actor User
	participant FE as FE
	participant BE as BE
	participant DB as DB
	participant Redis as Redis

	Note over User,Redis: Luồng đăng nhập bằng email và mật khẩu
	User->>FE: Nhập email và mật khẩu
	FE->>BE: Gửi yêu cầu đăng nhập
	BE->>DB: Tìm người dùng theo email
	BE->>BE: Đối chiếu mật khẩu
	alt Thông tin đăng nhập không hợp lệ
		BE-->>FE: Báo sai thông tin đăng nhập
		FE-->>User: Hiển thị thông báo lỗi
	else Thông tin hợp lệ
		BE->>BE: Tạo phiên đăng nhập và token truy cập
		BE->>Redis: Lưu phiên đăng nhập
		BE-->>FE: Trả về access token và refresh token
		FE-->>User: Đăng nhập thành công
	end
```
