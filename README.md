# OASIS Helper

[English version](./README-en_US.md)

## Giới thiệu

Đây là một web app tự động viết Javadoc
cho:

 1. các thuộc tính của một lớp đối
 tượng,
 2. các phương thức getter/setter
 của chúng,
 3. cũng như các loại phương thức
 khác

trong một file mã nguồn Java điển hình.

[UET-OASIS](https://oasis.uet.vnu.edu.vn/)
là nền tảng học trực tuyến dành cho các
sinh viên theo học môn Lập trình hướng
đối tượng (OOP) ở UET, trong đó có mình.

Nền tảng này yêu cầu chúng mình phải viết
Javadoc cho **tất cả** các phương thức
trong mã nguồn Java chúng mình viết ra.
Khi số lượng phương thức còn ít thì điều
đó không thành vấn đề. Tuy nhiên, khi đề
bài yêu cầu một lớp đối tượng có quá
nhiều thuộc tính, số lượng phương thức
tăng lên rất nhanh (vì mỗi thuộc tính
có hai phương thức getter và setter,
còn chưa kế các phương thức khác).
**Viết Javadoc cho các phương thức đó hoàn**
**toàn bằng tay rất mất thời gian.**

Vì vậy chiếc web app này ra đời. Bạn chỉ
cần nhập thông tin chung của lớp đối tượng,
thêm các thuộc tính cho nó, và các phương
thức khác (không phải getter và setter của
các thuộc tính). App sẽ tự sinh code gồm
có:

 1. các thuộc tính đã cho,
 2. các phương thức getter và setter của
 các thuộc tính đó,
 3. các phương thức khác bạn đã cho,
 4. **và tất nhiên là Javadoc cho tất cả**
 **các phương thức, được sinh tự động**
 **hoàn toàn**

khi đó OASIS sẽ không còn bắt lỗi Javadoc
của các bạn nữa !

**TRẢI NGHIỆM NGAY** tại <https://oasishelper.vercel.app>

## License

Mã nguồn của dự án này được phân phối với điều
kiện bảo đảm các điều khoản trong Giấy phép BSD,
biến thể 3 điều khoản. Xem file
[`LICENSE.txt`](./LICENSE.txt) để biết thêm
chi tiết.
