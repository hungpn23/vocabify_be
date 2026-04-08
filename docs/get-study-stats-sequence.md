# Sequence Diagram: Xem thống kê học tập

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ xem thống kê học tập của người dùng. Nếu người dùng chưa có dữ liệu thống kê, hệ thống sẽ khởi tạo bản ghi mặc định trước khi trả kết quả.

```mermaid
sequenceDiagram
	autonumber
	actor User
	participant FE as FE
	participant BE as BE
	participant DB as DB
	participant Redis as Redis

	Note over User,Redis: Luồng xem thống kê học tập
	User->>FE: Mở màn hình thống kê học tập
	FE->>BE: Gửi yêu cầu lấy thống kê kèm access token
	BE->>BE: Kiểm tra access token
	BE->>Redis: Đối chiếu phiên đăng nhập hiện tại
	alt Token không hợp lệ hoặc phiên không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Yêu cầu đăng nhập lại
	else Phiên hợp lệ
		BE->>DB: Tìm thống kê học tập của người dùng
		alt Chưa có thống kê
			BE->>DB: Khởi tạo thống kê mặc định
		else Đã có thống kê
			BE->>BE: Sử dụng dữ liệu hiện có
		end
		BE-->>FE: Trả về currentStreak, longestStreak, totalCardsLearned, masteryRate
		FE-->>User: Hiển thị thống kê học tập
	end
```
