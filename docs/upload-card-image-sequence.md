# Sequence Diagram: Tải ảnh cho card

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ tải ảnh cho card trong module `deck`. Ảnh được tải lên kho lưu trữ trước, sau đó hệ thống lưu thông tin media tạm để frontend dùng cho các bước tạo hoặc cập nhật deck.

```mermaid
sequenceDiagram
	autonumber
	actor User
	participant FE as FE
	participant BE as BE
	participant DB as DB
	participant Redis as Redis
	participant ImageKit as ImageKit

	Note over User,ImageKit: Luồng tải ảnh cho card
	User->>FE: Chọn ảnh cho card
	FE->>BE: Gửi yêu cầu tải ảnh kèm access token và file ảnh
	BE->>BE: Kiểm tra access token và xác thực file ảnh
	BE->>Redis: Đối chiếu phiên đăng nhập hiện tại
	alt Token không hợp lệ hoặc phiên không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Yêu cầu đăng nhập lại
	else Phiên hợp lệ
		BE->>DB: Kiểm tra người dùng hiện tại
		alt Không tìm thấy người dùng
			BE-->>FE: Báo yêu cầu không hợp lệ
			FE-->>User: Hiển thị thông báo lỗi
		else Tìm thấy người dùng
			BE->>ImageKit: Tải ảnh lên kho lưu trữ
			alt Tải ảnh thất bại hoặc không nhận được thông tin file
				BE-->>FE: Báo tải ảnh thất bại
				FE-->>User: Hiển thị thông báo lỗi
			else Tải ảnh thành công
				BE->>DB: Lưu media tạm cho người dùng hiện tại
				BE-->>FE: Trả về url và fileId
				FE-->>User: Nhận thông tin ảnh để dùng cho card
			end
		end
	end
```
