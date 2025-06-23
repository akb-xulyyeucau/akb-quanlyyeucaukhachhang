import React, { useEffect, useState } from 'react';
import { Modal, Button, Descriptions, Table, Typography, Space, Spin, message } from 'antd';
import { 
  SaveOutlined, 
  CloseCircleOutlined
} from '@ant-design/icons';
import { getProjectById } from '../services/project.service';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import FileText from '../../../common/components/FileText';

interface ModalApproveProjectProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (projectId: string) => void;
  projectId: string;
}

const ModalApproveProject: React.FC<ModalApproveProjectProps> = ({
  isOpen,
  onClose,  
  onApprove,
  projectId
}) => {
  const { t } = useTranslation('projectRequest');
  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [approving, setApproving] = useState<boolean>(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (projectId) {
        setLoading(true);
        try {
          const response = await getProjectById(projectId);
          if (response.success) {
            setProjectData(response.data);
          }
        } catch (error) {
          console.error('Lỗi khi lấy thông tin dự án:', error);
          message.error(t('ModalApproveProject.getProjectInforError'));
        } finally {
          setLoading(false);
        }
      }
    };

    if (isOpen) {
      fetchProjectData();
    }
  }, [projectId, isOpen]);

  const handleApprove = async () => {
    setApproving(true);
    try {
      await onApprove(projectData._id);
      onClose();
    } catch (error) {
      console.error('Lỗi khi duyệt dự án:', error);
      message.error(t('ModalApproveProject.approveError'));
    } finally {
      setApproving(false);
    }
  };

  const documentColumns = [
    {
      title: t('ModalApproveProject.documents.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('ModalApproveProject.documents.day'),
      dataIndex: 'day',
      key: 'day',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: t('ModalApproveProject.documents.files'),
      dataIndex: 'files',
      key: 'fileCount',
      render: (files: any[]) => files.length
    },
    {
      title: t('ModalApproveProject.documents.detail'),
      key: 'action',
      render: (_: any, record: any) => (
        <Space direction="vertical" style={{ width: '100%' }}>
          {record.files.map((file: any, index: number) => (
            <FileText
              key={index}
              originalName={file.originalName}
              filePath={file.path}
            />
          ))}
        </Space>
      )
    }
  ];

  return (
    <Modal
      title= {t('ModalApproveProject.projectDetail.title')}
      open={isOpen}
      onCancel={onClose}
      onOk={handleApprove}
      width={1000}
      confirmLoading={approving}
      footer={[
        <Button key="cancel" icon={<CloseCircleOutlined />} onClick={onClose}>
          {t('ModalApproveProject.projectDetail.cancel')}
        </Button>,
        <Button 
          key="save" 
          type="primary" 
          icon={<SaveOutlined />} 
          onClick={handleApprove}
          loading={approving}
        >
          {t('ModalApproveProject.projectDetail.approve')}
        </Button>
      ]}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      ) : projectData && (
        <>
          <Descriptions bordered column={2}>
            <Descriptions.Item label={t('ModalApproveProject.projectDetail.alias')}>{projectData.alias}</Descriptions.Item>
            <Descriptions.Item label={t('ModalApproveProject.projectDetail.name')}>{projectData.name}</Descriptions.Item>
            <Descriptions.Item label= {t('ModalApproveProject.projectDetail.PM')}>{projectData.pm.name}</Descriptions.Item>
            <Descriptions.Item label={t('ModalApproveProject.projectDetail.PMEmail')}>{projectData.pm.emailContact}</Descriptions.Item>
            <Descriptions.Item label={t('ModalApproveProject.projectDetail.customer')}>{projectData.customer.name}</Descriptions.Item>
            <Descriptions.Item label={t('ModalApproveProject.projectDetail.customerEmail')}>{projectData.customer.emailContact}</Descriptions.Item>
            <Descriptions.Item label={t('ModalApproveProject.projectDetail.status')}>{projectData.status}</Descriptions.Item>
            <Descriptions.Item label={t('ModalApproveProject.projectDetail.startDate')}>{dayjs(projectData.day).format('DD/MM/YYYY')}</Descriptions.Item>
          </Descriptions>

          <Typography.Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>
            {t('ModalApproveProject.documents.title')}
          </Typography.Title>
          
          <Table 
            columns={documentColumns}
            dataSource={projectData.documentIds}
            rowKey="_id"
            loading={loading}
          />
        </>
      )}
    </Modal>
  );
};

export default ModalApproveProject;