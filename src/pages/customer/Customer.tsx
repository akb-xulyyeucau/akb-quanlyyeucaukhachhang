import { useEffect, useState } from 'react';
import { Table, Input, Button, Select, Space, message, Modal, Tooltip  , Tag} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ICustomer } from './interface/customer.interface';
import { getCustomerPanition , updateCustomerById , deleteCustomerById , updateUserActive} from './services/customer.service';
import { useDebounce } from '../../common/hooks/useDebounce';
import { DeleteOutlined , EyeOutlined } from '@ant-design/icons';
import ModalProfileForm from '../user/components/ModalProfileForm';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

const Customer = () => {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'alias' | 'name'>('alias');
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<ICustomer | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await getCustomerPanition({
        page,
        limit,
        search: debouncedSearch,
        sort,
        sortBy,
      });
      setCustomers(res.data?.customers || []);
      setTotal(res.data?.pagination?.total || 0);
    } catch (error) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, limit, debouncedSearch, sort, sortBy]);
   
  const handleEdit = (record: ICustomer) => {
    setEditingCustomer(record);
    console.log(record)
    setOpenProfileModal(true);
  };
  const handleSaveProfile = async (values: any) => {
    setProfileLoading(true);
    try {
      if (editingCustomer?._id) {
        await updateCustomerById(editingCustomer._id, values);
      } else {
        throw new Error('Không tìm thấy ID khách hàng để cập nhật.');
      }
      message.success('Cập nhật khách hàng thành công!');
      setOpenProfileModal(false);
      setEditingCustomer(null);
      fetchCustomers();
    } catch (err: any) {
      message.error('Cập nhật thất bại!');
    } finally {
      setProfileLoading(false);
    }
  };

const handleDelete = (record: ICustomer) => {
    Modal.confirm({
      title: 'Xác nhận xóa khách hàng?',
      content: 'Bạn có chắc chắn muốn xóa khách hàng này không?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteCustomerById(record._id);
          await updateUserActive(record.userId, false);
          message.success('Đã xóa khách hàng!');
          fetchCustomers();
        } catch (err: any) {
          message.error('Xóa thất bại!');
        }
      },
    });
  };
  const columns: ColumnsType<ICustomer> = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      render: (_: any, __: any, idx: number) => (page - 1) * limit + idx + 1,
      align: 'center',
      width: 60,
    },
    {
      title: 'Mã',
      dataIndex: 'alias',
      key: 'alias',
      align: 'center',
      width: 100,
      render: (text: string) => <Tooltip title={text}>{text}</Tooltip>,

    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      width: 180,
      render: (text: string) => <Tag color="green"><Tooltip title={text}>{text}</Tooltip></Tag>,

    },
    {
      title: 'Email liên hệ',
      dataIndex: 'emailContact',
      key: 'emailContact',
      align: 'center',
      render: (text: string) => <Tooltip title={text}>{text}</Tooltip>,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneContact',
      key: 'phoneContact',
      align: 'center',
      render: (text: string) => <Tooltip title={text}>{text}</Tooltip>,
    },
    {
      title: 'Công ty',
      dataIndex: 'companyName',
      key: 'companyName',
      align: 'center',
      render: (text: string) => <Tooltip title={text}>{text}</Tooltip>,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      align: 'center',
      render: (text: string) => <Tooltip title={text}>{text}</Tooltip>,
    },
    {
      title: 'Chức năng',
      key: 'action',
      align: 'center',
      width: 200,
      render: (_: any, record: ICustomer) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Chi tiết
          </Button>
          <Button
            type="default"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            size="small"
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm theo tên"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
          allowClear
          style={{ width: 200 }}
        />
        <Select value={sortBy} onChange={v => setSortBy(v)} style={{ width: 150 }}>
          <Option value="alias">Sắp xếp theo mã</Option>
          <Option value="name">Sắp xếp theo tên</Option>
        </Select>
        <Select value={sort} onChange={v => setSort(v)} style={{ width: 150 }}>
          <Option value="asc">Tăng dần</Option>
          <Option value="desc">Giảm dần</Option>
        </Select>
      </Space>
      <Table
        rowKey="alias"
        columns={columns}
        dataSource={customers}
        loading={loading}
        pagination={{
          current: page,
          pageSize: limit,
          total: total,
          showSizeChanger: true,
          pageSizeOptions: ['2','10', '20', '50', '100'],
          onChange: (p, l) => {
            setPage(p);
            setLimit(l || 10);
          },
        }}
        scroll={{ x: true }}
      />
        <ModalProfileForm
        open={openProfileModal}
        onCancel={() => {
          setOpenProfileModal(false);
          setEditingCustomer(null);
        }}
        onOk={handleSaveProfile}
        userRole="guest"
        profile={editingCustomer}
        loading={profileLoading}
        mode="edit"
      />
    </div>
  );
};

export default Customer;