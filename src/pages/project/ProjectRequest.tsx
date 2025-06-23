import { useState, useEffect } from 'react';
import { Button, Table, Tag, Tooltip, message, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { IProject } from './interfaces/project.interface';
import { getProjectRequest, createProject, deleteProject , approveProject , getProjectByCustomerRequest } from './services/project.service';
import { updateTrashDocument } from './services/document.service';
import { EditOutlined, DeleteOutlined, PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import DrawerProjectForm from './components/DrawerProjectForm';
import ModalApproveProject from './components/ModalApproveProject';
import { useSelector } from 'react-redux';
import { selectUserProfile , selectAuthUser } from '../../common/stores/auth/authSelector';
import { useTranslation } from 'react-i18next';

const TEMP_DOCUMENT_IDS_KEY = 'temp_document_ids';

const clearTempDocumentIds = () => {
  localStorage.removeItem(TEMP_DOCUMENT_IDS_KEY);
};

const getTempDocumentIds = (): string[] => {
  const ids = localStorage.getItem(TEMP_DOCUMENT_IDS_KEY);
  return ids ? JSON.parse(ids) : [];
};

const CustomerProject = () => {
  const { t,  i18n } = useTranslation('projectRequest');
  const [projects, setProjects] = useState<IProject[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const user = useSelector(selectAuthUser);
  const profile = useSelector(selectUserProfile);

  const fetchProjectData = async () => {
    setTableLoading(true);
    try {
      if(user?.role === "guest" && profile?._id) {
        const response = await getProjectByCustomerRequest(profile?._id);
        setProjects(response.data || []);
        setTotal(response.pagination?.total || response.data?.length || 0);
      } else {
        const response = await getProjectRequest();
        setProjects(response.data || []);
        setTotal(response.pagination?.total || response.data?.length || 0);
      }
    } catch (error) {
      console.error('Có lỗi xảy ra khi lấy danh sách dự án:', error);
      message.error(t('pjRequest_page.table.getProjectError'));
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [page, limit]);

  const handleViewDetail = (record: IProject) => {
    setSelectedProject(record._id);
    setIsModalOpen(true);
  };

  const handleCreateProject = () => {
    setOpenDrawer(true);
  };

  const handleCloseDrawer = () => {
    clearTempDocumentIds();
    setOpenDrawer(false);
  };

  const handleSaveProject = async (values: any) => {
    try {
      const documentIds = getTempDocumentIds();
      const projectData = {
        ...values,
        documentIds
      };

      const response = await createProject(projectData);
      
      if (response.success) {
        if (documentIds.length > 0) {
          try {
            await Promise.all(documentIds.map(id => updateTrashDocument(id)));
          } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái document:', error);
          }
        }

        message.success(t('pjRequest_page.createProjectSuccess'));
        clearTempDocumentIds();
        fetchProjectData();
        setOpenDrawer(false);
      } else {
        message.error(response.message || t('pjRequest_page.createProjectError'));
      }
    } catch (error: any) {
      message.error(error.message || t('pjRequest_page.createProjectError'));
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await deleteProject(projectId);
      if (response.success) {
        message.success(t('pjRequest_page.table.deleteSuccess'));
        fetchProjectData();
      } else {
        message.error(response.message || t('pjRequest_page.table.deleteError'));
      }
    } catch (error: any) {
      message.error(error.message ||t('pjRequest_page.table.deleteError'));
    }
  };

  const handleApproveProject = async (projectId: string) => {
    try {
      const res = await approveProject(projectId);
      if (res.success) {
        message.success(t('pjRequest_page.table.approveSuccess'));
      } else {
        message.error(res.message ||t('pjRequest_page.table.approveError'));
      }
      await fetchProjectData();
    } catch (error: any) {
      console.error('Lỗi xảy ra khi duyệt dự án:', error);
      message.error(error.message || t('pjRequest_page.table.approveError'));
    }
  };

  const showDeleteConfirm = (record: IProject) => {
    Modal.confirm({
      title: t('pjRequest_page.table.deletetitle'),
      icon: <ExclamationCircleOutlined />,
      content: t('pjRequest_page.table.deleteconfirm', { name: record.name }),
      okText: t('pjRequest_page.table.deleteok'),
      okType: 'danger',
      cancelText: t('pjRequest_page.table.deletecancel'),
      onOk() {
        handleDeleteProject(record._id);
      },
    });
  };

  const columns: ColumnsType<IProject> = [
    {
      title: t('pjRequest_page.table.stt'),
      dataIndex: 'stt',
      key: 'stt',
      render: (_: any, __: IProject, index: number) => (page - 1) * limit + index + 1,
      align: 'center',
      width: 60,
    },
    {
      title: t('pjRequest_page.table.alias'),
      dataIndex: 'alias',
      key: 'alias',
      align: 'center',
      render: (text: string) => <Tooltip title={text}>{text}</Tooltip>,
    },
    {
      title: t('pjRequest_page.table.name'),
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (text: string) => <Tooltip title={text}>{text}</Tooltip>,
    },
    {
      title: t('pjRequest_page.table.customer'),
      dataIndex: ['customer', 'name'],
      key: 'customer.name',
      align: 'center',
      render: (_: any, record: IProject) => (
        <Tag color="green"><Tooltip title={record.customer?.name}>{record.customer?.name}</Tooltip></Tag>
      ),
    },
    {
      title: t('pjRequest_page.table.PM'),
      dataIndex: ['pm', 'name'],
      key: 'pm.name',
      align: 'center',
      render: (_: any, record: IProject) => (
        <Tag color="blue"><Tooltip title={record.pm?.name}>{record.pm?.name}</Tooltip></Tag>
      ),
    },
    {
      title:  t('pjRequest_page.table.status'),
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (_ : any , record : IProject) => {
        let color = "default";
        switch(record.isActive){
          case true : color = "green"; break;
          case false : color = "warning" ; break;
          default : color = "default" 
        }
        let statusText = "";
        if(i18n.language === 'vi') {
          statusText = "Chưa kích hoạt";
        }else{
          statusText = "未有効";
        }
        return <Tag color= {color}> <Tooltip title={statusText}>{statusText}</Tooltip></Tag>
      },
    },
    {
      title:t('pjRequest_page.table.startDate'),
      dataIndex: 'day',
      key: 'day',
      align: 'center',
      render: (text: string) =>
        text ? dayjs(text).format('DD/MM/YYYY') : '',
    },
    {
      title: t('pjRequest_page.table.action'),
      key: 'action',
      align: 'center',
      width: 160,
      render: (_: any, record: IProject) => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          {user?.role !== 'guest' && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleViewDetail(record)}
              size="small"
            >
              {t('pjRequest_page.table.approve')}
            </Button>
          )}
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record)}
            size="small"
          >
            {t('pjRequest_page.table.delete')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
        onClick={handleCreateProject}
      >
        {t('pjRequest_page.createProjectRequest')}
      </Button>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={projects}
        loading={tableLoading}
        pagination={{
          current: page,
          pageSize: limit,
          total: total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          onChange: (p, l) => {
            setPage(p);
            setLimit(l || 10);
          },
        }}
        scroll={{ x: true }}
      />
      <DrawerProjectForm
        open={openDrawer}
        onClose={handleCloseDrawer}
        onSave={handleSaveProject}
      />
      <ModalApproveProject
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApprove={handleApproveProject}
        projectId={selectedProject}
      />
    </div>
  );
};

export default CustomerProject;