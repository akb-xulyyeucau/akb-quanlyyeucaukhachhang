import { useParams, useNavigate } from 'react-router-dom';
import type { IProject, IDocument } from './interfaces/project.interface';
import { useState, useEffect } from 'react';
import { getProjectDetail } from './services/project.service';
import { Card, Descriptions, Tag, Typography, Table, Space, Button, Tooltip, message } from 'antd';
import { DownloadOutlined, FileOutlined, MailOutlined, PhoneOutlined, ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { downloadFile } from './services/document.service';
import ModalUploadDocument from './components/ModalUploadDocument';

const { Title, Link } = Typography;

const ProjectDetail = () => {
  const { pid } = useParams();
  const [project, setProject] = useState<IProject>();
  const [loading, setLoading] = useState(false);
  const [openModalUpload, setOpenModalUpload] = useState(false);
  const navigate = useNavigate();

  const fetchProjectDetail = async () => {
    setLoading(true);
    try {
      const res = await getProjectDetail(pid || '');
      setProject(res.data);
    } catch (error) {
      console.error("Error fetching project details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetail();
  }, [pid]);

  const handleDownloadFile = async (path: string) => {
    try {
      const response = await downloadFile(path);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', path.split('/').pop() || 'download');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      message.error('Failed to download file');
    }
  };

  const handleAddDocument = (document: IDocument) => {
    if (project) {
      setProject({
        ...project,
        documentIds: [...(project.documentIds || []), document]
      });
    }
  };

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
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Người gửi',
      dataIndex: 'sender',
      key: 'sender',
      render: (sender: any) => sender.email,
    },
    {
      title: 'Tệp đính kèm',
      dataIndex: 'files',
      key: 'files',
      render: (files: any[]) => (
        <Space>
          {files.map((file, index) => (
            <Tooltip title={file.originalName} key={index}>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadFile(file.path)}
                type="link"
              >
                {file.originalName}
              </Button>
            </Tooltip>
          ))}
        </Space>
      ),
    },
  ];

  const ContactInfo = ({ email, phone }: { email?: string; phone?: string }) => (
    <Space direction="vertical" size="small">
      {email && (
        <Link href={`mailto:${email}`}>
          <Space>
            <MailOutlined />
            {email}
          </Space>
        </Link>
      )}
      {phone && (
        <Link href={`tel:${phone}`}>
          <Space>
            <PhoneOutlined />
            {phone}
          </Space>
        </Link>
      )}
    </Space>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Card loading={loading}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
            <Title level={2}>Thông tin dự án  {project?.name}</Title>
            <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/customers-projects')}>
              Quay lại
            </Button>
          </Space>
          
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã dự án">{project?.alias}</Descriptions.Item>
            <Descriptions.Item label="Tên dự án">{project?.name}</Descriptions.Item>
            
            <Descriptions.Item label="Quản lý dự án">
              <div>
                <div>{project?.pm?.name}</div>
                <ContactInfo 
                  email={project?.pm?.emailContact} 
                  phone={project?.pm?.phoneContact}
                />
              </div>
            </Descriptions.Item>
            
            <Descriptions.Item label="Khách hàng">
              <div>
                <div>{project?.customer?.name}</div>
                <ContactInfo 
                  email={project?.customer?.emailContact} 
                  phone={project?.customer?.phoneContact}
                />
              </div>
            </Descriptions.Item>
            
            <Descriptions.Item label="Trạng thái">
              <Tag color={project?.status === 'Đang thực hiện' ? 'purple' : 'green'}>
                {project?.status}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="Ngày bắt đầu ">
              {project?.day ? dayjs(project.day).format('DD/MM/YYYY') : 'N/A'}
            </Descriptions.Item>
          </Descriptions>

          <div>
            <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
              <Title level={3}>Tài liệu dự án {project?.name}</Title>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => setOpenModalUpload(true)}
              >
                Thêm tài liệu
              </Button>
            </Space>
            <Table
              dataSource={project?.documentIds || []}
              columns={documentColumns}
              rowKey="_id"
              pagination={false}
            />
          </div>
          <div>
            <Title level={3}>Tiến dộ dự án {project?.name}</Title>
            
          </div>
          <div>
            <Title level={3}>Danh sách báo cáo dự án {project?.name}</Title>
          </div>
        </Space>
      </Card>

      <ModalUploadDocument
        open={openModalUpload}
        onClose={() => setOpenModalUpload(false)}
        onUpload={handleAddDocument}
      />
    </div>
  );
};

export default ProjectDetail;
