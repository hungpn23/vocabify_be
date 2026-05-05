# Sequence Diagram: Clone deck chia sẻ

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ clone một deck chia sẻ trong module `deck`. Khi clone thành công, hệ thống tăng learner count, tạo thông báo cho chủ deck gốc và gửi realtime notification nếu chủ deck đang online.

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
	actor Owner
	participant FE as FE
	participant BE as API
	participant DB as DB
	participant Redis as Redis
	participant Realtime as Notification Gateway

	Note over User,Realtime: Luồng clone deck chia sẻ
	User->>FE: Chọn clone một deck chia sẻ
	FE->>BE: Clone deck + access token
	BE->>BE: Verify access token
	BE->>Redis: Check session
	alt Token lỗi hoặc session không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Yêu cầu đăng nhập lại
	else Phiên hợp lệ
		BE->>DB: Find shareable source deck
		BE->>BE: Validate passcode nếu protected
		alt Deck, passcode hoặc user không hợp lệ
			BE-->>FE: Báo clone deck thất bại
		else Có thể clone
			BE->>DB: Tạo deck clone private
			BE->>DB: Copy cards, tăng learner count
			BE->>DB: Tạo notification cho owner
			BE->>Realtime: Gửi realtime notification
			Realtime-->>Owner: Nhận thông báo nếu online
			BE-->>FE: Thành công
			FE-->>User: Clone deck thành công
		end
	end
```
