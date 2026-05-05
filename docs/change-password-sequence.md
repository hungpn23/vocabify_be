# Sequence Diagram: Đổi mật khẩu

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ đổi mật khẩu khi người dùng đang đăng nhập. Hệ thống yêu cầu xác thực phiên hiện tại và kiểm tra mật khẩu cũ trước khi cập nhật.

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
    actorMargin: 42
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

	Note over User,Redis: Luồng đổi mật khẩu
	User->>FE: Nhập oldPassword, newPassword
	FE->>BE: Change password + access token
	BE->>BE: Verify access token
	BE->>Redis: Check session
	alt Token lỗi hoặc session không tồn tại
		BE-->>FE: Báo không được phép truy cập
	else Phiên hợp lệ
		BE->>DB: Lấy user
		BE->>BE: Verify oldPassword, validate newPassword
		alt Tài khoản hoặc mật khẩu không hợp lệ
			BE-->>FE: Báo đổi mật khẩu thất bại
		else Hợp lệ
			BE->>DB: Cập nhật mật khẩu mới
			BE-->>FE: Thành công
			FE-->>User: Đổi mật khẩu thành công
		end
	end
```
