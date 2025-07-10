import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { loginSuccess, setProfile } from '../../common/stores/auth/authSlice';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../common/components/LanguageSwitcher';
import { login, me } from './login.service';
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
  const [userProfile, setUserProfile] = useState<any>(null);

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
        try {
          const meResponse = await me(userData._id);
          if (meResponse && meResponse.data.user.isActive) {
            setUserProfile(meResponse.data.profile);
            dispatch(setProfile(meResponse.data.profile));
          } else {
            dispatch(setProfile(null));
          }
        } catch (error: any) {
          console.error('Error fetching profile:', error);
          dispatch(setProfile(null));
          message.error(error.message);
        }
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
        <div style={{ textAlign: 'center', marginBottom: 25, fontSize: '40px' }}>
          <img
            src="/akb-icon.ico"
            alt="Logo"
            style={{
              width: '100px',
              marginBottom: '10px'
            }}
          />
          <p style={{ fontSize: '15px', color: '#333', fontWeight: 500 }}>
            {t('slogan')}
          </p>

          {/* Căn giữa LanguageSwitcher */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <LanguageSwitcher />
          </div>
        </div>


        {/* <h2 style={{ textAlign: 'center', marginBottom: 24 }}>{t('login')}</h2> */}

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
            <Button type="primary" htmlType="submit" block size="large" loading={loading} icon={<LoginOutlined />}>
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

          <span style={{ fontSize: '12px', color: '#8c8c8c' }}><em>{t('footer')}</em></span>
        </div>
      </Card>
    </div>
  );
};

export default Login;