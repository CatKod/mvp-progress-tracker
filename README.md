# MVP Progress Tracker

Ứng dụng theo dõi MVP theo **工数管理表 (bảng quản lý công số)** và **進捗管理表 (bảng quản lý tiến độ)** —
mô hình quản lý dự án được sinh viên Nhật sử dụng, chuyển sang tiếng Việt.

## Tính năng

| Màn hình | Nội dung |
|---|---|
| Trang chủ — Dashboard tuần | Tổng quan task, deadline sắp tới, top 3 nhiệm vụ ưu tiên, ngân sách thời gian |
| Task Board | Ma trận Eisenhower 4 góc, chuyển góc nhanh |
| Lịch tuần | Bảng 7 ngày × khung giờ, time-blocking task, lịch Google Calendar (mô phỏng) |
| Đánh giá & Ưu tiên | Chấm điểm ưu tiên theo deadline / độ khó / mức ảnh hưởng |
| Nhóm học tập | Thành viên, 工数上限 (giờ rản), bảng khối lượng |
| Chi tiết Task | Đổi trạng thái, góc Eisenhower, vấn đề & ghi chú |
| Thêm / Sửa Task | Đặt hạn nộp riêng, tự suy ra góc Eisenhower |
| Cảnh báo trùng deadline | Phát hiện task trùng ngày nộp hoặc sát giờ |
| Trung tâm Thông báo | Nhắc việc theo Personal Deadline |
| Ngân sách thời gian | Giờ tối đa / ngày, / tuần |
| Bảng khối lượng nhóm | 稼働率 (công suất) từng thành viên |
| Khung giờ im lặng | Quiet Hours |
| Chế độ Cao điểm | Ẩn / đẩy lùi task Câu lạc bộ & Sở thích |
| Gia hạn deadline | Template email xin gia hạn (Việt / Anh / Nhật) |
| Cài đặt | Hồ sơ sinh viên, xuất / nhập JSON |

## Công nghệ

- Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui (Base UI)
- Lưu trữ cục bộ bằng `localStorage` — không cần server, không cần đăng nhập
- Toàn bộ logic nghiệp vụ nằm ở `src/lib/` (types · domain · use-tracker)

## Chạy local

```bash
npm install
npm run dev
```

Mở http://localhost:3000

## Cấu trúc

```
src/
├─ app/                    # 18 route theo sơ đồ chuyển màn hình
├─ components/
│  ├─ ui/                  # shadcn/ui
│  ├─ app-shell.tsx        # Sidebar + header điều hướng
│  ├─ tracker-provider.tsx # React context cho state
│  ├─ page-header.tsx · stat-card.tsx · task-card.tsx · status-badge.tsx
├─ lib/
│  ├─ types.ts             # Domain model
│  ├─ domain.ts            # Hàm nghiệp vụ thuần (ưu tiên, xung đột, workload…)
│  ├─ use-tracker.ts       # Store hook + localStorage
│  ├─ sample-data.ts       # Dữ liệu mẫu
│  └─ CONTRACT.md          # Hợp đồng API cho giao diện
```

## Nguồn

Bám theo sơ đồ chuyển màn hình `screen-flow.drawio` và sheet
「ソリューションインタビュー項目 / MVP(Phase2)開発進捗管理シート」.
