import { useSelector } from 'react-redux';
import { Card, Row, Col, Typography, Descriptions, Avatar, Tag, Divider } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, BankOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { selectUserProfile , selectAuthUser } from '../../common/stores/auth/authSelector';
dayjs.extend(utc);

const { Title } = Typography;

const UserProfile = () => {
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

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('DD/MM/YYYY');
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
            <Divider orientation="left">Thông tin người dùng</Divider>
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
              <Descriptions.Item label="Mã">
                {user?.alias}
              </Descriptions.Item>
              <Descriptions.Item label={<><MailOutlined /> Email</>}>
                {user?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={user?.isActive === true ? 'green' : 'red'}>
                  {user?.isActive === true ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {formatDateTime(user?.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cập nhật">
                {formatDateTime(user?.updatedAt)}
              </Descriptions.Item>
            </Descriptions>
          </Col>

          {profile && (
            <Col span={24}>
              <Divider orientation="left">Thông tin cá nhân</Divider>
              <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
                <Descriptions.Item label="Mã">
                  {profile.alias}
                </Descriptions.Item>
                <Descriptions.Item label={<><MailOutlined /> Email liên hệ</>}>
                  {profile.emailContact}
                </Descriptions.Item>
                <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
                  {profile.phoneContact}
                </Descriptions.Item>
                <Descriptions.Item label={<><CalendarOutlined /> Ngày sinh</>}>
                  {profile.dob ? dayjs(profile.dob).format('DD/MM/YYYY') : 'N/A'}
                </Descriptions.Item>
                
                {user?.role === 'guest' && (
                  <>
                    <Descriptions.Item label={<><BankOutlined /> Công ty</>}>
                      {profile.companyName || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label={<><HomeOutlined /> Địa chỉ</>}>
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
