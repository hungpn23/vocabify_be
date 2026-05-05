# Sequence Diagram: Đăng nhập bằng Magic Link

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ đăng nhập bằng magic link. Người dùng yêu cầu nhận liên kết đăng nhập qua email, sau đó frontend dùng token trong liên kết để hoàn tất đăng nhập.

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
    actorMargin: 36
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

	Note over User,Redis: 1. Gửi magic link
	User->>FE: Nhập email
	FE->>BE: Request magic link
	BE->>BE: Tạo loginToken và gửi email
	BE->>Redis: Lưu loginToken + TTL
	BE-->>FE: Thành công
	FE-->>User: Kiểm tra email

	Note over User,Redis: 2. Hoàn tất đăng nhập
	User->>FE: Mở magic link
	FE->>BE: Verify loginToken
	BE->>Redis: Check loginToken
	alt Token lỗi hoặc hết hạn
		BE-->>FE: Báo token không hợp lệ
	else Token hợp lệ
		BE->>DB: Find or create user
		BE->>BE: Tạo session + token
		BE->>Redis: Lưu session, xóa loginToken
		BE-->>FE: Trả access + refresh token
		FE-->>User: Đăng nhập thành công
	end
```
