import { Modal, Form, Input, Select } from "antd";
import { useEffect } from "react";
import { useTranslation } from 'react-i18next';

const { Option } = Select;

interface ModalAddUserProps {
  open: boolean;
  onOk: (values: any) => void;
  onCancel: () => void;
  isError?: boolean;
  errorMessage?: string;
  onResetError: () => void;
}

const ModalAddUser = ({ open, onOk, onCancel, isError, errorMessage, onResetError }: ModalAddUserProps) => {
  const { t } = useTranslation('user');
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onOk(values); // Call onOk to handle user creation
      // if (!isError) {
      //   form.resetFields(); // Reset form only on success
      // }
      form.resetFields(); // Reset form after successful submission
    } catch (err) {
      // Validation failed, do nothing (Ant Design will show validation errors)
    }
  };

  useEffect(() => {
    if (isError && errorMessage) {
      form.setFields([
        {
          name: "email_user",
          errors: [errorMessage],
        },
      ]);
    } else {
      // Clear errors if no error
      form.setFields([
        {
          name: "email_user",
          errors: [],
        },
      ]);
    }
    console.log(`Error state: ${isError}, Error message: ${errorMessage}`);
  }, [isError, errorMessage, form]);

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
      destroyOnHidden={true}
    >
      <Form
        form={form}
        layout="vertical"
        name="add_user"
        autoComplete="off"
      >
        <Form.Item
          label={t('modal_add_user.email_label')}
          name="email_user"
          rules={[
            { required: true, message: t('modal_add_user.email_required') },
            { type: "email", message: t('modal_add_user.email_invalid') },
            { whitespace: true, message: t('modal_add_user.email_whitespace') },
          ]}
          hasFeedback // Enable visual feedback for validation
          help={isError ? errorMessage : undefined} // Show error message below the field
        >
         <Input
            placeholder={t('modal_add_user.email_placeholder')}
            onChange={() => {
              form.setFields([
                {
                  name: "email_user",
                  errors: [], // Xóa lỗi của trường email
                },
              ]);
              onResetError(); // Gọi hàm reset lỗi từ cha
            }}
          />
        </Form.Item>
        <Form.Item
          label={t('modal_add_user.password_label')}
          name="password_user"
          rules={[
            { required: true, message: t('modal_add_user.password_required') },
            { min: 6, message: t('modal_add_user.password_min_length') },
          ]}
          hasFeedback
        >
          <Input.Password placeholder={t('modal_add_user.password_placeholder')} />
        </Form.Item>
        <Form.Item
          label={t('modal_add_user.confirm_password_label')}
          name="confirm_password_user"
          dependencies={['password_user']}
          hasFeedback
          rules={[
            { required: true, message: t('modal_add_user.confirm_password_required') },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password_user') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(t('modal_add_user.confirm_password_mismatch'));
              },
            }),
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