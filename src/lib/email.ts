import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendMagicLinkEmail(
  to: string, 
  applicationId: string, 
  magicToken: string, 
  firstName: string,
  programContactUrl?: string | null
) {
  const magicLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/resume?token=${magicToken}`;
  
  const mailOptions = {
    from: `"SMKCC Admission" <${process.env.EMAIL_USER}>`,
    to,
    subject: "ดำเนินการสมัครเรียนต่อ - วิทยาลัยชุมชนสมุทรสาคร",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e3a8a; text-align: center;">วิทยาลัยชุมชนสมุทรสาคร</h2>
        <p>สวัสดีคุณ ${firstName},</p>
        <p>คุณได้ทำการส่งข้อมูลการสมัครเบื้องต้น (รหัสการสมัคร: <strong>${applicationId}</strong>) เรียบร้อยแล้ว</p>
        <p>เพื่อความสมบูรณ์ของการสมัคร กรุณาอัปโหลดเอกสารประกอบการสมัคร โดยคลิกที่ปุ่มด้านล่าง:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${magicLink}" style="padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">อัปโหลดเอกสารทันที</a>
        </div>
        
        ${programContactUrl ? `
        <div style="margin-top: 30px; padding: 15px; background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 4px;">
          <h3 style="color: #166534; margin-top: 0;">💬 ติดต่อพูดคุยกับสาขาวิชาโดยตรง</h3>
          <p style="color: #15803d; margin-bottom: 10px;">หากคุณมีข้อสงสัยเกี่ยวกับการเรียนการสอน สามารถกดเข้าร่วมกลุ่ม หรือสอบถามอาจารย์ประจำสาขาได้ที่นี่:</p>
          <a href="${programContactUrl}" style="color: #2563eb; font-weight: bold; text-decoration: underline;">👉 คลิกที่นี่เพื่อติดต่อสาขาวิชา</a>
        </div>
        ` : ''}

        <br/>
        <p style="font-size: 12px; color: #64748b;">หากปุ่มกดไม่ได้ ให้คัดลอกลิงก์นี้ไปวางที่เบราว์เซอร์:<br/>
        <a href="${magicLink}" style="color: #3b82f6;">${magicLink}</a></p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">นี่เป็นอีเมลอัตโนมัติ กรุณาอย่าตอบกลับ</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendStatusEmail(
  to: string, 
  firstName: string, 
  applicationId: string, 
  status: string, 
  magicToken: string,
  remark?: string
) {
  const magicLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/resume?token=${magicToken}`;
  
  let subject = "";
  let messageHTML = "";

  if (status === 'APPROVED') {
    subject = "🎉 อนุมัติการสมัครเรียนเรียบร้อยแล้ว - วิทยาลัยชุมชนสมุทรสาคร";
    messageHTML = `
      <div style="padding: 15px; background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 4px;">
        <h3 style="color: #166534; margin-top: 0;">ยินดีด้วย! การสมัครของคุณผ่านการอนุมัติแล้ว</h3>
        <p style="color: #15803d;">เอกสารของคุณครบถ้วนและผ่านการตรวจสอบแล้ว โปรดรอการติดต่อจากเจ้าหน้าที่หรือติดตามประกาศจากทางวิทยาลัยในขั้นตอนถัดไป</p>
        ${remark ? `<div style="margin-top: 10px; padding: 10px; background-color: #dcfce7; color: #166534; border-radius: 4px;"><strong>หมายเหตุจากเจ้าหน้าที่:</strong> ${remark}</div>` : ''}
      </div>
    `;
  } else if (status === 'PAID') {
    subject = "✅ การชำระเงินสำเร็จ - วิทยาลัยชุมชนสมุทรสาคร";
    messageHTML = `
      <div style="padding: 15px; background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 4px;">
        <h3 style="color: #166534; margin-top: 0;">การสมัครเสร็จสมบูรณ์</h3>
        <p style="color: #15803d;">วิทยาลัยได้รับชำระค่าธรรมเนียมการศึกษาของคุณเรียบร้อยแล้ว ยินดีต้อนรับสู่ครอบครัววิทยาลัยชุมชนสมุทรสาคร</p>
        ${remark ? `<div style="margin-top: 10px; padding: 10px; background-color: #dcfce7; color: #166534; border-radius: 4px;"><strong>หมายเหตุจากเจ้าหน้าที่:</strong> ${remark}</div>` : ''}
      </div>
    `;
  } else if (status === 'DOCUMENT_REQUESTED') {
    subject = "⚠️ ขอเอกสารเพิ่มเติมสำหรับการสมัครเรียน - วิทยาลัยชุมชนสมุทรสาคร";
    messageHTML = `
      <div style="padding: 15px; background-color: #fff7ed; border-left: 4px solid #f97316; border-radius: 4px;">
        <h3 style="color: #9a3412; margin-top: 0;">พบข้อผิดพลาดหรือต้องการเอกสารเพิ่มเติม</h3>
        <p style="color: #c2410c;">เจ้าหน้าที่ได้ตรวจสอบเอกสารของคุณแล้ว พบว่าเอกสารบางส่วนไม่ถูกต้องหรือไม่ครบถ้วน</p>
        ${remark ? `<div style="margin-top: 10px; padding: 10px; background-color: #ffedd5; color: #9a3412; border-radius: 4px;"><strong>หมายเหตุจากเจ้าหน้าที่:</strong> ${remark}</div>` : ''}
        <p style="color: #c2410c; margin-top: 10px;">กรุณากดปุ่มด้านล่างเพื่อเข้าสู่ระบบและอัปโหลดเอกสารเพิ่มเติมโดยเร็วที่สุด</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${magicLink}" style="padding: 12px 24px; background-color: #f97316; color: white; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">เข้าสู่ระบบเพื่อแก้ไขเอกสาร</a>
      </div>
    `;
  } else if (status === 'REJECTED') {
    subject = "❌ แจ้งผลการสมัครเรียน - วิทยาลัยชุมชนสมุทรสาคร";
    messageHTML = `
      <div style="padding: 15px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
        <h3 style="color: #991b1b; margin-top: 0;">ไม่ผ่านเงื่อนไขการรับสมัคร</h3>
        <p style="color: #b91c1c;">ขออภัย การสมัครของคุณไม่ผ่านเงื่อนไขที่วิทยาลัยกำหนด หรือไม่สามารถดำเนินการต่อได้ หากมีข้อสงสัยโปรดติดต่อเจ้าหน้าที่</p>
        ${remark ? `<div style="margin-top: 10px; padding: 10px; background-color: #fee2e2; color: #991b1b; border-radius: 4px;"><strong>หมายเหตุจากเจ้าหน้าที่:</strong> ${remark}</div>` : ''}
      </div>
    `;
  } else {
    return; // Do not send email for other statuses
  }

  const mailOptions = {
    from: `"SMKCC Admission" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e3a8a; text-align: center;">วิทยาลัยชุมชนสมุทรสาคร</h2>
        <p>เรียนคุณ ${firstName},</p>
        <p>การสมัครเรียนหมายเลข <strong>${applicationId}</strong> มีการอัปเดตสถานะดังนี้:</p>
        
        ${messageHTML}

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">หากมีข้อสงสัยสามารถติดต่อเจ้าหน้าที่ผ่านช่องทางหลักของวิทยาลัย<br>นี่เป็นอีเมลอัตโนมัติ กรุณาอย่าตอบกลับ</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
