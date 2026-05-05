# Sequence Diagram: Tải avatar

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ tải avatar trong module `user`. Hệ thống kiểm tra phiên đăng nhập, xác thực tệp ảnh, tải ảnh mới lên kho lưu trữ, sau đó cập nhật hồ sơ người dùng.

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
	participant ImageKit as ImageKit

	Note over User,ImageKit: Luồng tải avatar
	User->>FE: Chọn ảnh đại diện
	FE->>BE: Upload avatar + access token
	BE->>BE: Verify token, validate image
	BE->>Redis: Check session
	alt Token, session hoặc file không hợp lệ
		BE-->>FE: Báo không được phép truy cập
	else Phiên hợp lệ
		BE->>DB: Lấy user hiện tại
		BE->>ImageKit: Upload ảnh mới
		alt User không tồn tại hoặc upload lỗi
			BE-->>FE: Báo upload avatar thất bại
		else Upload thành công
			BE->>DB: Cập nhật avatar mới
			opt Có avatar cũ
				BE->>ImageKit: Xóa avatar cũ
				BE->>BE: Lỗi xóa cũ chỉ ghi log
			end
			BE-->>FE: Thành công
			FE-->>User: Cập nhật avatar thành công
		end
	end
```
