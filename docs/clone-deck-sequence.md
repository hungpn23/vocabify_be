# Sequence Diagram: Clone deck chia sẻ

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ clone một deck chia sẻ trong module `deck`. Khi clone thành công, hệ thống tăng learner count, tạo thông báo cho chủ deck gốc và gửi realtime notification nếu chủ deck đang online.

```mermaid
sequenceDiagram
	autonumber
	actor User
	actor Owner
	participant FE as FE
	participant BE as BE
	participant DB as DB
	participant Redis as Redis
	participant Realtime as Notification Gateway

	Note over User,Realtime: Luồng clone deck chia sẻ
	User->>FE: Chọn clone một deck chia sẻ
	FE->>BE: Gửi yêu cầu clone kèm access token và passcode nếu có
	BE->>BE: Kiểm tra access token
	BE->>Redis: Đối chiếu phiên đăng nhập hiện tại
	alt Token không hợp lệ hoặc phiên không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Yêu cầu đăng nhập lại
	else Phiên hợp lệ
		BE->>DB: Tìm deck gốc không thuộc người dùng hiện tại và không phải private
		alt Không tìm thấy deck phù hợp
			BE-->>FE: Báo không tìm thấy deck
			FE-->>User: Hiển thị thông báo lỗi
		else Tìm thấy deck gốc
			alt Deck protected nhưng passcode không đúng
				BE-->>FE: Báo passcode không hợp lệ
				FE-->>User: Yêu cầu nhập lại passcode
			else Có thể clone
				BE->>DB: Tạo deck clone ở trạng thái private
				BE->>DB: Sao chép danh sách card sang deck mới
				BE->>DB: Tăng learner count cho deck gốc
				BE->>DB: Lấy thông tin người thực hiện clone
				alt Không tìm thấy người thực hiện
					BE-->>FE: Báo yêu cầu không hợp lệ
					FE-->>User: Hiển thị thông báo lỗi
				else Tìm thấy người thực hiện
					BE->>DB: Tạo notification cho chủ deck gốc
					BE->>Realtime: Gửi realtime notification
					Realtime-->>Owner: Nhận thông báo nếu đang online
					BE-->>FE: Thành công
					FE-->>User: Clone deck thành công
				end
			end
		end
	end
```
