import { Modal, Form, Input, Select } from "antd";
import { useTranslation } from 'react-i18next';

const { Option } = Select;

interface ModalAddUserProps {
  open: boolean;
  onOk: (values: any) => void;
  onCancel: () => void;
}

const ModalAddUser = ({ open, onOk, onCancel }: ModalAddUserProps) => {
  const { t } = useTranslation('user');
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
      form.resetFields();
    } catch (err) {
    }
  };

  return (
    <Modal
      title={t('modal_add_user.title')}
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      okText={t('modal_add_user.ok_text')}
      cancelText={t('modal_add_user.cancel_text')}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        name="add_user"
        autoComplete="off"
      >
        <Form.Item
          label={t('modal_add_user.email_label')}
          name="email"
          rules={[
            { required: true, message: t('modal_add_user.email_required') },
            { type: "email", message: t('modal_add_user.email_invalid') },
          ]}
          hasFeedback
        >
          <Input placeholder={t('modal_add_user.email_placeholder')} />
        </Form.Item>
        <Form.Item
          label={t('modal_add_user.password_label')}
          name="password"
          rules={[
            { required: true, message: t('modal_add_user.password_required') },
            { min: 6, message: t('modal_add_user.password_min_length') }
          ]}
          hasFeedback
        >
          <Input.Password placeholder={t('modal_add_user.password_placeholder')} />
        </Form.Item>
        <Form.Item
          label={t('modal_add_user.confirm_password_label')}
          name="confirm"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: t('modal_add_user.confirm_password_required') },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(t('modal_add_user.confirm_password_mismatch'));
              }
            })
          ]}
        >
          <Input.Password placeholder={t('modal_add_user.confirm_password_placeholder')} />
        </Form.Item>
        <Form.Item
          label={t('modal_add_user.role_label')}
          name="role"
          rules={[{ required: true, message: t('modal_add_user.role_required') }]}
        >
          <Select placeholder={t('modal_add_user.role_placeholder')}>
            <Option value="admin">{t('modal_add_user.role_admin')}</Option>
            <Option value="pm">{t('modal_add_user.role_pm')}</Option>
            <Option value="guest">{t('modal_add_user.role_guest')}</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalAddUser;