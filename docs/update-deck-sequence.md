# Sequence Diagram: Cập nhật deck

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ cập nhật deck trong module `deck`. Luồng này hỗ trợ cập nhật thông tin deck, thay đổi visibility/passcode và đồng bộ lại danh sách card.

```mermaid
sequenceDiagram
	autonumber
	actor User
	participant FE as FE
	participant BE as BE
	participant DB as DB
	participant Redis as Redis

	Note over User,Redis: Luồng cập nhật deck
	User->>FE: Chỉnh sửa thông tin deck
	FE->>BE: Gửi yêu cầu cập nhật deck kèm access token
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
			opt Có thay đổi tên deck
				BE->>DB: Kiểm tra tên deck mới có bị trùng không
				alt Tên deck bị trùng
					BE-->>FE: Báo deck đã tồn tại
					FE-->>User: Yêu cầu nhập tên khác
				end
			end
			opt Có thay đổi visibility
				alt Visibility là protected nhưng thiếu passcode
					BE-->>FE: Báo passcode không hợp lệ
					FE-->>User: Bổ sung passcode
				else Visibility hợp lệ
					BE->>BE: Chuẩn hóa visibility và passcode
				end
			end
			opt Có gửi danh sách card mới
				BE->>DB: Đồng bộ card hiện có, card mới và card bị loại bỏ
			end
			BE->>DB: Cập nhật thông tin deck
			BE-->>FE: Thành công
			FE-->>User: Cập nhật deck thành công
		end
	end
```
