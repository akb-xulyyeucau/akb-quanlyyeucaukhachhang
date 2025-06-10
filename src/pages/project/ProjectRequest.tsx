import { useState, useEffect } from 'react';
import { Button, Dropdown, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { IProject } from './interfaces/project.interface';
import { getProjectRequest, createProject } from './services/project.service';
import {uploadDocuments} from './services/document.service'
import { EditOutlined, DeleteOutlined, EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import DrawerProjectForm from './components/DrawerProjectForm';
import { useSelector } from 'react-redux';
import type { RootState } from '../../common/stores/store'; // Điều chỉnh path theo cấu trúc store của bạn
 // Điều chỉnh path theo cấu trúc store của bạn

const CustomerProject = () => {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [openDrawer, setOpenDrawer] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  const fetchProjectData = async () => {
    const response = await getProjectRequest();
    setProjects(response.data || []);
    setTotal(response.pagination?.total || response.data?.length || 0);
  };

  useEffect(() => {
    fetchProjectData();
  }, [page, limit]);

  const handleViewDetail = (record: IProject) => {
    console.log("Chi tiết:", record);
  };

  const handleViewLog = (record: IProject) => {
    console.log("Lịch sử:", record);
  };

  const handleCreateProject = () => {
    setOpenDrawer(true);
  };

  const handleSaveProject = async (values: any) => {
    const { documents, ...projectData } = values;
    const newProject = await createProject(projectData);
    if (documents && documents.length > 0) {
      await uploadDocuments(documents); // Gọi hàm upload với documents
    }
    console.log("userInfor -------------- " , user?.id )
    fetchProjectData();
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
      title: 'Quản lý dự án',
      dataIndex: ['pm', 'name'],
      key: 'pm.name',
      align: 'center',
      render: (_: any, record: IProject) => (
        <Tooltip title={record.pm?.name}>{record.pm?.name}</Tooltip>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: ['customer', 'name'],
      key: 'customer.name',
      align: 'center',
      render: (_: any, record: IProject) => (
        <Tooltip title={record.customer?.name}>{record.customer?.name}</Tooltip>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (text: string) => <Tooltip title={text}>{text}</Tooltip>,
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'day',
      key: 'day',
      align: 'center',
      render: (text: string) =>
        text ? dayjs(new Date(text).toLocaleDateString('vi-VN')).format('DD/MM/YYYY') : '',
    },
    {
      title: 'Chức năng',
      key: 'action',
      align: 'center',
      width: 110,
      render: (_: any, record: IProject) => {
        const items = [
          {
            key: 'aprove',
            label: (
              <span>
                <EditOutlined style={{ color: '#faad14', marginRight: 6 }} />
                Duyệt
              </span>
            ),
          },
          {
            key: 'deny',
            label: (
              <span>
                <DeleteOutlined style={{ color: '#ff4d4f', marginRight: 6 }} />
                Hủy
              </span>
            ),
          },
        ];
        const handleMenuClick = ({ key }: { key: string }) => {
          if (key === 'aprove') {
            handleViewDetail(record);
          } else if (key === 'deny') {
            handleViewLog(record);
          }
        };
        return (
          <Dropdown
            menu={{ items, onClick: handleMenuClick }}
            trigger={['click']}
            placement="bottomLeft"
          >
            <Button icon={<EllipsisOutlined />} />
          </Dropdown>
        );
      },
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
        onClose={() => setOpenDrawer(false)}
        onSave={handleSaveProject}
      />
    </div>
  );
};

export default CustomerProject;