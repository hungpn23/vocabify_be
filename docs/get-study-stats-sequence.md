# Sequence Diagram: Xem thống kê học tập

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ xem thống kê học tập của người dùng. Nếu người dùng chưa có dữ liệu thống kê, hệ thống sẽ khởi tạo bản ghi mặc định trước khi trả kết quả.

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

	Note over User,Redis: Luồng xem thống kê học tập
	User->>FE: Mở màn hình thống kê học tập
	FE->>BE: Get study stats + access token
	BE->>BE: Verify access token
	BE->>Redis: Check session
	alt Token lỗi hoặc session không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Yêu cầu đăng nhập lại
	else Phiên hợp lệ
		BE->>DB: Lấy study stats
		opt Chưa có thống kê
			BE->>DB: Khởi tạo thống kê mặc định
		end
		BE-->>FE: Trả streak, learned, mastery
		FE-->>User: Hiển thị thống kê học tập
	end
```
