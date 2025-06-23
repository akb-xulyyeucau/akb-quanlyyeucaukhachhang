import { Modal, Form, Input, Rate, Typography, Row, Col, Divider, message } from 'antd';
import React from 'react';
import { SendOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Props {
  open: boolean;
  onOk: (values: any) => void;
  onCancel: () => void;

  projectName?: string;
  customerName?: string;
  time?: string;
}

const ProjectRatingModal: React.FC<Props> = ({
  open,
  onOk,
  onCancel,
  projectName = 'Nền tảng Quản lý ABC',
  customerName = 'Hệ thống giáo dục SteamX',
  time = '01/06/2025 - 30/07/2025',
}) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        onOk(values);
        message.success('Cảm ơn quý khách đã tham gia đánh giá!');
        form.resetFields();
      })
      .catch(() => { });
  };

  return (
    <Modal
      title="Đánh giá dự án"
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText="Gửi đánh giá"
      cancelText="Hủy"
      width={720}
      okButtonProps={{
        icon: <SendOutlined />,
      }}
    >
      {/* THÔNG TIN DỰ ÁN */}
      <div
        style={{
          background: '#e6f7ff',
          padding: 20,
          borderRadius: 8,
          marginBottom: 24,
        }}
      >
        <Row gutter={24}>
          <Col span={24}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              Tên dự án: <span style={{ fontWeight: 600 }}>{projectName}</span>
            </div>
          </Col>
        </Row>

        <Row gutter={24} style={{ marginTop: 12 }}>
          <Col span={12}>
            <div>
              <Text strong>Khách hàng:</Text>{' '}
              <span>{customerName}</span>
            </div>
          </Col>
          <Col span={12}>
            <div>
              <Text strong>Thời gian thực hiện:</Text>{' '}
              <span>{time}</span>
            </div>
          </Col>
        </Row>
      </div>

      {/* FORM ĐÁNH GIÁ */}
      <Form form={form} layout="vertical">

        {/* Đánh giá tổng thể */}
        <Form.Item
          name="satisfaction"
          label="Đánh giá mức độ hài lòng tổng thể"

        >
          <div style={{ textAlign: 'center' }}>
            <Rate />
          </div>

        </Form.Item>

        <Form.Item
          name="satisfactionComment"
          label="Nhận xét về tổng thể dự án"
        >
          <Input.TextArea
            rows={3}
            placeholder="Thêm nhận xét cụ thể"
          />
        </Form.Item>

        <Divider />

        {/* Ý kiến đóng góp */}
        <Form.Item
          name="feedback"
          label="💬 4. Ý kiến đóng góp / phản hồi thêm"
        >
          <Input.TextArea
            rows={4}
            placeholder="Viết ý kiến của bạn (không bắt buộc)"
          />
        </Form.Item>


      </Form>
    </Modal>
  );
};

export default ProjectRatingModal;
