import { useParams, useNavigate } from 'react-router-dom';
import type { IProject, IDocument } from './interfaces/project.interface';
import { useState, useEffect } from 'react';
import { getProjectDetail , addDocumentToProject, endingProject} from './services/project.service';
import { Card, Descriptions, Tag, Typography, Table, Space, Button, Tooltip, message, Modal } from 'antd';
import { DownloadOutlined, MailOutlined, PhoneOutlined, ArrowLeftOutlined, PlusOutlined, FileExcelOutlined, FilePdfOutlined, FileWordOutlined, DeleteOutlined, EditOutlined, ExclamationCircleOutlined, CommentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { downloadFile , deleteDocument , updateTrashDocument} from './services/document.service';
import ModalAddDocument from './components/ModalAddDocument';
import PhaseProject from './components/PhaseProject';
import ReportTable from './components/ReportTable';
import ModalEditDocument from './components/ModalEditDocument';
import type { ColumnsType } from 'antd/es/table';
// import { title } from 'process';

const { Title, Link } = Typography;

const ProjectDetail = () => {
  const { pid } = useParams();
  const [project, setProject] = useState<IProject>();
  const [loading, setLoading] = useState(false);
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const navigate = useNavigate();
  const [selectedDocument, setSelectedDocument] = useState<IDocument | null>(null);
  const [openModalEdit, setOpenModalEdit] = useState(false);

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

  const handleAddDocument = async (document: IDocument) => {
    try {
      const response = await addDocumentToProject(pid || '', document._id || '');
      await updateTrashDocument(document._id|| '');
      await fetchProjectDetail();
      message.success(response.message || 'Document added successfully');
    } catch (error: any) {
      console.error('Error adding document:', error);
      message.error(error.response?.data?.message || 'Failed to add document to project');
    }
  };

  const handleEditDocument = (record: IDocument) => {
    setSelectedDocument(record);
    setOpenModalEdit(true);
  };

   const handleEndingProject = async (projectId : string) => {
     try {
          const res = await endingProject(projectId);
          if (res.success) {
            message.success('Duyệt dự án thành công');
            await fetchProjectDetail();
          } else {
            message.error(res.message || 'Có lỗi xảy ra khi duyệt dự án');
          }
        } catch (error: any) {
          console.error('Lỗi khi duyệt dự án:', error);
          message.error(error.message || 'Có lỗi xảy ra khi duyệt dự án');
        }
  }

  const showEndingPhaseConfirm = (projectId : string) => {
    Modal.confirm({
      title : 'Xác nhận kết thúc dự án',
      icon : <ExclamationCircleOutlined />,
      content : "Bạn có chăc chắn muốn kết thúc dự án này, hành động không thể hoàn thác!",
      okText : 'Xác nhận',
      cancelText : 'Hủy',
      onOk() {
        handleEndingProject(projectId);
      }
    })
  }
  const handleDeleteDocument = (record : any) => {
    Modal.confirm({
      title : `Xác nhận xóa tài liệu ${record.name}`,
      content : `Bạn có muốn xóa tài liệu này không ?`,
      okText: 'Xóa',
      okType : 'danger',
      cancelText: 'Hủy',
      onOk : async () => {
        try {
          const response = await deleteDocument(record._id);
          await fetchProjectDetail();
          message.success(response.message);
        } catch (error : any) {
          message.error(error.message);
        }
      }

    })
    console.log("Xóa document : " , record)
  }

  const documentColumns : ColumnsType<any>= [
    {
      title: 'Tên tài liệu',
      dataIndex: 'name',
      key: 'name',
      align : 'center',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'day',
      key: 'day',
      align : "center",
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Người gửi',
      dataIndex: 'sender',
      key: 'sender',
      align : "center",
      render: (sender: any) => {
        let color = 'default';
        if(sender.role === 'pm' || sender.role === 'admin') {
          color = "blue";
        }
        else{
          color = "green";
        }
        return <Tag color= {color}>{sender.email}</Tag>
      },
    },
    {
      title: 'Tệp đính kèm',
      dataIndex: 'files',
      key: 'files',
      // width : 300,
     render: (_: any, record: any) => (
        <Space direction="vertical" style={{ width: '100%' }}>
          {record.files.map((file: any, index: number) => (
            <Tooltip title="Nhấn để tải xuống" key={index}>
              <Typography.Link onClick={() => handleDownloadFile(file.path)}>
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
    },
    {
      title : "Chức năng",
      key: "action",
      align : "center",
      width : 300,
      render :(_:any , record : any) =>(
       <Space>
        <Button type='primary' onClick={()=>{handleEditDocument(record)}} icon = {<EditOutlined/>} >Sửa</Button>
        <Button type='default' danger onClick={()=> {handleDeleteDocument(record)}} icon={<DeleteOutlined/>}>Xóa</Button>
       </Space>
      )
    }
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
            <Title level={3}>Thông tin dự án  {project?.name}</Title>
            <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/customers-projects')}>
              Quay lại
            </Button>
            
          </Space>
          <Button type="primary" icon={<CommentOutlined />} onClick={() => navigate(`/request-response/${pid}`)}>
              Xem yêu cầu và phản hồi
            </Button>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã dự án">{project?.alias}</Descriptions.Item>
            <Descriptions.Item label="Tên dự án">{project?.name}</Descriptions.Item>
            
            <Descriptions.Item label="Quản lý dự án">
              <div>
                <Tag color='blue'> <div>{project?.pm?.name}</div></Tag>
                <ContactInfo 
                  email={project?.pm?.emailContact} 
                  phone={project?.pm?.phoneContact}
                />
              </div>
            </Descriptions.Item>
            
            <Descriptions.Item label="Khách hàng">
              <div>
                <Tag color='green'> <div>{project?.customer?.name}</div></Tag>
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
                onClick={() => setOpenModalAdd(true)}
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
            <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
                 <Title level={3}>Tiến dộ dự án {project?.name}</Title>
            </Space>
            <PhaseProject 
              projectId={pid || ''}
              projectStatus= {project?.status || ''}
              onEndingProject={showEndingPhaseConfirm} 
            />
          </div>
          <div>
            <Title level={3}>Danh sách báo cáo dự án {project?.name}</Title>
            <ReportTable />
          </div>
        </Space>
      </Card>

      <ModalAddDocument
        open={openModalAdd}
        onClose={() => setOpenModalAdd(false)}
        onUpload={handleAddDocument}
      />

      <ModalEditDocument
        open={openModalEdit}
        onClose={() => setOpenModalEdit(false)}
        document={selectedDocument}
        onSuccess={fetchProjectDetail}
      />
    </div>
  );
};

export default ProjectDetail;
