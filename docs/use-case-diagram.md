# Use Case Diagram

Sơ đồ dưới đây phản ánh phần boilerplate còn lại trong `src/modules` sau khi đã gỡ toàn bộ nghiệp vụ `deck`, `study`, `suggestion`.

```mermaid
flowchart LR
	classDef actor fill:#f5f5f5,stroke:#333,stroke-width:1px,color:#111;
	classDef usecase fill:#ffffff,stroke:#2f6f9f,stroke-width:1px,color:#111;

	guest["Guest"]:::actor
	user["User"]:::actor
	admin["Admin"]:::actor

	admin -.kế thừa vai trò.-> user

	subgraph Boilerplate["NestJS Boilerplate"]
		signUp(["Đăng ký (xác thực email)"]):::usecase
		signIn(["Đăng nhập (Google, Email)"]):::usecase
		resetPassword(["Khôi phục mật khẩu"]):::usecase
		manageSession(["Quản lý phiên đăng nhập"]):::usecase
		manageProfile(["Quản lý hồ sơ cá nhân"]):::usecase
		manageNotifications(["Quản lý thông báo"]):::usecase
		receiveRealtimeNotifications(["Nhận realtime notification"]):::usecase
	end

	guest --- signUp
	guest --- signIn
	guest --- resetPassword

	user --- manageProfile
	user --- manageNotifications
	user --- receiveRealtimeNotifications

	admin --- manageSession
```

## Mapping use case từ controller

- `Đăng ký tài khoản`: `POST /auth/sign-up`
- `Đăng nhập / xác thực`: `POST /auth/login`, `POST /auth/magic-link`, `POST /auth/verify-token`, `GET /auth/google/callback`
- `Xác minh email`: `POST /auth/email-verification/request`, `POST /auth/email-verification/confirm`
- `Khôi phục mật khẩu`: `POST /auth/password/reset/request`, `POST /auth/password/reset/confirm`, `POST /auth/password/reset`
- `Quản lý phiên đăng nhập`: `GET /auth/session`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/password/change`
- `Quản lý hồ sơ cá nhân`: `PATCH /users/profile`, `POST /users/avatar`, `DELETE /users/avatar/:fileId`
- `Quản lý thông báo`: `GET /notifications`, `POST /notifications/read/:notificationId`, `POST /notifications/read-all`
