# Sequence Diagram: Lưu kết quả học

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ lưu kết quả học của người dùng trên một deck. Sau khi cập nhật kết quả của các thẻ, hệ thống gửi thêm một tác vụ nền để cập nhật thống kê học tập.

```mermaid
sequenceDiagram
	autonumber
	actor User
	participant FE as FE
	participant BE as BE
	participant DB as DB
	participant Redis as Redis
	participant StudyQueue as Study Queue
	participant StudyWorker as Study Worker

	Note over User,StudyWorker: Luồng lưu kết quả học
	User->>FE: Hoàn thành một lượt học deck
	FE->>BE: Gửi câu trả lời kèm access token và deckId
	BE->>BE: Kiểm tra access token
	BE->>Redis: Đối chiếu phiên đăng nhập hiện tại
	alt Token không hợp lệ hoặc phiên không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Yêu cầu đăng nhập lại
	else Phiên hợp lệ
		BE->>DB: Kiểm tra deck có thuộc người dùng hiện tại không
		alt Không tìm thấy deck phù hợp
			BE-->>FE: Báo không tìm thấy deck
			FE-->>User: Hiển thị thông báo lỗi
		else Tìm thấy deck
			BE->>DB: Lấy các thẻ cần cập nhật trong deck
			BE->>DB: Cập nhật kết quả trả lời cho từng thẻ
			BE->>BE: Tính số thẻ đã đạt trạng thái ghi nhớ
			BE->>StudyQueue: Gửi tác vụ cập nhật thống kê học tập
			BE-->>FE: Thành công
			FE-->>User: Lưu kết quả học thành công
			StudyQueue-->>StudyWorker: Xử lý tác vụ nền
			StudyWorker->>DB: Tính lại streak, tổng số thẻ đã học và mastery rate
			StudyWorker->>DB: Lưu thống kê học tập mới
		end
	end
```
