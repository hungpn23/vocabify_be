# Sequence Diagram: Đánh dấu một thông báo đã đọc

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ đánh dấu một thông báo là đã đọc. Hệ thống chỉ cho phép cập nhật nếu thông báo thuộc về đúng người dùng hiện tại.

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

	Note over User,Redis: Luồng đánh dấu một thông báo đã đọc
	User->>FE: Chọn một thông báo
	FE->>BE: Mark read + notificationId
	BE->>BE: Verify access token
	BE->>Redis: Check session
	alt Token lỗi hoặc session không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Yêu cầu đăng nhập lại
	else Phiên hợp lệ
		BE->>DB: Find notification by owner
		alt Không tìm thấy thông báo
			BE-->>FE: Báo không tìm thấy thông báo
		else Tìm thấy thông báo
			BE->>DB: Cập nhật readAt
			BE-->>FE: Thành công
			FE-->>User: Đã đánh dấu đã đọc
		end
	end
```
