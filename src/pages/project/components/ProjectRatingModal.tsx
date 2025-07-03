import { Modal, Form, Input, Typography, Row, Col, Divider } from 'antd';
import React, { useState } from 'react';
import { SendOutlined } from '@ant-design/icons';
import RatingProject from '../../../common/components/RatingProject';
import { useTranslation } from 'react-i18next'; // Thêm import useTranslation

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
  const { t } = useTranslation('projectResponse'); // Sử dụng namespace 'projectRatingModal'
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
      title={t('ProjectRatingModal.modalTitle')}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={t('ProjectRatingModal.okText')}
      cancelText={t('ProjectRatingModal.cancelText')}
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
              {t('ProjectRatingModal.projectNameLabel')}: <span style={{ fontWeight: 600 }}>{projectName}</span>
            </div>
          </Col>
        </Row>

        <Row gutter={24} style={{ marginTop: 12 }}>
          <Col span={12}>
            <div>
              <Text strong>{t('ProjectRatingModal.customerLabel')}:</Text>{' '}
              <span>{customerName}</span>
            </div>
          </Col>
          <Col span={12}>
            <div>
              <Text strong>{t('ProjectRatingModal.executionTimeLabel')}:</Text>{' '}
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
          label={t('ProjectRatingModal.overallRatingLabel')}
          rules={[
            { required: true, message: t('ProjectRatingModal.overallRatingRequired') },
            {
              validator: (_, value) => {
                if (!value || value === 0) {
                  return Promise.reject(new Error(t('ProjectRatingModal.ratingStarsRequired')));
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
          label={t('ProjectRatingModal.commentLabel')}
        >
          <Input.TextArea
            rows={3}
            placeholder={t('ProjectRatingModal.commentPlaceholder')}
          />
        </Form.Item>

        <Divider />

        {/* Ý kiến đóng góp */}
        <Form.Item
          name="suggest"
          label={t('ProjectRatingModal.suggestionLabel')}
        >
          <Input.TextArea
            rows={4}
            placeholder={t('ProjectRatingModal.suggestionPlaceholder')}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProjectRatingModal;