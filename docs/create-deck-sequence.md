# Sequence Diagram: Tạo deck mới

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ tạo deck mới trong module `deck`. Khi hợp lệ, hệ thống tạo deck, sinh slug tự động và lưu danh sách card ban đầu.

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

	Note over User,Redis: Luồng tạo deck mới
	User->>FE: Nhập thông tin deck và danh sách card
	FE->>BE: Create deck + access token
	BE->>BE: Verify access token
	BE->>Redis: Check session
	alt Token lỗi hoặc session không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Yêu cầu đăng nhập lại
	else Phiên hợp lệ
		BE->>DB: Check duplicate deck name
		alt Tên deck trùng
			BE-->>FE: Báo deck đã tồn tại
		else Tên deck hợp lệ
			BE->>DB: Tạo deck + cards
			BE-->>FE: Trả về id và slug của deck
			FE-->>User: Tạo deck thành công
		end
	end
```
