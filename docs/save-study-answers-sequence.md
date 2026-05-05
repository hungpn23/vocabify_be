# Sequence Diagram: Lưu kết quả học

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ lưu kết quả học của người dùng trên một deck. Sau khi cập nhật kết quả của các thẻ, hệ thống gửi thêm một tác vụ nền để cập nhật thống kê học tập.

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
	participant StudyQueue as Study Queue
	participant StudyWorker as Study Worker

	Note over User,StudyWorker: Luồng lưu kết quả học
	User->>FE: Hoàn thành một lượt học deck
	FE->>BE: Save answers + access token
	BE->>BE: Verify access token
	BE->>Redis: Check session
	alt Token lỗi hoặc session không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Yêu cầu đăng nhập lại
	else Phiên hợp lệ
		BE->>DB: Check deck ownership
		alt Không tìm thấy deck
			BE-->>FE: Báo không tìm thấy deck
		else Tìm thấy deck
			BE->>DB: Cập nhật kết quả thẻ
			BE->>StudyQueue: Queue update stats
			BE-->>FE: Thành công
			FE-->>User: Lưu kết quả học thành công
			StudyQueue-->>StudyWorker: Process stats job
			StudyWorker->>DB: Tính và lưu study stats
		end
	end
```
