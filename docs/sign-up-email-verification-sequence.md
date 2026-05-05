# Sequence Diagram: Đăng ký và xác thực email

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ đăng ký tài khoản bằng email/password, trong đó người dùng phải xác thực email trước khi hoàn tất đăng ký.

```mermaid
---
config:
  theme: base
  look: classic
  sequence:
    showSequenceNumbers: false
    mirrorActors: false
    diagramMarginX: 12
    diagramMarginY: 8
    actorMargin: 34
    boxMargin: 6
    boxTextMargin: 4
    noteMargin: 6
    messageMargin: 24
  themeVariables:
    background: "#ffffff"
    mainBkg: "#ffffff"
    actorBkg: "#f8fafc"
    actorBorder: "#475569"
    actorTextColor: "#0f172a"
    signalColor: "#334155"
    signalTextColor: "#0f172a"
    noteBkgColor: "#eef6ff"
    noteTextColor: "#0f172a"
    noteBorderColor: "#93c5fd"
    loopTextColor: "#0f172a"
    activationBkgColor: "#e0f2fe"
    activationBorderColor: "#0284c7"
    labelBoxBkgColor: "#f1f5f9"
    labelBoxBorderColor: "#94a3b8"
    labelTextColor: "#0f172a"
    fontFamily: "Arial"
    fontSize: "12px"
---
sequenceDiagram
	actor User
	participant FE as FE
	participant BE as API
	participant DB as DB
	participant Redis as Redis

	Note over User,Redis: 1. Gửi OTP
	User->>FE: Nhập email
	FE->>BE: Request OTP
	BE->>DB: Check email
	BE->>Redis: Check rate limit
	alt Email đã xác thực hoặc quá giới hạn
		BE-->>FE: Kết quả ẩn danh hoặc lỗi
	else Có thể gửi OTP
		BE->>BE: Tạo OTP và gửi email
		BE->>Redis: Lưu OTP + TTL
		BE-->>FE: Cho nhập OTP
	end

	Note over User,Redis: 2. Xác thực OTP
	User->>FE: Nhập email và OTP
	FE->>BE: Verify OTP
	BE->>Redis: Check attempts + OTP
	alt OTP hết hạn, sai hoặc quá giới hạn
		BE-->>FE: Báo OTP không hợp lệ
	else OTP đúng
		BE->>Redis: Xóa OTP, tạo verifiedToken
		BE-->>FE: Trả verifiedToken
	end

	Note over User,Redis: 3. Hoàn tất đăng ký
	User->>FE: Nhập username, password, verifiedToken
	FE->>BE: Sign up
	BE->>Redis: Validate verifiedToken
	BE->>DB: Check email
	alt Token lỗi hoặc email đã tồn tại
		BE-->>FE: Báo đăng ký không hợp lệ
	else verifiedToken hợp lệ
		BE->>BE: Hash password, tạo session
		BE->>DB: Tạo user đã xác thực email
		BE->>Redis: Lưu session, xóa token
		BE-->>FE: Trả access + refresh token
		FE-->>User: Đăng ký thành công
	end
```
