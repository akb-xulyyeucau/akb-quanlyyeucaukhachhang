import React from 'react';
import { Modal, Typography, Steps, Button, Space } from 'antd';
import { 
  LockOutlined, 
  SafetyCertificateOutlined, 
  GoogleOutlined,
  SecurityScanOutlined,
  KeyOutlined,
  CopyOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface GmailTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const GmailTutorial: React.FC<GmailTutorialProps> = ({ isOpen, onClose }) => {
  const steps = [
    {
      title: 'Truy cập Google Account',
      description: (
        <>
          <Paragraph>
            Truy cập trang quản lý tài khoản Google:
            <br />
            <a href="https://myaccount.google.com/" target="_blank" rel="noopener noreferrer">
              https://myaccount.google.com/
            </a>
          </Paragraph>
        </>
      ),
      icon: <GoogleOutlined />
    },
    {
      title: 'Kiểm tra Security',
      description: (
        <>
          <Paragraph>
            Vào phần Security (Bảo mật)
            <br />
            Kiểm tra và đảm bảo đã bật 2-Step Verification
          </Paragraph>
        </>
      ),
      icon: <SecurityScanOutlined />
    },
    {
      title: 'Truy cập App Passwords',
      description: (
        <>
          <Paragraph>
            Sau khi bật 2-Step Verification, truy cập:
            <br />
            <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer">
              https://myaccount.google.com/apppasswords
            </a>
          </Paragraph>
        </>
      ),
      icon: <KeyOutlined />
    },
    {
      title: 'Tạo mật khẩu ứng dụng',
      description: (
        <>
          <Paragraph>
            - Trong phần Select app, chọn Mail
            <br />
            - Trong phần Select device, chọn Other → đặt tên như MERN App
            <br />
            - Bấm Generate
          </Paragraph>
        </>
      ),
      icon: <SafetyCertificateOutlined />
    },
    {
      title: 'Sao chép mật khẩu',
      description: (
        <>
          <Paragraph>
            Google sẽ hiển thị một dãy 16 ký tự
            <br />
            Sao chép dãy ký tự đó - đây chính là App Password của bạn
            <br />
            Dùng nó để cấu hình gửi email
          </Paragraph>
        </>
      ),
      icon: <CopyOutlined />
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <LockOutlined />
          <Title level={4} style={{ margin: 0 }}>Hướng dẫn tạo App Password cho Gmail</Title>
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" icon={<CloseCircleOutlined />} onClick={onClose}>
          Đóng
        </Button>
      ]}
    >
      <div style={{ padding: '20px 0' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={5}>Yêu cầu trước:</Title>
          <ul>
            <li>Bật xác minh 2 bước (2-Step Verification) cho tài khoản Gmail</li>
            <li>Tài khoản phải không bị chặn đăng nhập từ ứng dụng kém bảo mật</li>
          </ul>
        </div>
        
        <Steps
          direction="vertical"
          current={-1}
          items={steps}
          style={{ maxWidth: '100%' }}
        />
      </div>
    </Modal>
  );
};

export default GmailTutorial;
