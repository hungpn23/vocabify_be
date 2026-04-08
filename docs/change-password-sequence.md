# Sequence Diagram: Đổi mật khẩu

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ đổi mật khẩu khi người dùng đang đăng nhập. Hệ thống yêu cầu xác thực phiên hiện tại và kiểm tra mật khẩu cũ trước khi cập nhật.

```mermaid
sequenceDiagram
	autonumber
	actor User
	participant FE as FE
	participant BE as BE
	participant DB as DB
	participant Redis as Redis

	Note over User,Redis: Luồng đổi mật khẩu
	User->>FE: Nhập mật khẩu cũ và mật khẩu mới
	FE->>BE: Gửi yêu cầu đổi mật khẩu kèm access token
	BE->>BE: Kiểm tra access token
	BE->>Redis: Đối chiếu phiên đăng nhập hiện tại
	alt Token không hợp lệ hoặc phiên không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Hiển thị thông báo lỗi
	else Phiên hợp lệ
		BE->>DB: Lấy thông tin người dùng
		alt Tài khoản không có mật khẩu hoặc không hợp lệ
			BE-->>FE: Báo không thể đổi mật khẩu
			FE-->>User: Hiển thị thông báo lỗi
		else Có thể xử lý
			BE->>BE: Đối chiếu mật khẩu cũ
			alt Mật khẩu cũ không đúng
				BE-->>FE: Báo sai thông tin xác thực
				FE-->>User: Hiển thị thông báo lỗi
			else Mật khẩu cũ đúng
				BE->>BE: Kiểm tra mật khẩu mới có trùng mật khẩu cũ không
				alt Mật khẩu mới trùng mật khẩu cũ
					BE-->>FE: Báo mật khẩu mới không hợp lệ
					FE-->>User: Yêu cầu nhập mật khẩu khác
				else Mật khẩu mới hợp lệ
					BE->>DB: Cập nhật mật khẩu mới
					BE-->>FE: Thành công
					FE-->>User: Đổi mật khẩu thành công
				end
			end
		end
	end
```
