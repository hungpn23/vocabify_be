# Sequence Diagram: Làm mới phiên đăng nhập

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ làm mới phiên đăng nhập bằng refresh token. Hệ thống chỉ chấp nhận refresh token còn hiệu lực và đang gắn với phiên hợp lệ trong Redis.

```mermaid
sequenceDiagram
	autonumber
	actor User
	participant FE as FE
	participant BE as BE
	participant Redis as Redis

	Note over User,Redis: Luồng làm mới phiên đăng nhập
	User->>FE: Thực hiện thao tác khi access token hết hạn
	FE->>BE: Gửi refresh token
	BE->>BE: Giải mã và kiểm tra refresh token
	BE->>Redis: Đối chiếu phiên đăng nhập hiện tại
	alt Token không hợp lệ hoặc phiên không còn hiệu lực
		BE-->>FE: Báo không được phép làm mới phiên
		FE-->>User: Yêu cầu đăng nhập lại
	else Token hợp lệ
		BE->>BE: Tạo access token và refresh token mới
		BE->>Redis: Cập nhật lại phiên đăng nhập
		BE-->>FE: Trả về bộ token mới
		FE-->>User: Tiếp tục sử dụng hệ thống
	end
```
