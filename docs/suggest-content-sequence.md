# Sequence Diagram: Gợi ý nội dung từ từ vựng

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ lấy gợi ý nội dung cho một từ vựng. Hệ thống ưu tiên lấy kết quả từ cache, nếu chưa có thì tìm trong dữ liệu từ vựng và lưu lại để tái sử dụng.

```mermaid
sequenceDiagram
	autonumber
	actor User
	participant FE as FE
	participant BE as BE
	participant DB as DB
	participant Redis as Redis

	Note over User,Redis: Luồng gợi ý nội dung
	User->>FE: Yêu cầu gợi ý nội dung cho một từ
	FE->>BE: Gửi yêu cầu kèm access token và thông tin từ vựng
	BE->>BE: Kiểm tra access token
	BE->>Redis: Đối chiếu phiên đăng nhập hiện tại
	alt Token không hợp lệ hoặc phiên không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Yêu cầu đăng nhập lại
	else Phiên hợp lệ
		BE->>Redis: Kiểm tra cache gợi ý
		alt Đã có dữ liệu trong cache
			BE-->>FE: Trả về nội dung gợi ý từ cache
			FE-->>User: Hiển thị nội dung gợi ý
		else Chưa có cache
			BE->>DB: Tìm dữ liệu gợi ý phù hợp
			alt Không tìm thấy dữ liệu
				BE-->>FE: Báo không tìm thấy gợi ý
				FE-->>User: Hiển thị thông báo lỗi
			else Tìm thấy dữ liệu
				BE->>Redis: Lưu kết quả vào cache có thời hạn
				BE-->>FE: Trả về nội dung gợi ý
				FE-->>User: Hiển thị nội dung gợi ý
			end
		end
	end
```
