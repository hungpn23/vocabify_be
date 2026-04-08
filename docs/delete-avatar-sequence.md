# Sequence Diagram: Xóa avatar

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ xóa avatar trong module `user`. Hệ thống chỉ cho phép xóa avatar đang gắn với chính người dùng hiện tại.

```mermaid
sequenceDiagram
	autonumber
	actor User
	participant FE as FE
	participant BE as BE
	participant DB as DB
	participant Redis as Redis
	participant ImageKit as ImageKit

	Note over User,ImageKit: Luồng xóa avatar
	User->>FE: Chọn xóa avatar
	FE->>BE: Gửi yêu cầu xóa avatar kèm access token và fileId
	BE->>BE: Kiểm tra access token
	BE->>Redis: Đối chiếu phiên đăng nhập hiện tại
	alt Token không hợp lệ hoặc phiên không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Hiển thị thông báo lỗi
	else Phiên hợp lệ
		BE->>DB: Kiểm tra người dùng có avatar đúng với fileId hay không
		alt Không tìm thấy avatar phù hợp
			BE-->>FE: Báo yêu cầu không hợp lệ
			FE-->>User: Hiển thị thông báo lỗi
		else Tìm thấy avatar hợp lệ
			BE->>ImageKit: Xóa file avatar khỏi kho lưu trữ
			BE->>DB: Xóa thông tin avatar khỏi hồ sơ người dùng
			BE-->>FE: Thành công
			FE-->>User: Xóa avatar thành công
		end
	end
```
