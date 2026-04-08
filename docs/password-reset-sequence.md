# Sequence Diagram: Quên mật khẩu

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ quên mật khẩu. Người dùng yêu cầu OTP, xác thực OTP, sau đó dùng mã xác nhận tạm thời để đặt lại mật khẩu mới.

```mermaid
sequenceDiagram
	autonumber
	actor User
	participant FE as FE
	participant BE as BE
	participant DB as DB
	participant Redis as Redis

	Note over User,Redis: Bước 1 - Yêu cầu OTP đặt lại mật khẩu
	User->>FE: Nhập email
	FE->>BE: Gửi yêu cầu quên mật khẩu
	BE->>DB: Kiểm tra email có tài khoản hay không
	alt Email không tồn tại
		BE-->>FE: Thành công
		FE-->>User: Thông báo kiểm tra email
	else Email tồn tại
		BE->>Redis: Tăng số lần yêu cầu OTP
		alt Vượt quá số lần cho phép
			BE-->>FE: Báo lỗi quá số lần thử
			FE-->>User: Hiển thị thông báo lỗi
		else Hợp lệ
			BE->>BE: Tạo OTP, mã hóa OTP và gửi email
			BE->>Redis: Lưu OTP kèm thời hạn hiệu lực
			BE-->>FE: Thành công
			FE-->>User: Yêu cầu nhập OTP
		end
	end

	Note over User,Redis: Bước 2 - Xác thực OTP đặt lại mật khẩu
	User->>FE: Nhập email và OTP
	FE->>BE: Gửi yêu cầu xác thực OTP
	BE->>Redis: Tăng số lần xác thực OTP
	alt Vượt quá số lần cho phép
		BE-->>FE: Báo lỗi quá số lần thử
		FE-->>User: Hiển thị thông báo lỗi
	else Hợp lệ
		BE->>Redis: Lấy OTP đã lưu
		alt OTP không tồn tại hoặc đã hết hạn
			BE-->>FE: Báo OTP không hợp lệ
			FE-->>User: Yêu cầu xin lại OTP
		else OTP còn hiệu lực
			BE->>BE: Đối chiếu OTP
			alt OTP không đúng
				BE-->>FE: Báo OTP không hợp lệ
				FE-->>User: Yêu cầu nhập lại OTP
			else OTP đúng
				BE->>Redis: Xóa OTP và bộ đếm số lần thử
				BE->>Redis: Tạo resetToken và lưu tạm
				BE-->>FE: Trả về resetToken
				FE-->>User: Cho phép nhập mật khẩu mới
			end
		end
	end

	Note over User,Redis: Bước 3 - Đặt lại mật khẩu mới
	User->>FE: Nhập mật khẩu mới và resetToken
	FE->>BE: Gửi yêu cầu đặt lại mật khẩu
	BE->>Redis: Kiểm tra resetToken
	alt resetToken không tồn tại hoặc đã hết hạn
		BE-->>FE: Báo thông tin xác thực không hợp lệ
		FE-->>User: Yêu cầu thực hiện lại từ đầu
	else resetToken hợp lệ
		BE->>DB: Tìm người dùng theo email
		alt Không tìm thấy tài khoản
			BE-->>FE: Báo yêu cầu không hợp lệ
			FE-->>User: Hiển thị thông báo lỗi
		else Tìm thấy tài khoản
			BE->>BE: Kiểm tra mật khẩu mới có trùng mật khẩu hiện tại không
			alt Mật khẩu mới trùng mật khẩu hiện tại
				BE-->>FE: Báo mật khẩu mới không hợp lệ
				FE-->>User: Yêu cầu nhập mật khẩu khác
			else Mật khẩu mới hợp lệ
				BE->>DB: Cập nhật mật khẩu mới
				BE->>Redis: Xóa resetToken
				BE-->>FE: Thành công
				FE-->>User: Đặt lại mật khẩu thành công
			end
		end
	end
```
