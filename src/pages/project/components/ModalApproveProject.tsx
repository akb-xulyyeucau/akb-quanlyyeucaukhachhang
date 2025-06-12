import React, { useEffect, useState } from 'react';
import { Modal, Button, Descriptions, Table, Typography, Space } from 'antd';
import { SaveOutlined, CloseCircleOutlined, FileOutlined } from '@ant-design/icons';
import { getProjectById } from '../services/project.service';
import dayjs from 'dayjs';

interface ModalApproveProjectProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

const ModalApproveProject: React.FC<ModalApproveProjectProps> = ({
  isOpen,
  onClose,
  projectId
}) => {
  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (projectId) {
        setLoading(true);
        const response = await getProjectById(projectId);
        if (response.success) {
          setProjectData(response.data);
        }
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchProjectData();
    }
  }, [projectId, isOpen]);

  const documentColumns = [
    {
      title: 'Tên tài liệu',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'day',
      key: 'day',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Số lượng file',
      dataIndex: 'files',
      key: 'fileCount',
      render: (files: any[]) => files.length
    },
    {
      title: 'Chi tiết',
      key: 'action',
      render: (text: any, record: any) => (
        <Space>
          {record.files.map((file: any, index: number) => (
            <Typography.Link key={index}>
              <FileOutlined /> {file.originalName}
            </Typography.Link>
          ))}
        </Space>
      )
    }
  ];

  return (
    <Modal
      title="Chi tiết dự án"
      open={isOpen}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="cancel" icon={<CloseCircleOutlined />} onClick={onClose}>
          Hủy
        </Button>,
        <Button key="save" type="primary" icon={<SaveOutlined />}>
          Lưu
        </Button>
      ]}
    >
      {projectData && (
        <>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã dự án">{projectData.alias}</Descriptions.Item>
            <Descriptions.Item label="Tên dự án">{projectData.name}</Descriptions.Item>
            <Descriptions.Item label="PM">{projectData.pm.name}</Descriptions.Item>
            <Descriptions.Item label="Email PM">{projectData.pm.emailContact}</Descriptions.Item>
            <Descriptions.Item label="Khách hàng">{projectData.customer.name}</Descriptions.Item>
            <Descriptions.Item label="Email khách hàng">{projectData.customer.emailContact}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">{projectData.status}</Descriptions.Item>
            <Descriptions.Item label="Ngày dự kiến">{dayjs(projectData.day).format('DD/MM/YYYY')}</Descriptions.Item>
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