import { useState, useEffect } from 'react';
import { Button, Table, Tag, Tooltip, message, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { IProject } from './interfaces/project.interface';
import { getProjectRequest, createProject, deleteProject , approveProject } from './services/project.service';
import { updateTrashDocument } from './services/document.service';
import { EditOutlined, DeleteOutlined, PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import DrawerProjectForm from './components/DrawerProjectForm';
import ModalApproveProject from './components/ModalApproveProject';
import { useSelector } from 'react-redux';
import type { RootState } from '../../common/stores/store';

const TEMP_DOCUMENT_IDS_KEY = 'temp_document_ids';

const clearTempDocumentIds = () => {
  localStorage.removeItem(TEMP_DOCUMENT_IDS_KEY);
};

const getTempDocumentIds = (): string[] => {
  const ids = localStorage.getItem(TEMP_DOCUMENT_IDS_KEY);
  return ids ? JSON.parse(ids) : [];
};

const CustomerProject = () => {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const user = useSelector((state: RootState) => state.auth.user);

  const fetchProjectData = async () => {
    setTableLoading(true);
    try {
      const response = await getProjectRequest();
      setProjects(response.data || []);
      setTotal(response.pagination?.total || response.data?.length || 0);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách dự án:', error);
      message.error('Có lỗi xảy ra khi lấy danh sách dự án');
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

        message.success('Tạo dự án thành công');
        clearTempDocumentIds();
        fetchProjectData();
        setOpenDrawer(false);
      } else {
        message.error(response.message || 'Có lỗi xảy ra khi tạo dự án');
      }
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi tạo dự án');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await deleteProject(projectId);
      if (response.success) {
        message.success('Xóa dự án thành công');
        fetchProjectData();
      } else {
        message.error(response.message || 'Có lỗi xảy ra khi xóa dự án');
      }
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi xóa dự án');
    }
  };

  const handleApproveProject = async (projectId: string) => {
    try {
      const res = await approveProject(projectId);
      if (res.success) {
        message.success('Duyệt dự án thành công');
      } else {
        message.error(res.message || 'Có lỗi xảy ra khi duyệt dự án');
      }
      await fetchProjectData();
    } catch (error: any) {
      console.error('Lỗi khi duyệt dự án:', error);
      message.error(error.message || 'Có lỗi xảy ra khi duyệt dự án');
    }
  };

  const showDeleteConfirm = (record: IProject) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa yêu cầu dự án "${record.name}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        handleDeleteProject(record._id);
      },
    });
  };

  const columns: ColumnsType<IProject> = [
    {
      title: "STT",
      dataIndex: 'stt',
      key: 'stt',
      render: (_: any, __: IProject, index: number) => (page - 1) * limit + index + 1,
      align: 'center',
      width: 60,
    },
    {
      title: "Mã dự án",
      dataIndex: 'alias',
      key: 'alias',
      align: 'center',
      render: (text: string) => <Tooltip title={text}>{text}</Tooltip>,
    },
    {
      title: "Tên dự án",
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (text: string) => <Tooltip title={text}>{text}</Tooltip>,
    },
    {
      title: "Khách hàng",
      dataIndex: ['customer', 'name'],
      key: 'customer.name',
      align: 'center',
      render: (_: any, record: IProject) => (
        <Tag color="green"><Tooltip title={record.customer?.name}>{record.customer?.name}</Tooltip></Tag>
      ),
    },
    {
      title: "Quản lý dự án",
      dataIndex: ['pm', 'name'],
      key: 'pm.name',
      align: 'center',
      render: (_: any, record: IProject) => (
        <Tag color="blue"><Tooltip title={record.pm?.name}>{record.pm?.name}</Tooltip></Tag>
      ),
    },
    {
      title: 'Trạng thái',
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
        return <Tag color= {color}> <Tooltip title={record.status}>{record.status}</Tooltip></Tag>
      },
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'day',
      key: 'day',
      align: 'center',
      render: (text: string) =>
        text ? dayjs(text).format('DD/MM/YYYY') : '',
    },
    {
      title: 'Chức năng',
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
              Duyệt
            </Button>
          )}
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record)}
            size="small"
          >
            Xóa
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
        Tạo yêu cầu dự án
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