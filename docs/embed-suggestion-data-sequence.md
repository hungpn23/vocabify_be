# Sequence Diagram: Nhúng dữ liệu gợi ý

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ nhúng dữ liệu gợi ý vào vector database. Luồng này chỉ dành cho admin để chuẩn bị dữ liệu phục vụ chức năng gợi ý.

```mermaid
sequenceDiagram
	autonumber
	actor Admin
	participant FE as FE
	participant BE as BE
	participant Redis as Redis
	participant VectorDB as Vector DB

	Note over Admin,VectorDB: Luồng nhúng dữ liệu gợi ý
	Admin->>FE: Chọn chạy tác vụ nhúng dữ liệu
	FE->>BE: Gửi yêu cầu kèm access token
	BE->>BE: Kiểm tra access token
	BE->>Redis: Đối chiếu phiên đăng nhập hiện tại
	alt Token không hợp lệ hoặc phiên không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>Admin: Yêu cầu đăng nhập lại
	else Phiên hợp lệ
		BE->>BE: Kiểm tra quyền admin
		alt Không có quyền admin
			BE-->>FE: Báo không được phép thực hiện
			FE-->>Admin: Hiển thị thông báo lỗi
		else Có quyền admin
			BE->>BE: Chuẩn bị dữ liệu và chia thành các lô
			loop Với từng lô dữ liệu
				BE->>VectorDB: Nhúng dữ liệu vào vector database
			end
			BE-->>FE: Thành công
			FE-->>Admin: Nhúng dữ liệu hoàn tất
		end
	end
```
