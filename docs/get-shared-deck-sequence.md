# Sequence Diagram: Xem chi tiết deck chia sẻ

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ xem chi tiết một deck chia sẻ trong module `deck`. Luồng này hỗ trợ guest và user; nếu người dùng đã đăng nhập thì hệ thống không trả về deck của chính họ trong màn hình chia sẻ.

```mermaid
sequenceDiagram
	autonumber
	actor Visitor
	participant FE as FE
	participant BE as BE
	participant DB as DB
	participant Redis as Redis

	Note over Visitor,Redis: Luồng xem chi tiết deck chia sẻ
	Visitor->>FE: Chọn một deck chia sẻ
	FE->>BE: Gửi yêu cầu lấy chi tiết deck
	alt Có phiên đăng nhập hợp lệ
		BE->>BE: Kiểm tra access token
		BE->>Redis: Đối chiếu phiên đăng nhập hiện tại
		BE->>DB: Tìm deck public/protected và không thuộc người dùng hiện tại
	else Không có phiên hợp lệ
		BE->>DB: Tìm deck public/protected
	end
	alt Không tìm thấy deck phù hợp
		BE-->>FE: Báo không tìm thấy deck
		FE-->>Visitor: Hiển thị thông báo lỗi
	else Tìm thấy deck
		BE->>DB: Tăng lượt xem deck
		BE-->>FE: Trả về chi tiết deck, owner, preview cards và totalCards
		FE-->>Visitor: Hiển thị chi tiết deck chia sẻ
	end
```
