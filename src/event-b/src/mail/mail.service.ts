import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';
import { Attachment } from 'nodemailer/lib/mailer';

@Injectable()
export class MailService {
  constructor(private configService: ConfigService) { }

  async sendOrderEmail(email: string, order: any) {
    const appPassword = this.configService.get<string>('GMAIL_APP_PASSWORD');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ttruonghuy2003@gmail.com',
        pass: appPassword,
      },
    });

    const firstTicket = order.tickets[0];
    const session = firstTicket?.session_id as any;  // Ép kiểu để tránh lỗi
    const event = session?.event_id as any;

    // Generate QR codes và chuẩn bị attachments
    const attachments: Attachment[] = [];
    const ticketQRCodes = await Promise.all(
      order.tickets.map(async (ticket, index) => {
        const ticketName = ticket.ticket_id?.ticket_name || 'Vé không xác định';
        const ticketPrice = ticket.ticket_id?.ticket_price || ticket.price;

        const qrBuffer = await QRCode.toBuffer(
          JSON.stringify({ ticket_id: ticket.ticket_id._id || ticket.ticket_id, order_id: order._id }),  // Sử dụng _id nếu populate
          { errorCorrectionLevel: 'H', scale: 8 }  // Tùy chỉnh để QR rõ nét hơn
        );

        const cid = `qr_${index}`;
        attachments.push({
          filename: `qr_code_ve_${ticketName.replace(/\s/g, '_')}_${index + 1}.png`,  // Tên file dễ nhận biết, để tải về
          content: qrBuffer,
          cid: cid,  // Để nhúng inline
        });

        return {
          ...ticket,
          ticketName,
          ticketPrice,
          cid,
        };
      }),
    );

    // HTML content
    const htmlContent = `
      <h2>Sự kiện: ${event?.title || 'Chưa có thông tin'}</h2>
      <p>Thời gian: ${session?.start_time ? new Date(session.start_time).toLocaleString('vi-VN') : ''} - ${session?.end_time ? new Date(session.end_time).toLocaleString('vi-VN') : ''}</p>
      <p>Địa điểm: ${event?.location?.houseNumber || ''}, ${event?.location?.ward || ''}, ${event?.location?.district || ''}, ${event?.location?.province || ''}</p>
      
      <ul>
        ${ticketQRCodes
        .map(
          (ticket, index) => `
          <li>
            Vé: <b>${ticket.ticketName}</b> - Giá: <b>${ticket.ticketPrice?.toLocaleString('vi-VN')} đ</b><br/>
            <img src="cid:${ticket.cid}" alt="QR Code Vé ${index + 1}" width="150" height="150" /><br/>
            <a href="cid:${ticket.cid}">Tải QR Code về để check-in</a>  <!-- Link tải nếu cần -->
          </li>
          `,
        )
        .join('')}
      </ul>
      <p>Điều khoản sử dụng:</p>
      <ul>
        <li>Vé chỉ có giá trị sử dụng một (01) lần cho một (01) người tham dự sự kiện vào đúng thời gian, địa điểm trên vé.</li>
        <li>Khách hàng vui lòng xuất trình vé hợp lệ tại cổng check-in để được xác nhận tham dự.</li>
        <li>Người mua có trách nhiệm giữ gìn và bảo mật mã vé. Ve++ không chịu trách nhiệm đối với các trường hợp mất mát, thất lạc hoặc bị sử dụng bởi bên thứ ba.</li>
        <li>Bằng việc mua vé và tham gia sự kiện, quý khách đồng ý và cam kết tuân thủ các điều khoản và điều kiện được công bố chính thức từ Ve++ và Ban tổ chức. Điều khoản và điều kiện có thể được cập nhật mà không cần thông báo trước.</li>
      </ul>
      <p>Cảm ơn bạn đã đặt vé!</p>
    `;

    // Gửi mail với attachments
    await transporter.sendMail({
      from: '"Ve++" <ttruonghuy2003@gmail.com>',
      to: email,
      subject: `Đơn hàng ${order._id} - Vé sự kiện của bạn`,
      html: htmlContent,
      attachments: attachments,  // Thêm attachments
    });
  }




  async sendPaymentEmail(
    email: string,
    data: {
      eventTitle: string;
      organizerName: string;
      totalRevenue: number;
      commission: number;
      paymentAmount: number;

      pay_time: Date;

      bank_account_number: string;
      bank_account_holder: string;
      bank_name: string;
    },
    file?: Express.Multer.File
  ) {
    const appPassword = this.configService.get<string>('GMAIL_APP_PASSWORD');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ttruonghuy2003@gmail.com',
        pass: appPassword,
      },
    });

    const htmlContent = `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <h2 style="color: #2563eb;">Xác nhận thanh toán sự kiện: ${data.eventTitle}</h2>
    <p>Kính gửi <b>${data.organizerName}</b>,</p>
    <p>Chúng tôi vui mừng thông báo rằng thanh toán cho sự kiện của bạn đã được thực hiện thành công. Dưới đây là thông tin chi tiết:</p>
    
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Tổng doanh thu</td>
        <td style="padding: 8px; border: 1px solid #ddd;"><b>${data.totalRevenue.toLocaleString()} VNĐ</b></td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Hoa hồng nền tảng</td>
        <td style="padding: 8px; border: 1px solid #ddd;"><b>${data.commission.toLocaleString()} VNĐ</b></td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Số tiền thanh toán</td>
        <td style="padding: 8px; border: 1px solid #ddd;"><b>${data.paymentAmount.toLocaleString()} VNĐ</b></td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Ngân hàng</td>
        <td style="padding: 8px; border: 1px solid #ddd;"><b>${data.bank_name}</b></td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Số tài khoản</td>
        <td style="padding: 8px; border: 1px solid #ddd;"><b>${data.bank_account_number}</b></td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Tên tài khoản</td>
        <td style="padding: 8px; border: 1px solid #ddd;"><b>${data.bank_account_holder}</b></td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Thời gian thanh toán</td>
        <td style="padding: 8px; border: 1px solid #ddd;"><b>${new Date(data.pay_time).toLocaleString('vi-VN')}</b></td>
      </tr>
    </table>

    ${file ? `
      <p>Chứng từ chuyển khoản được đính kèm trong email này. Vui lòng kiểm tra file để đối chiếu.</p>
    ` : ''}

    <p style="margin-top: 20px;">Cảm ơn bạn đã sử dụng dịch vụ <b>Ve++</b>.</p>
    <p>Trân trọng,<br/><b>Đội ngũ Ve++</b></p>
  </div>
`;
    await transporter.sendMail({
      from: '"Ve++" <ttruonghuy2003@gmail.com>',
      to: email,
      subject: `Thanh toán sự kiện: ${data.eventTitle}`,
      html: htmlContent,
      attachments: file
        ? [{
          filename: file.originalname,
          content: file.buffer,
          contentType: file.mimetype,
        }]
        : [],
    });
  }


  async sendRefundEmail(email: string, data: {
  userName: string;
  eventTitle: string;
  sessionTime: string;
  ticketName: string;

  ticketPrice: number;
  ticketQuantity: number;
  orderId: string;
  refundAmount: number;
  paymentMethod: string;
  refundTxnNo: string;
  refundTime: Date;
}) {
  const appPassword = this.configService.get<string>('GMAIL_APP_PASSWORD');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ttruonghuy2003@gmail.com',
      pass: appPassword,
    },
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h2 style="color: #ef4444;">Thông báo hoàn tiền đơn hàng: ${data.orderId}</h2>
      <p>Kính gửi <b>${data.userName}</b>,</p>
      <p>Chúng tôi xin thông báo rằng đơn hàng của bạn cho sự kiện <b>${data.eventTitle}</b> đã được hoàn tiền thành công do sự kiện/session bị hủy. Dưới đây là thông tin chi tiết:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Tên vé</td>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>${data.ticketName}</b></td>
        </tr>
        
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Số lượng vé</td>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>${data.ticketQuantity}</b></td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Thời gian session</td>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>${data.sessionTime}</b></td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Số tiền hoàn</td>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>${data.refundAmount.toLocaleString()} VNĐ</b></td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Phương thức thanh toán</td>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>${data.paymentMethod}</b></td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Mã giao dịch hoàn tiền</td>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>${data.refundTxnNo}</b></td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Thời gian hoàn tiền</td>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>${new Date(data.refundTime).toLocaleString('vi-VN')}</b></td>
        </tr>
      </table>

      <p style="margin-top: 20px;">Số tiền sẽ được hoàn về tài khoản thanh toán của bạn trong vòng 5-7 ngày làm việc. Nếu có bất kỳ vấn đề gì, vui lòng liên hệ hỗ trợ.</p>
      <p>Trân trọng,<br/><b>Đội ngũ Ve++</b></p>
    </div>
  `;

  await transporter.sendMail({
    from: '"Ve++" <ttruonghuy2003@gmail.com>',
    to: email,
    subject: `Hoàn tiền đơn hàng ${data.orderId} - Sự kiện ${data.eventTitle}`,
    html: htmlContent,
  });
}

}