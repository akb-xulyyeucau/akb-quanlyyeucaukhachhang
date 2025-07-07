import React from 'react';
import { Modal, Button, Typography, Space } from 'antd';
import { MailOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface PopupConfirmProps {
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  emailRecipient?: string; // Địa chỉ email người nhận (tùy chọn)
  mailContentPreview?: string; // Nội dung xem trước email (tùy chọn)
  isLoading?: boolean; // Trạng thái loading cho nút xác nhận
}

const PopupMailConfirm: React.FC<PopupConfirmProps> = ({
  isVisible,
  onConfirm,
  onCancel,
  emailRecipient,
  mailContentPreview,
  isLoading = false,
}) => {
  return (
    <Modal
      title={
        <Space>
          <MailOutlined />
          Xác nhận gửi Email
        </Space>
      }
      visible={isVisible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={onConfirm}
          loading={isLoading}
        >
          Gửi Email
        </Button>,
      ]}
    >
      <p>Bạn có chắc chắn muốn gửi email này không?</p>
      {emailRecipient && (
        <p>
          Đến: <Text strong>{emailRecipient}</Text>
        </p>
      )}
      {mailContentPreview && (
        <>
          <p>Nội dung xem trước:</p>
          <div
            style={{
              maxHeight: '150px',
              overflowY: 'auto',
              padding: '10px',
              border: '1px solid #f0f0f0',
              borderRadius: '4px',
              backgroundColor: '#fafafa',
            }}
          >
            <Text type="secondary" style={{ whiteSpace: 'pre-wrap' }}>
              {mailContentPreview}
            </Text>
          </div>
        </>
      )}
      <p style={{ marginTop: '15px', color: 'red' }}>
        Lưu ý: Thao tác này không thể hoàn tác.
      </p>
    </Modal>
  );
};

export default PopupMailConfirm;