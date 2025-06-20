import React, { useEffect, useState } from 'react';
import { Modal, Button, Descriptions, Table, Typography, Space, Tooltip, message, Spin } from 'antd';
import { 
  SaveOutlined, 
  CloseCircleOutlined, 
  FileWordOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  DownloadOutlined 
} from '@ant-design/icons';
import { getProjectById } from '../services/project.service';
import { downloadFile } from '../services/document.service';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

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

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'doc':
      case 'docx':
        return <FileWordOutlined style={{ color: '#2B579A' }} />;
      case 'xls':
      case 'xlsx':
        return <FileExcelOutlined style={{ color: '#217346' }} />;
      case 'pdf':
        return <FilePdfOutlined style={{ color: '#FF0000' }} />;
      default:
        return <FileWordOutlined />;
    }
  };

  const handleDownload = async (file: any) => {
    try {
      const response = await downloadFile(file.path);
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Lỗi khi tải file:', error);
      message.error(t('ModalApproveProject.dowFileError'));
    }
  };

  const handleApprove = async () => {
    setApproving(true);
    try {
      await onApprove(projectData._id);
      message.success(t('ModalApproveProject.approveSuccess'));
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
            <Tooltip title={t('ModalApproveProject.documents.detailHover')} key={index}>
              <Typography.Link onClick={() => handleDownload(file)}>
                <Space>
                  {getFileIcon(file.originalName)}
                  {file.originalName}
                  <DownloadOutlined />
                </Space>
              </Typography.Link>
            </Tooltip>
          ))}
        </Space>
      )
    }
  ];

  return (
    <Modal
      title= {t('ModalApproveProject.ProjectDetail.title')}
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
            Danh sách tài liệu
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