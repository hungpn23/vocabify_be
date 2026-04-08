# Sequence Diagram: Tải avatar

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ tải avatar trong module `user`. Hệ thống kiểm tra phiên đăng nhập, xác thực tệp ảnh, tải ảnh mới lên kho lưu trữ, sau đó cập nhật hồ sơ người dùng.

```mermaid
sequenceDiagram
	autonumber
	actor User
	participant FE as FE
	participant BE as BE
	participant DB as DB
	participant Redis as Redis
	participant ImageKit as ImageKit

	Note over User,ImageKit: Luồng tải avatar
	User->>FE: Chọn ảnh đại diện
	FE->>BE: Gửi yêu cầu tải avatar kèm access token và file ảnh
	BE->>BE: Kiểm tra access token và xác thực file ảnh
	BE->>Redis: Đối chiếu phiên đăng nhập hiện tại
	alt Token không hợp lệ hoặc phiên không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Hiển thị thông báo lỗi
	else Phiên hợp lệ
		BE->>DB: Tìm người dùng hiện tại
		alt Không tìm thấy người dùng
			BE-->>FE: Báo yêu cầu không hợp lệ
			FE-->>User: Hiển thị thông báo lỗi
		else Tìm thấy người dùng
			BE->>ImageKit: Tải ảnh mới lên kho lưu trữ
			alt Tải ảnh thất bại hoặc không nhận được thông tin file
				BE-->>FE: Báo tải avatar thất bại
				FE-->>User: Hiển thị thông báo lỗi
			else Tải ảnh thành công
				BE->>DB: Cập nhật avatar mới cho người dùng
				alt Người dùng đã có avatar cũ
					BE->>ImageKit: Xóa avatar cũ
					BE->>BE: Nếu xóa avatar cũ lỗi thì chỉ ghi log
				else Chưa có avatar cũ
					BE->>BE: Bỏ qua bước xóa avatar cũ
				end
				BE-->>FE: Thành công
				FE-->>User: Cập nhật avatar thành công
			end
		end
	end
```
