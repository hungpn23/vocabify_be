# Sequence Diagram: Xem danh sách deck chia sẻ

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ xem danh sách deck chia sẻ trong module `deck`. Luồng này là public, vì vậy guest vẫn có thể truy cập; nếu người dùng đã có phiên hợp lệ thì hệ thống sẽ không trả về deck của chính họ.

```mermaid
sequenceDiagram
	autonumber
	actor Visitor
	participant FE as FE
	participant BE as BE
	participant DB as DB
	participant Redis as Redis

	Note over Visitor,Redis: Luồng xem danh sách deck chia sẻ
	Visitor->>FE: Mở danh sách deck chia sẻ
	FE->>BE: Gửi yêu cầu lấy danh sách deck chia sẻ
	alt Có phiên đăng nhập hợp lệ
		BE->>BE: Kiểm tra access token
		BE->>Redis: Đối chiếu phiên đăng nhập hiện tại
		BE->>DB: Lấy các deck public/protected, loại deck của chính người dùng
	else Không có phiên hợp lệ
		BE->>DB: Lấy các deck public/protected
	end
	BE->>DB: Áp dụng search, sort và pagination
	BE-->>FE: Trả về danh sách deck và metadata
	FE-->>Visitor: Hiển thị danh sách deck chia sẻ
```
