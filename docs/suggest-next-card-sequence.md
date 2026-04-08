# Sequence Diagram: Gợi ý thẻ tiếp theo

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ gợi ý thẻ tiếp theo dựa trên độ tương đồng nội dung. Hệ thống tìm các mục gần nghĩa trong vector database, sau đó lấy thông tin thẻ tương ứng từ cơ sở dữ liệu.

```mermaid
sequenceDiagram
	autonumber
	actor User
	participant FE as FE
	participant BE as BE
	participant DB as DB
	participant Redis as Redis
	participant VectorDB as Vector DB

	Note over User,VectorDB: Luồng gợi ý thẻ tiếp theo
	User->>FE: Yêu cầu gợi ý thẻ tiếp theo
	FE->>BE: Gửi yêu cầu kèm access token, term và definition
	BE->>BE: Kiểm tra access token
	BE->>Redis: Đối chiếu phiên đăng nhập hiện tại
	alt Token không hợp lệ hoặc phiên không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Yêu cầu đăng nhập lại
	else Phiên hợp lệ
		BE->>BE: Tạo nội dung truy vấn từ term và definition
		BE->>VectorDB: Tìm các mục tương đồng
		BE->>DB: Lấy thông tin thẻ tương ứng theo kết quả tìm kiếm
		BE->>BE: Loại bỏ thẻ trùng với từ hiện tại
		BE-->>FE: Trả về danh sách gợi ý
		FE-->>User: Hiển thị các thẻ gợi ý tiếp theo
	end
```
