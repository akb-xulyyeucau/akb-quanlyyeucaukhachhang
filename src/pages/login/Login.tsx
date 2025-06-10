import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../common/stores/auth/authSlice';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../common/components/LanguageSwitcher';
import { login } from './login.service';
import { useNavigate } from 'react-router-dom';

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { t } = useTranslation('login');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const response = await login(values.email, values.password);
      if (response && response.data && response.data.accessToken) {
        const { accessToken, ...userData } = response.data;

        Cookies.set('accessToken', accessToken, { expires: 7 });
        dispatch(loginSuccess({ 
          user: userData,
          token: accessToken 
        }));
      //  message.success(response.message);
      setTimeout(() => {
        navigate('/home');
      }, 150);
        message.success(response.message);
      } else {
        message.error(response.message);
      }
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 10, fontSize: '15px' }}>
          <img 
            src="/akb-icon.ico" 
            alt="Logo" 
            style={{ 
              width: '100px', 
              marginBottom: '16px' 
            }} 
          />
          <p style={{ fontSize: '12px', color: '#8c8c8c' }}>
            <em>{t('slogan')}</em>
          </p>
          
          {/* Căn giữa LanguageSwitcher */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <LanguageSwitcher />
          </div>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>{t('login')}</h2>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: t('email_required') },
              { type: 'email', message: t('email_invalid') }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder={t('email')} 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: t('password_required') }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('password')}
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              {t('login')}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ 
          textAlign: 'center', 
          fontSize: '12px', 
          color: '#8c8c8c',
          marginTop: '16px'
        }}>
          {t('slogan')} <br/>
          <span style={{ fontSize: '12px', color: '#8c8c8c' }}><em>{t('footer')}</em></span>
        </div>
      </Card>
    </div>
  );
};

export default Login;