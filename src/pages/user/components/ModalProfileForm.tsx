import { Modal, Form, Input, DatePicker, Row, Col } from "antd";
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from "dayjs";
import { useEffect } from "react";
import { useTranslation } from 'react-i18next';

const ModalProfileForm = ({
  open,
  onCancel,
  onOk,
  userRole,
  profile,
  loading,
  mode = "add",
}: {
  open: boolean;
  onCancel: () => void;
  onOk: (values: any) => void;
  userRole: "pm" | "guest";
  profile?: any;
  loading?: boolean;
  mode?: "add" | "edit";
}) => {
  const { t } = useTranslation('user');
  const [form] = Form.useForm();

  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        ...profile,
        dob: profile.dob ? dayjs(profile.dob) : undefined,
      });
    } else {
      form.resetFields();
    }
  }, [profile, form, open]);

  const commonFields = (
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item label={t('modal_profile_form.alias_label')} name="alias">
          <Input disabled />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={t('modal_profile_form.name_label')}
          name="name"
          rules={[{ required: true, message: t('modal_profile_form.name_required') }]}
        >
          <Input />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={t('modal_profile_form.email_contact_label')}
          name="emailContact"
          rules={[
            { required: true, message: t('modal_profile_form.email_contact_required') },
            { type: "email", message: t('modal_profile_form.email_contact_invalid') },
          ]}
        >
          <Input />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={t('modal_profile_form.phone_contact_label')}
          name="phoneContact"
          rules={[{ required: true, message: t('modal_profile_form.phone_contact_required') }]}
        >
          <Input />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label={t('modal_profile_form.dob_label')} name="dob">
          <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
        </Form.Item>
      </Col>
    </Row>
  );

  const guestFields = (
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item label={t('modal_profile_form.company_name_label')} name="companyName">
          <Input />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label={t('modal_profile_form.address_label')} name="address">
          <Input />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item label={t('modal_profile_form.note_label')} name="note">
          <Input.TextArea rows={2} />
        </Form.Item>
      </Col>
    </Row>
  );

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      title={mode === "edit" ? t('modal_profile_form.edit_title') : t('modal_profile_form.add_title')}
      confirmLoading={loading}
      destroyOnHidden
      width={800}
      okText={<><CheckOutlined /> {t('modal_profile_form.ok_text')}</>}
      cancelText={<><CloseOutlined /> {t('modal_profile_form.cancel_text')}</>}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onOk}
        initialValues={
          profile
            ? { ...profile, dob: profile.dob ? dayjs(profile.dob) : undefined }
            : {}
        }
      >
        {commonFields}
        {userRole === "guest" && guestFields}
      </Form>
    </Modal>
  );
};

export default ModalProfileForm;