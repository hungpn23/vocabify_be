# Sequence Diagram: Cập nhật hồ sơ cá nhân

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ cập nhật hồ sơ cá nhân trong module `user`. Hệ thống yêu cầu người dùng đang có phiên đăng nhập hợp lệ trước khi cập nhật username.

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

	Note over User,Redis: Luồng cập nhật hồ sơ cá nhân
	User->>FE: Nhập username mới
	FE->>BE: Update profile + access token
	BE->>BE: Verify access token
	BE->>Redis: Check session
	alt Token lỗi hoặc session không tồn tại
		BE-->>FE: Báo không được phép truy cập
	else Phiên hợp lệ
		BE->>DB: Find user, check username
		alt User không tồn tại hoặc username trùng
			BE-->>FE: Báo cập nhật thất bại
		else Hợp lệ
			BE->>DB: Cập nhật hồ sơ
			BE-->>FE: Thành công
			FE-->>User: Cập nhật hồ sơ thành công
		end
	end
```
