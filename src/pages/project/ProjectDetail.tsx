import { useParams, useNavigate } from 'react-router-dom';
import type { IProject, IDocument } from './interfaces/project.interface';
import { useState, useEffect } from 'react';
import { getProjectDetail, addDocumentToProject, endingProject } from './services/project.service';
import { Card, Descriptions, Tag, Typography, Table, Space, Button, message, Modal, Input, Select } from 'antd';
import { MailOutlined, PhoneOutlined, ArrowLeftOutlined, PlusOutlined, DeleteOutlined, EditOutlined, ExclamationCircleOutlined, CommentOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { deleteDocument, updateTrashDocument } from './services/document.service';
import ModalAddDocument from './components/ModalAddDocument';
import PhaseProject from './components/PhaseProject';
import ReportTable from './components/ReportTable';
import ModalEditDocument from './components/ModalEditDocument';
import type { ColumnsType } from 'antd/es/table';
import FileText from '../../common/components/FileText';
import { useDebounce } from '../../common/hooks/useDebounce';
import { selectUserProfile, selectAuthUser } from '../../common/stores/auth/authSelector';
import { useSelector } from 'react-redux';
import AccessLimit from '../../common/components/AccessLimit';
import { useTranslation } from 'react-i18next';
import { sendEmail } from './services/mail.service';
import PopupMailConfirm from '../../common/components/PopupMailConfirm';

const { Title, Link } = Typography;

const ProjectDetail = () => {
  const { t } = useTranslation('projectDetail');
  const { pid } = useParams();
  const [project, setProject] = useState<IProject>();
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const navigate = useNavigate();
  const [selectedDocument, setSelectedDocument] = useState<IDocument | null>(null);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [senderFilter, setSenderFilter] = useState<string>('all');
  const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);
  const [error, setError] = useState(false);
  const [showMailConfirm , setShowMailConfirm ] = useState(false);
  const user = useSelector(selectAuthUser);
  const profile = useSelector(selectUserProfile);

  const debouncedSearchText = useDebounce(searchText, 1000);

  const fetchProjectDetail = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getProjectDetail(pid || '');
      setProject(res.data);
    } catch (error) {
      setError(true); // Nếu lỗi API, set error true
      setProject(undefined);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetail();
  }, [pid]);

  useEffect(() => {
    const filterDocuments = async () => {
      setTableLoading(true);
      // Thêm một slight delay để hiển thị loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      try {
        if (!project?.documentIds) {
          setFilteredDocuments([]);
          return;
        }
        let result = [...project.documentIds];
        // Filter by document name
        if (debouncedSearchText) {
          result = result.filter(doc =>
            doc.name.toLowerCase().includes(debouncedSearchText.toLowerCase())
          );
        }
        // Filter by sender role
        if (senderFilter !== 'all') {
          result = result.filter(doc => {
            if (senderFilter === 'guest') {
              return doc.sender.role === 'guest';
            } else if (senderFilter === 'pm') {
              return ['pm', 'admin'].includes(doc.sender.role);
            }
            return true;
          });
        }
        setFilteredDocuments(result);
      } finally {
        setTableLoading(false);
      }
    };
    filterDocuments();
  }, [project?.documentIds, debouncedSearchText, senderFilter]);

  const handleAddDocument = async (document: IDocument) => {
    try {
      setShowMailConfirm(true);
      const response = await addDocumentToProject(pid || '', document._id || '');
      if (response.success) {
        await updateTrashDocument(document._id || '');
        await fetchProjectDetail();
        message.success(t('projectDocument.message.addSuccess'));
        setOpenModalAdd(false);
        if(user?.role === "admin" || user?.role === "pm"){
          await sendEmail({
            to : project?.customer?.emailContact,
            subject : `Dự án ${project?.name} đã thêm một tài liệu mới bởi ${profile?.name || user?.email}`,
            templateName : "addDocInProject.template",
            data : {
              username : project?.customer?.name,
              projectName : project?.name,
              senderName : profile?.name || user?.email,
              link : `${import.meta.env.VITE_HOST}/project/${pid}`
            }
          })
        }
        else{
          await sendEmail({
            to : project?.pm?.emailContact,
            subject : `Dự án ${project?.name} đã thêm một tài liệu mới bởi ${profile?.name || user?.email}`,
            templateName : "addDocInProject.template",
            data : {
              username : project?.customer?.name,
              projectName : project?.name,
              senderName : profile?.name || user?.email,
              link : `${import.meta.env.VITE_HOST}/project/${pid}`
            }
          })
        }
      } else {
        message.error(response.message || t('projectDocument.message.addFail'));
      }
    } catch (error: any) {
      console.error('Error adding document:', error);
      message.error(error.response?.data?.message || t('projectDocument.message.addFail'));
    }
  };

  const handleEditDocument = (record: IDocument) => {
    setSelectedDocument(record);
    setOpenModalEdit(true);
  };

  const handleEndingProject = async (projectId: string) => {
    try {
      const res = await endingProject(projectId);
      if (res.success) {
        message.success(t('projectPhase.endSuccess'));
        await fetchProjectDetail();
      } else {
        message.error(res.message || t('projectPhase.endFail'));
      }
    } catch (error: any) {
      console.error('Lỗi khi duyệt dự án:', error);
      message.error(error.message || t('projectPhase.endFail'));
    }
  }

  const showEndingPhaseConfirm = (projectId: string) => {
    Modal.confirm({
      title: t('projectPhase.endConfirmTitle'),
      icon: <ExclamationCircleOutlined />,
      content: t('projectPhase.endConfirmContent'),
      okText: t('projectPhase.confirm'),
      cancelText: t('projectPhase.cancel'),
      onOk() {
        handleEndingProject(projectId);
      }
    })
  }
  const handleDeleteDocument = (record: any) => {
    Modal.confirm({
      title: t('projectDocument.table.deleteConfirmTitle', { name: record.name }),
      content: t('projectDocument.table.deleteConfirmContent'),
      okText: t('projectDocument.table.delete'),
      okType: 'danger',
      cancelText: t('projectPhase.cancel'),
      onOk: async () => {
        try {
          const response = await deleteDocument(record._id);
          await fetchProjectDetail();
          message.success(response.message);
        } catch (error: any) {
          message.error(error.message);
        }
      }
    })
  }

  const documentColumns: ColumnsType<any> = [
    {
      title: t('projectDocument.table.no'),
      key: 'stt',
      align: 'center',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: t('projectDocument.table.name'),
      // dataIndex: 'name',
      key: 'name',
      // align : 'center',
      render: (_: any, record: any) => {
        let color = "blue";
        if (record.sender.role === 'guest') {
          color = 'green';
        } else if (record.sender.role === 'pm' || record.sender.role === 'admin') {
          color = 'blue';
        }
        return (
          <Tag color={color} >
            {record.name}
          </Tag>
        );
      }
    },
    {
      title: t('projectDocument.table.createdAt'),
      dataIndex: 'day',
      key: 'day',
      align: "center",
      render: (date: string) => <Tag color='purple'> {dayjs(date).format('DD/MM/YYYY')}</Tag>,
    },
    {
      title: t('projectDocument.table.sender'),
      dataIndex: 'sender',
      key: 'sender',
      align: "center",
      render: (sender: any) => {
        let color = 'default';
        if (sender.role === 'pm' || sender.role === 'admin') {
          color = "blue";
        }
        else {
          color = "green";
        }
        return <Tag color={color}>{sender.email}</Tag>
      },
    },
    {
      title: t('projectDocument.table.attachments'),
      dataIndex: 'files',
      key: 'files',
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
    },
    {
      title: t('projectDocument.table.actions'),
      key: "action",
      align: "center",
      width: 300,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type='primary'
            onClick={() => { handleEditDocument(record) }}
            icon={<EditOutlined />}
          >
            {t('projectDocument.table.edit')}
          </Button>
          <Button
            type='default'
            danger
            onClick={() => { handleDeleteDocument(record) }}
            icon={<DeleteOutlined />}
          >
            {t('projectDocument.table.delete')}
          </Button>
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

  // Kiểm tra quyền truy cập sau khi đã load xong dữ liệu
  const checkAccess = () => {
    if (error) return false; // Nếu lỗi API, không cho truy cập
    if (project) {
      return !(user?.role === "guest" && profile?._id !== project?.customer?._id);
    }
    if (!project) return false
    return true; // Cho phép truy cập trong khi đang loading
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card loading={loading}>
        {!checkAccess() ? (
          <AccessLimit />
        ) : (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space style={{ justifyContent: 'space-between', width: '100%' }}>
              <Title level={3}> {t('projectInfor.title')} {project?.name}</Title>
              <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/customers-projects')}>
                {t('backToProjectList')}
              </Button>
            </Space>
            <Button type="primary" icon={<CommentOutlined />} onClick={() => navigate(`/request-response/${pid}`)}>
              {t('projectOverview')}
            </Button>
            <Descriptions bordered column={2}>
              <Descriptions.Item label={t('projectInfor.alias')}>
                <Tag>{project?.alias}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('projectInfor.name')}>
                {project?.name}
              </Descriptions.Item>

              <Descriptions.Item label={t('projectInfor.PM')} span={1}>
                <Tag color='blue'>{project?.pm?.name}</Tag>
                <br />
                <ContactInfo
                  email={project?.pm?.emailContact}
                  phone={project?.pm?.phoneContact}
                />
              </Descriptions.Item>
              <Descriptions.Item label={t('projectInfor.customer')} span={1}>
                <Tag color='green'>{project?.customer?.name}</Tag>
                <br />
                <ContactInfo
                  email={project?.customer?.emailContact}
                  phone={project?.customer?.phoneContact}
                />
              </Descriptions.Item>

              <Descriptions.Item label={t('projectInfor.status')}>
                <Tag color={project?.status === t('projectDetail.inProgress') ? 'purple' : 'green'}>
                  {project?.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('projectInfor.startDate')}>
                {project?.day ? dayjs(project.day).format('DD/MM/YYYY') : 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
                <Title level={3}> {t('projectDocument.title')} {project?.name}</Title>
              </Space>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <Input
                    placeholder={t('projectDocument.searchPlaceholder')}
                    prefix={<SearchOutlined />}
                    style={{ width: 300 }}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                  />
                  <Select
                    style={{ width: 200 }}
                    value={senderFilter}
                    onChange={(value) => setSenderFilter(value)}
                    options={[
                      { value: 'all', label: t('projectDocument.filterAll') },
                      { value: 'guest', label: t('projectInfor.customer') },
                      { value: 'pm', label: t('projectInfor.PM') }
                    ]}
                  />
                </div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setOpenModalAdd(true)}
                >
                  {t('projectDocument.addDocument')}
                </Button>
              </div>
              <Table
                dataSource={filteredDocuments}
                columns={documentColumns}
                rowKey="_id"
                pagination={false}
                loading={tableLoading}
              />
            </div>
            <div>
              <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
                <Title level={3}> {t('projectPhase.title')} {project?.name}</Title>
              </Space>
              <PhaseProject
                projectId={pid || ''}
                project={project}
                projectStatus={project?.status || ''}
                onEndingProject={showEndingPhaseConfirm}
              />
            </div>
            <div>
              <Title level={3}> {t('projectReport.title')} {project?.name}</Title>
              <ReportTable
                projectId={pid || ''}
                project={project}
              />
            </div>
          </Space >
        )}
      </Card >

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
      <PopupMailConfirm
        isVisible={showMailConfirm}
        onCancel={() => setShowMailConfirm(false)}
        onConfirm={() => {
          setShowMailConfirm(false);
          setOpenModalAdd(true); // Sau khi xác nhận mới mở modal upload
        }}
        emailRecipient={user?.role === 'admin' || user?.role === 'pm' ? project?.customer?.emailContact : project?.pm?.emailContact}
        mailContentPreview={`Bạn sẽ gửi thông báo khi thêm tài liệu mới cho dự án "${project?.name}".`}
        isLoading={false}
      />
    </div >
  );
};

export default ProjectDetail;

