import React, { useState } from 'react';
import { Layout, Menu, Avatar, Button, Dropdown, Modal, Divider } from 'antd';
import {
  MenuUnfoldOutlined,
  ProjectOutlined,
  //AppstoreOutlined
  FormOutlined,
  MenuFoldOutlined,
  UserOutlined,
  LogoutOutlined,
  MailOutlined,
  SafetyOutlined,
  HomeOutlined,
  TeamOutlined,
  SettingOutlined,
  IdcardOutlined,
  ProfileOutlined,
  TagOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { logout } from './logout.service';
const { Header, Sider, Content } = Layout;
import { useNavigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutRedux } from '../../common/stores/auth/authSlice';
import { selectAuthUser, selectUserProfile } from '../../common/stores/auth/authSelector';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import AppFooter from './AppFooter';

const MainLayout: React.FC = () => {
  const { t } = useTranslation('mainLayout');
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const user = useSelector(selectAuthUser);
  const userProfile = useSelector(selectUserProfile) || "";

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  const dispatch = useDispatch();
  const handleLogout = async () => {
    try {
      const res = await logout();
      if (res && res.success) {
        Cookies.remove('accessToken');
        dispatch(logoutRedux());
        navigate('/login');
        message.success(res.message);
      } else {
        message.error(res.message);
      }
    } catch (error: any) {
      console.error('Đã xảy ra lỗi khi đăng xuất: ', error.message);
      message.error(error.message);
    }
  };

  const handleMenuClick = (key: string) => {
    navigate(`/${key}`);
  };

  const handleUserProfile = (uId: string) => {
    navigate(`/user-profile/${uId}`);
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          position: 'fixed',
          top: 0,
          zIndex: 100,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          background: '#fff',
          boxShadow: '0 2px 8px #f0f1f2',
          padding: '0 24px',
          justifyContent: 'space-between',
          height: '64px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: 'trigger',
            onClick: toggleCollapsed,
            style: { fontSize: 20, cursor: 'pointer' },
          })}
          <img
            src="/akb-icon.ico"
            alt="avatar"
            style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
          />
          <div style={{ fontWeight: 700, fontSize: 20 }}>{t('title')}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'alias',
                  icon: <UserOutlined />,
                  label: user?.alias || '---',
                },
                {
                  key: 'email',
                  icon: <MailOutlined />,
                  label: user?.email || '---',
                },
                {
                  key: 'role',
                  icon: <SafetyOutlined />,
                  label: user?.role || '---',
                },
                {
                  key: 'action',
                  label: (
                    <Button onClick={() => { handleUserProfile(user?._id ?? '') }} type="link">
                      {t('personal_info')}
                    </Button>
                  ),
                },
                {
                  key: 'divider',
                  type: 'divider',
                },
                {
                  key: 'language',
                  label: (
                    <div style={{ padding: '4px 0' }}>
                      <LanguageSwitcher />
                    </div>
                  ),
                },
              ],
            }}
            placement="bottomRight"
            arrow
          >
            <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
          </Dropdown>
          <span style={{ fontWeight: 500 }}>{typeof userProfile === 'object' && userProfile !== null ? userProfile.name : user?.email}</span>
          <Button
            icon={<LogoutOutlined />}
            type="primary"
            danger
            onClick={() => {
              Modal.confirm({
                title: t('confirm_logout_title'),
                content: t('confirm_logout_content'),
                okText: t('ok_text'),
                cancelText: t('cancel_text'),
                okType: 'danger',
                centered: false,
                onOk: handleLogout,
              });
            }}
          >
            {t('logout')}
          </Button>
        </div>
      </Header>
      <Layout style={{
        marginTop: '64px',
        background: '#fff',
        display: 'flex',
        flexDirection: 'row'
      }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          style={{
            background: '#fff',
            boxShadow: '2px 0 8px #f0f1f2',
            position: 'fixed',
            height: 'calc(100vh - 64px)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
          width={260}
        >
          <Menu
            mode="inline"
            theme="light"
            defaultSelectedKeys={['1']}
            style={{ 
              borderRight: 0,
              flex: 1
            }}
            onClick={({ key }) => handleMenuClick(key)}
          >
            <Menu.Item key="home" icon={<HomeOutlined />}>
              {t('menu.home')}
            </Menu.Item>
            <Menu.SubMenu key="project" title={t('menu.customer_projects')} icon={<ProfileOutlined />}>
              <Menu.Item key="customers-projects" icon={<ProjectOutlined />}>
                {t('menu.customer_projects')}
              </Menu.Item>
              <Menu.Item key="customers-projects-request" icon={<FormOutlined />}>
                {t('menu.customer_projects_request')}
              </Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu key="users" title={t('menu.users')} icon={<UserOutlined />}>
              <Menu.Item key="user" icon={<IdcardOutlined />}>
                {t('menu.user_management')}
              </Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu key="customer" icon={<TeamOutlined />} title={t('menu.customer')}>
              <Menu.Item key="customers" icon={<TagOutlined />}>
                {t('menu.customer_info')}
              </Menu.Item>
              {/* <Menu.Item key="customers-projects" icon={<ProfileOutlined />}>
                {t('menu.customer_projects')}
              </Menu.Item> */}
            </Menu.SubMenu>
            <Menu.SubMenu key="system" icon={<SettingOutlined />} title={t('menu.system')}>
              <Menu.Item key="system-email" icon={<MailOutlined />}>
                {t('menu.system_email')}
              </Menu.Item>
              <Menu.Item key="system-setting" icon={<DatabaseOutlined />}>
                {t('menu.system_setting')}
              </Menu.Item>
            </Menu.SubMenu>
          </Menu>
          
          <div style={{ 
            borderTop: '1px solid #f0f0f0',
            background: '#fff'
          }}>
            <Menu
              mode="inline"
              theme="light"
              style={{ 
                border: 'none',
                background: '#f0f7ff'
              }}
              selectedKeys={[]}
            >
              <Menu.Item 
                key="language-switcher" 
                style={{ 
                  padding: '0',
                  margin: 0,
                  height: '40px',
                  lineHeight: '40px'
                }}
              >
                <LanguageSwitcher />
              </Menu.Item>
            </Menu>
          </div>
        </Sider>
        <Layout style={{ 
          marginLeft: collapsed ? '80px' : '260px',
          transition: 'margin-left 0.2s',
          background: '#fff',
          padding: '0 24px'
        }}>
          <Content style={{
            minHeight: 'calc(100vh - 64px)',
            background: 'white',
            padding: '10px',
            overflowY: 'auto'
          }}>
            <Outlet />
          </Content>
          <AppFooter />
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;