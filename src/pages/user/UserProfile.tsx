import { useSelector } from 'react-redux';
import { Card, Row, Col, Typography, Descriptions, Avatar, Tag, Divider } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, BankOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { selectUserProfile, selectAuthUser } from '../../common/stores/auth/authSelector';
dayjs.extend(utc);
import { useTranslation } from 'react-i18next';


const { Title } = Typography;

const UserProfile = () => {
  const [t] = useTranslation('user');
  const user = useSelector(selectAuthUser);
  const profile = useSelector(selectUserProfile);

  const getRoleColor = (role: string | undefined) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'red';
      case 'guest':
        return 'orange';
      case 'pm':
        return 'blue';
      default:
        return 'default';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar
                size={100}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1890ff' }}
              />
              <Title level={3} style={{ marginTop: 16, marginBottom: 8 }}>
                {profile?.name || user?.email}
              </Title>
              <Tag color={getRoleColor(user?.role)}>
                {user?.role?.toUpperCase() || 'N/A'}
              </Tag>
            </div>
          </Col>

          <Col span={24}>
            <Divider orientation="left"> {t('userProfile.title')} </Divider>
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
              <Descriptions.Item label={t('userProfile.alias')}>
                {user?.alias}
              </Descriptions.Item>
              <Descriptions.Item label={<><MailOutlined />  {t('userProfile.email')}</>}>
                {user?.email}
              </Descriptions.Item>
              <Descriptions.Item label={t('userProfile.status')}>
                <Tag color={user?.isActive ? 'green' : 'red'}>
                  {user?.isActive ? t('userProfile.isActiveStatus') : t('userProfile.inActiveStatus')}
                </Tag>
              </Descriptions.Item>
              {/* <Descriptions.Item label="Ngày tạo">
                {formatDateTime(user?.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cập nhật">
                {formatDateTime(user?.updatedAt)}
              </Descriptions.Item> */}
            </Descriptions>
          </Col>

          {profile && (
            <Col span={24}>
              <Divider orientation="left">{t('userProfile.personalInformation.Title')}</Divider>
              <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
                <Descriptions.Item label={t('userProfile.personalInformation.alias')}>
                  {profile.alias}
                </Descriptions.Item>
                <Descriptions.Item label={<><MailOutlined /> {t('userProfile.personalInformation.email')}</>}>
                  {profile.emailContact}
                </Descriptions.Item>
                <Descriptions.Item label={<><PhoneOutlined /> {t('userProfile.personalInformation.phoneNumber')}</>}>
                  {profile.phoneContact}
                </Descriptions.Item>
                <Descriptions.Item label={<><CalendarOutlined /> {t('userProfile.personalInformation.birth')}</>}>
                  {profile.dob ? dayjs(profile.dob).format('DD/MM/YYYY') : 'N/A'}
                </Descriptions.Item>

                {user?.role === 'guest' && (
                  <>
                    <Descriptions.Item label={<><BankOutlined /> {t('userProfile.personalInformation.company')}</>}>
                      {profile.companyName || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label={<><HomeOutlined /> {t('userProfile.personalInformation.address')}</>}>
                      {profile.address || 'N/A'}
                    </Descriptions.Item>
                  </>
                )}
              </Descriptions>
            </Col>
          )}
        </Row>
      </Card>
    </div>
  );
};

export default UserProfile;
