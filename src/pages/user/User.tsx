import { useEffect, useState } from "react";
import { Table, Button, Space, message, Row, Col, Input, Select, Tooltip, Tag, Modal } from "antd";
import { UserAddOutlined, FilterOutlined, SearchOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import ModalAddUser from "./components/ModalAddUser";
import dayjs from "dayjs";
import { useDebounce } from "../../common/hooks/useDebounce";
import ModalUserDetail from "./components/ModalUserDetail";
import { deleteUser, createUser, getUsersPaging, deleteProfile } from "./services/user.service";
import { useTranslation } from 'react-i18next';
// import { useSelector } from 'react-redux';
// import { selectAuthUser } from '../../common/stores/auth/authSelector';

const { Option } = Select;

const User = () => {
  const { t, i18n } = useTranslation('user');
  // const user = useSelector(selectAuthUser);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [isActive, setIsActive] = useState<string>('');
  const debouncedSearch = useDebounce(search, 1000);
  const debouncedRole = useDebounce(role, 400);
  const debouncedSort = useDebounce(sort, 400);
  const debouncedIsActive = useDebounce(isActive, 400);
  const [viewUser, setViewUser] = useState<any>(null);
  const [openView, setOpenView] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, limit, debouncedSearch, debouncedRole, debouncedSort, debouncedIsActive]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log('Filter values:', {
        search: debouncedSearch,
        role: debouncedRole,
        sort: debouncedSort,
        isActive: debouncedIsActive
      });

      const res = await getUsersPaging({
        page,
        limit,
        search: debouncedSearch,
        role: debouncedRole,
        sort: debouncedSort,
        isActive: debouncedIsActive,
      });
      setUsers(res.data?.users || []);
      setTotal(res.data?.pagination?.total || 0);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplay = (role: string) => {
    if (i18n.language === 'vi') {
      switch (role) {
        case "admin": return "Quản trị viên";
        case "pm": return "Quản lý dự án";
        case "guest": return "Khách hàng";
        default: return role;
      }
    } else {
      switch (role) {
        case "admin": return "管理者";
        case "pm": return "プロジェクトマネージャー";
        case "guest": return "顧客";
        default: return role;
      }
    }
  };

  const getStatusDisplay = (isActive: boolean) => {
    if (i18n.language === 'vi') {
      return isActive ? "Đã kích hoạt" : "Chưa kích hoạt";
    } else {
      return isActive ? "有効" : "未有効";
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: t('user_page.table.stt'),
      dataIndex: "stt",
      key: "stt",
      render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
      width: 70,
      align: "center",
    },
    {
      title: t('user_page.table.alias'),
      dataIndex: "alias",
      key: "alias",
      align: "center",
      width: 150,
    },
    {
      title: t('user_page.table.email'),
      dataIndex: "email",
      key: "email",
      align: "center",
    },
    {
      title: t('user_page.table.role'),
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        let color = "default";
        switch (role) {
          case "admin": color = "red"; break;
          case "pm": color = "blue"; break;
          case "guest": color = "green"; break;
          default: color = "default";
        }
        return <Tag color={color}>{getRoleDisplay(role)}</Tag>;
      },
      align: "center",
    },
    {
      title: t('user_page.table.status'),
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "success" : "warning"}>
          {getStatusDisplay(isActive)}
        </Tag>
      ),
      align: "center",
    },
    {
      title: t('user_page.table.created_at'),
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (date: string) => date ? dayjs(date).format("DD/MM/YYYY") : "",
    },
    {
      title: t('user_page.table.updated_at'),
      dataIndex: "updatedAt",
      key: "updatedAt",
      align: "center",
      render: (date: string) => date ? dayjs(date).format("DD/MM/YYYY") : "",
    },
    {
      title: t('user_page.table.action'),
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Button type="default" icon={<EyeOutlined />} onClick={() => showView(record)}>
            {t('user_page.table.view_button')}
          </Button>
          <Button type="primary" icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record)}>
            {t('user_page.table.delete_button')}
          </Button>
        </Space>
      ),
      width: 180,
      align: "center",
    },
  ];

  const showDeleteConfirm = (record: any) => {
    Modal.confirm({
      title: t('user_page.delete_confirm_title'),
      content: t('user_page.delete_confirm_content') , //+ { alias: record.alias } ,
      okText: t('user_page.delete_ok_text'),
      okType: "danger",
      cancelText: t('user_page.delete_cancel_text'),
      centered: false,
      onOk: () => handleDelete(record),
    });
  };

  const handleDelete = async (record: any) => {
    setLoading(true);
    try {
      if (record.role === 'guest' || record.role === 'pm') {
        const profileRes = await deleteProfile(record.role, record._id);
        if (!profileRes?.success) {
          message.error(profileRes?.message);
          return;
        }
      }

      const userRes = await deleteUser(record._id);
      if (userRes.success) {
        message.success(userRes.message);
        fetchUsers();
      } else {
        message.error(userRes.message);
      }
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (values: any) => {
    setLoading(true);
    try {
      const res = await createUser(values);
      if (res.success) {
        message.success(res.message);
        fetchUsers();
      } else {
        message.error(res.message);
      }
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const showView = (record: any) => {
    setViewUser(record);
    setOpenView(true);
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setOpen(true)}
          >
            {t('user_page.add_user_button')}
          </Button>
        </Col>
        <Col>
          <Space>
            <Tooltip title={t('user_page.search_tooltip')}>
              <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder={t('user_page.search_placeholder')}
                style={{ width: 220 }}
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </Tooltip>
            <Tooltip title={t('user_page.filter_role_tooltip')}>
              <Select
                allowClear
                style={{ width: 140 }}
                placeholder={<span><FilterOutlined /> {t('user_page.filter_role_placeholder')}</span>}
                value={role || undefined}
                onChange={value => { setRole(value || ''); setPage(1); }}
              >
                <Option value="admin">{i18n.language === 'vi' ? "Quản trị viên" : "管理者"}</Option>
                <Option value="pm">{i18n.language === 'vi' ? "Quản lý dự án" : "プロジェクトマネージャー"}</Option>
                <Option value="guest">{i18n.language === 'vi' ? "Khách hàng" : "顧客"}</Option>
              </Select>
            </Tooltip>
            <Tooltip title={t('user_page.filter_status_tooltip')}>
              <Select
                allowClear
                style={{ width: 150 }}
                placeholder={<span><FilterOutlined /> {t('user_page.filter_status_placeholder')}</span>}
                value={isActive || undefined}
                onChange={value => { 
                  setIsActive(value); 
                  setPage(1); 
                }}
              >
                <Option value="true">{i18n.language === 'vi' ? "Đã kích hoạt" : "有効"}</Option>
                <Option value="false">{i18n.language === 'vi' ? "Chưa kích hoạt" : "未有効"}</Option>
              </Select>
            </Tooltip>
            <Tooltip title={t('user_page.sort_placeholder')}>
              <Select
                style={{ width: 130 }}
                value={sort}
                onChange={value => { setSort(value); setPage(1); }}
              >
                <Option value="asc">{t('user_page.sort_asc')}</Option>
                <Option value="desc">{t('user_page.sort_desc')}</Option>
              </Select>
            </Tooltip>
          </Space>
        </Col>
      </Row>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={{
          current: page,
          pageSize: limit,
          total: total,
          showSizeChanger: true,
          pageSizeOptions: ['2', '10', '20', '50', '100'],
          onChange: (p, l) => {
            setPage(p);
            setLimit(l);
          },
        }}
      />
      <ModalAddUser
        open={open}
        onOk={handleAddUser}
        onCancel={() => setOpen(false)}
      />
      <ModalUserDetail
        open={openView}
        user={viewUser}
        onCancel={() => setOpenView(false)}
        onRefreshData={fetchUsers}
      />
    </div>
  );
};

export default User;