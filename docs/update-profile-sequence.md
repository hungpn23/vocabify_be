# Sequence Diagram: Cập nhật hồ sơ cá nhân

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ cập nhật hồ sơ cá nhân trong module `user`. Hệ thống yêu cầu người dùng đang có phiên đăng nhập hợp lệ trước khi cập nhật username.

```mermaid
sequenceDiagram
	autonumber
	actor User
	participant FE as FE
	participant BE as BE
	participant DB as DB
	participant Redis as Redis

	Note over User,Redis: Luồng cập nhật hồ sơ cá nhân
	User->>FE: Nhập username mới
	FE->>BE: Gửi yêu cầu cập nhật hồ sơ kèm access token
	BE->>BE: Kiểm tra access token
	BE->>Redis: Đối chiếu phiên đăng nhập hiện tại
	alt Token không hợp lệ hoặc phiên không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Hiển thị thông báo lỗi
	else Phiên hợp lệ
		BE->>DB: Tìm người dùng hiện tại
		alt Không tìm thấy người dùng
			BE-->>FE: Báo không tìm thấy tài khoản
			FE-->>User: Hiển thị thông báo lỗi
		else Tìm thấy người dùng
			BE->>DB: Kiểm tra username đã tồn tại chưa
			alt Username đã tồn tại
				BE-->>FE: Báo username đã được sử dụng
				FE-->>User: Yêu cầu nhập username khác
			else Username hợp lệ
				BE->>DB: Cập nhật hồ sơ người dùng
				BE-->>FE: Thành công
				FE-->>User: Cập nhật hồ sơ thành công
			end
		end
	end
```
