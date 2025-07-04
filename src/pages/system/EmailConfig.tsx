import { SaveOutlined } from '@ant-design/icons';
import { Card, Form, Input, Select, Switch, Button, message, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { createEmailConfig, getEmailConfig, updateEmailConfig } from './services/mail.service';
import {   selectAuthUser , selectUserProfile } from '../../common/stores/auth/authSelector';
import { useSelector } from 'react-redux';
interface MailConfig {
  _id: string;
  serviceName: string;
  host: string;
  port: number;
  encryptMethod: string;
  user: string;
  pass: string;
  secure: boolean;
  senderName: string;
}

const EmailConfig = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [encryptionMethod, setEncryptionMethod] = useState('SSL');
  const [loading, setLoading] = useState(true);
  const [mailConfig, setMailConfig] = useState<MailConfig | null>(null);
  const user = useSelector(selectAuthUser);
  const profile = useSelector(selectUserProfile);
  useEffect(() => {
    fetchMailConfig();
  }, []);

  useEffect(() => {
    form.setFieldValue('port', encryptionMethod === 'SSL' ? '465' : '587');
  }, [encryptionMethod, form]);

  const fetchMailConfig = async () => {
    try {
      const response = await getEmailConfig();
      if (response.success && response.data) {
        setMailConfig(response.data);
        form.setFieldsValue({
          emailService: response.data.serviceName,
          encryptionMethod: response.data.encryptMethod,
          emailAddress: response.data.user,
          password: response.data.pass,
          senderName: response.data.senderName,
          host: response.data.host,
          port: response.data.port.toString(),
          secure: response.data.secure
        });
        setEncryptionMethod(response.data.encryptMethod);
      }
    } catch (error) {
      console.error('Error fetching mail config:', error);
      messageApi.error('Không thể tải cấu hình email');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    const loadingMessage = message.loading({
      content: mailConfig ? 'Đang cập nhật cấu hình email...' : 'Đang tạo mới cấu hình email...',
      key: 'mailConfigAction',
      duration: 0,
    });

    try {
      setLoading(true);
      const mailData = {
        serviceName: values.emailService,
        host: values.host,
        port: parseInt(values.port),
        encryptMethod: values.encryptionMethod,
        user: values.emailAddress,
        pass: values.password,
        secure: parseInt(values.port) === 465 ? true : false,
        senderName: values.senderName
      };

      if (mailConfig) {
        // Update existing config
        const response = await updateEmailConfig(mailData);
        if (response.success) {
          message.success({
            content: 'Cập nhật cấu hình email thành công!',
            key: 'mailConfigAction',
            duration: 3,
          });
          await fetchMailConfig();
        }
      } else {
        // Create new config
        const response = await createEmailConfig(mailData);
        if (response.success) {
          message.success({
            content: 'Tạo mới cấu hình email thành công!',
            key: 'mailConfigAction',
            duration: 3,
          });
          await fetchMailConfig();
        }
      }
    } catch (error: any) {
      message.error({
        content: error.message || 'Có lỗi xảy ra khi xử lý yêu cầu',
        key: 'mailConfigAction',
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {contextHolder}
      <Card title={mailConfig ? "Cập nhật cấu hình Email" : "Tạo mới cấu hình Email"} className="w-full max-w-4xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            emailService: 'Gmail',
            encryptionMethod: 'SSL',
            emailAddress: profile?.emailContact || '',
            senderName: profile?.name || '',
            host: 'smtp.gmail.com',
            secure: true
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg">Bật/tắt cấu hình gửi email</div>
            <Form.Item name="secure" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Dịch vụ"
              name="emailService"
              rules={[{ required: true, message: 'Vui lòng chọn dịch vụ email' }]}
            >
              <Select>
                <Select.Option value="Gmail">Gmail</Select.Option>
                <Select.Option value="Zoho">Zoho</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Phương thức mã hóa"
              name="encryptionMethod"
              rules={[{ required: true, message: 'Vui lòng chọn phương thức mã hóa' }]}
            >
              <Select onChange={(value) => setEncryptionMethod(value)}>
                <Select.Option value="SSL">SSL</Select.Option>
                <Select.Option value="TLS">TLS</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Địa chỉ email gửi"
              name="emailAddress"
              rules={[
                { required: true, message: 'Vui lòng nhập địa chỉ email' },
                { type: 'email', message: 'Địa chỉ email không hợp lệ' }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
              help="Nếu sử dụng dịch vụ Gmail, mật khẩu là mật khẩu ứng dụng (App Password)"
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="Tên người gửi"
              name="senderName"
              rules={[{ required: true, message: 'Vui lòng nhập tên người gửi' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Host"
              name="host"
              rules={[{ required: true, message: 'Vui lòng nhập host' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Cổng"
              name="port"
            >
              <Input disabled />
            </Form.Item>
          </div>

          <Form.Item className="flex justify-end mt-4">
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              loading={loading}
            >
              {mailConfig ? 'Cập nhật cấu hình' : 'Tạo mới cấu hình'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EmailConfig;
