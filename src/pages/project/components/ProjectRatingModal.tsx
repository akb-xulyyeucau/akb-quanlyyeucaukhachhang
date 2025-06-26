import { Modal, Form, Input, Typography, Row, Col, Divider } from 'antd';
import React, { useState } from 'react';
import { SendOutlined } from '@ant-design/icons';
import RatingProject from '../../../common/components/RatingProject';

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
  projectName,
  customerName,
  time,
}) => {
  const [form] = Form.useForm();
  const [rating, setRating] = useState(0); // Bắt đầu với 0 (chưa chọn)

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        console.log('Form values before submit:', values);
        onOk(values);
        resetForm();
      })
      .catch((error) => {
        console.log('Form validation failed:', error);
      });
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const resetForm = () => {
    form.resetFields();
    setRating(0); // Reset rating về 0 (chưa chọn)
  };

  const handleRatingChange = (value: number) => {
    console.log('Rating changed to:', value); // Debug log
    setRating(value);
    form.setFieldsValue({ rating: value });
  };

  return (
    <Modal
      title="Đánh giá dự án"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="Gửi đánh giá"
      cancelText="Hủy"
      width={720}
      okButtonProps={{
        icon: <SendOutlined />,
      }}

      afterClose={resetForm}
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
      <Form
        form={form}
        layout="vertical"
        initialValues={{ rating: 0 }} //  Bắt đầu với 0 sao
      >
        {/* Đánh giá tổng thể */}
        <Form.Item
          name="rating"
          label="Đánh giá mức độ hài lòng tổng thể"
          rules={[
            { required: true, message: 'Vui lòng chọn mức độ hài lòng!' },
            {
              validator: (_, value) => {
                if (!value || value === 0) {
                  return Promise.reject(new Error('Vui lòng chọn số sao đánh giá!'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <RatingProject
            value={rating}
            onChange={handleRatingChange}
          // Cho phép người dùng thay đổi đánh giá
          />
        </Form.Item>

        <Form.Item
          name="comment"
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
          name="suggest"
          label="Ý kiến đóng góp / phản hồi thêm"
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