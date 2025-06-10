import { Modal, Descriptions, Tag, Spin, Button, Typography, message } from "antd";
import { CloseCircleOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { getProfile, createProfile, updateProfile, updateUserActive } from '../services/user.service';
import ModalProfileForm from '../components/ModalProfileForm';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

const getRoleTag = (role: string, t: any) => {
  switch (role) {
    case "admin":
      return <Tag color="red">{t('modal_user_detail.role_admin')}</Tag>;
    case "pm":
      return <Tag color="blue">{t('modal_user_detail.role_pm')}</Tag>;
    case "guest":
      return <Tag color="green">{t('modal_user_detail.role_guest')}</Tag>;
    default:
      return <Tag>{role}</Tag>;
  }
};

const ModalUserDetail = ({ open, user, onCancel, onRefreshData }: any) => {
  const { t } = useTranslation('user');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [profileData, setProfileData] = useState<any>(null); 

  useEffect(() => {
    if (open && user && user.role !== "admin") {
      setLoading(true);
      getProfile(user.role, user._id)
        .then(res => setProfile(res?.data || null))
        .finally(() => setLoading(false));
    } else {
      setProfile(null);
    }
  }, [open, user]);

  const handleAddProfile = (userId: string, userRole: string) => {
    console.log(`UserId ${userId}, UserRole: ${userRole}`);
    setProfileData(null);
    setOpenProfileModal(true);
  };

  const handleEditProfile = (userId: string, userRole: string, profile: any) => {
    console.log(`UserID: ${userId}, UserRole: ${userRole}`);
    console.log("Profile:", profile);
    setProfileData(profile);
    setOpenProfileModal(true);
  };

  const handleSaveProfile = async (values: any) => {
    try {
      setLoading(true);
      const { alias, ...dataToSend } = values;      
      if (dataToSend.dob) {
        dataToSend.dob = dataToSend.dob.toISOString();
      }

      if (profileData) {
        const updateRes = await updateProfile(user.role, profileData._id, dataToSend);
        if (updateRes.success) {
          message.success(updateRes.message);
        }
      } else {
        const createRes = await createProfile(user.role, {
          ...dataToSend,
          userId: user._id
        });

        if (createRes.success) {
          const activeRes = await updateUserActive(user._id, true);
          if (activeRes.success) {
            message.success(createRes.message);
            onRefreshData?.();
          }
        }
      }

      setOpenProfileModal(false);

      try {
        const profileRes = await getProfile(user.role, user._id);
        if (profileRes?.data) {
          setProfile(profileRes.data);
        }
      } catch (err: any) {
        console.error('Error reloading profile:', err.message);
        message.error(err.message);
      }
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={onCancel}
        footer={[
          <Button key="close" onClick={onCancel} icon={<CloseCircleOutlined />}>
            {t('modal_user_detail.close_button')}
          </Button>
        ]}
        width={700}
        title={null}
      >
        {user && (
          <>
            <Title level={4} style={{ marginBottom: 16, textAlign: "center" }}>
              {t('modal_user_detail.title_prefix')}: <span>{user.alias}</span>
            </Title>
            <Descriptions column={2} bordered size="middle" style={{ marginBottom: 24 }}>
              <Descriptions.Item label={t('modal_user_detail.alias_label')}>{user.alias}</Descriptions.Item>
              <Descriptions.Item label={t('modal_user_detail.updated_at_label')}>
                {user.updatedAt ? dayjs(user.updatedAt).format("DD/MM/YYYY") : ""}
              </Descriptions.Item>            
              <Descriptions.Item label={t('modal_user_detail.role_label')}>
                {getRoleTag(user.role, t)}
              </Descriptions.Item>
              <Descriptions.Item label={t('modal_user_detail.created_at_label')}>
                {user.createdAt ? dayjs(user.createdAt).format("DD/MM/YYYY") : ""}
              </Descriptions.Item>
              <Descriptions.Item label={t('modal_user_detail.email_label')}>
                {user.email}
              </Descriptions.Item>
            </Descriptions>

            {user.role !== "admin" && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                  <Title level={5} style={{ margin: 0, flex: 1 }}>
                    {t('modal_user_detail.profile_section_title')}
                  </Title>
                  {loading ? null : profile ? (
                    <Button
                      type="primary"
                      onClick={() => handleEditProfile(user._id, user.role, profile)}
                      icon={<EditOutlined />}
                    >
                      {t('modal_user_detail.edit_profile_button')}
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      onClick={() => handleAddProfile(user._id, user.role)}
                      icon={<PlusOutlined />}
                    >
                      {t('modal_user_detail.add_profile_button')}
                    </Button>
                  )}
                </div>
                {loading ? (
                  <Spin />
                ) : profile ? (
                  <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label={t('modal_user_detail.alias_label')}>
                      {profile.alias}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('modal_user_detail.name_label')}>
                      {profile.name}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('modal_user_detail.email_contact_label')}>
                      {profile.emailContact}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('modal_user_detail.phone_contact_label')}>
                      {profile.phoneContact}
                    </Descriptions.Item>
                    {profile.companyName && (
                      <Descriptions.Item label={t('modal_user_detail.company_name_label')}>
                        {profile.companyName}
                      </Descriptions.Item>
                    )}
                    {profile.address && (
                      <Descriptions.Item label={t('modal_user_detail.address_label')}>
                        {profile.address}
                      </Descriptions.Item>
                    )}
                    {profile.dob && (
                      <Descriptions.Item label={t('modal_user_detail.dob_label')}>
                        {dayjs(profile.dob).format("DD/MM/YYYY")}
                      </Descriptions.Item>
                    )}
                    {profile.note && (
                      <Descriptions.Item label={t('modal_user_detail.note_label')}>
                        {profile.note}
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label={t('modal_user_detail.created_at_label')}>
                      {profile.createdAt ? dayjs(profile.createdAt).format("DD/MM/YYYY") : ""}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('modal_user_detail.updated_at_label')}>
                      {profile.updatedAt ? dayjs(profile.updatedAt).format("DD/MM/YYYY") : ""}
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <div style={{ marginBottom: 8 }}>{t('modal_user_detail.no_profile_text')}</div>
                )}
              </div>
            )}
          </>
        )}
      </Modal>
      <ModalProfileForm
        open={openProfileModal}
        onCancel={() => setOpenProfileModal(false)}
        onOk={handleSaveProfile}
        userRole={user?.role}
        profile={profileData}
        loading={loading}
        mode={profileData ? "edit" : "add"}
      />
    </>
  );
};

export default ModalUserDetail;