import { useState, useEffect } from 'react';
import { Button, Dropdown, Table, Tooltip , Tag} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { IProject } from './interfaces/project.interface';
import { getAllProject , getProjectByCustomerId} from './services/project.service';
import { EditOutlined, DeleteOutlined, EllipsisOutlined} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuthUser , selectUserProfile } from '../../common/stores/auth/authSelector';

const CustomerProject = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<IProject[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const user = useSelector(selectAuthUser);
  const profile = useSelector(selectUserProfile); 
  const fetchProjectData = async () => {
    if(user?.role === "guest" && profile?._id) {
      const response = await getProjectByCustomerId(profile?._id);
      setProjects(response.data || []);
      setTotal(response.pagination?.total || response.data?.length || 0);
    } else {
      const response = await getAllProject();
      setProjects(response.data || []);
      setTotal(response.pagination?.total || response.data?.length || 0);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [page, limit]);

  const handleViewDetail = (record: IProject) => {
    console.log("chi tiết : ", record);
    navigate(`/project/${record._id}`);
  }

  const handleViewLog = (record: IProject) => {
    console.log("Lịch sử ", record)
  }

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
        <Tag color="blue"><Tooltip title={record.pm?.name}>{record.pm?.name}</Tooltip></Tag>
      ),
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
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (text: string) => {
        let color = '';
        if (text === 'Đang thực hiện') {
          color = 'purple';
        } else if (text === 'Đã nghiệm thu') {
          color = 'green';
        }
        return <Tag color={color}><Tooltip title={text}>{text}</Tooltip></Tag>;
      },
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'day',
      key: 'day',
      align: 'center',
      render: (text: string) =>
        text ? dayjs(new Date(text).toLocaleDateString()).format('DD/MM/YYYY') : '',
    },
    {
      title: 'Chức năng',
      key: 'action',
      align: 'center',
      width: 110,
      render: (_: any, record: IProject) => {
        const items = [
          {
            key: 'detail',
            label: (
              <span>
                <EditOutlined style={{ color: '#faad14', marginRight: 6 }} />
                Chi tiết  dự án
              </span>
            ),
          },
          {
            key: 'log',
            label: (
              <span>
                <DeleteOutlined style={{ color: '#ff4d4f', marginRight: 6 }} />
                Xem lịch sử
              </span>
            ),
          },
        ];
        const handleMenuClick = ({ key }: { key: string }) => {
          if (key === 'detail') {
            handleViewDetail(record);
          } else if (key === 'log') {
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
      
    </div>
  );
};

export default CustomerProject;