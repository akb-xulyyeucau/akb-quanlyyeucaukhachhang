import { useState, useEffect, useCallback } from 'react';
import { Button, Dropdown, Table, Tooltip, Tag, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { IProject } from './interfaces/project.interface';
import { getAllProject, getProjectByCustomerId } from './services/project.service';
import { EditOutlined, EllipsisOutlined, AreaChartOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuthUser, selectUserProfile } from '../../common/stores/auth/authSelector';
import ModalFilter from './components/ModalFilter';
import type { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

interface FilterValues {
  searchTerm: string;
  isDone?: boolean;
  timeFilterType: 'month' | 'quarter';
  selectedDate: Dayjs | null;
}

const CustomerProject = () => {
  const { t } = useTranslation('project');
  const navigate = useNavigate();
  const [projects, setProjects] = useState<IProject[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Partial<FilterValues>>({});

  const user = useSelector(selectAuthUser);
  const profile = useSelector(selectUserProfile);

  const fetchProjectData = useCallback(async (filters: Partial<FilterValues> = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());

      if (filters.searchTerm) {
        queryParams.append('searchTerm', filters.searchTerm);
      }
      if (filters.isDone !== undefined) {
        queryParams.append('isDone', filters.isDone.toString());
      }

      if (filters.selectedDate) {
        const timeFilter = {
          type: filters.timeFilterType,
          year: filters.selectedDate.year(),
          value: filters.timeFilterType === 'month'
            ? filters.selectedDate.month() + 1
            : Math.floor(filters.selectedDate.month() / 3) + 1
        };
        queryParams.append('timeFilter', JSON.stringify(timeFilter));
      }

      const response = user?.role === "guest" && profile?._id
        ? await getProjectByCustomerId(profile._id, queryParams.toString())
        : await getAllProject(queryParams.toString());

      setProjects(response.data || []);
      setTotal(response.pagination?.totalItems || response.data?.length || 0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, user?.role, profile?._id]);

  useEffect(() => {
    fetchProjectData(activeFilters);
  }, [fetchProjectData, page, limit]);

  const handleFilter = (values: FilterValues) => {
    setActiveFilters(values);
    setPage(1);
    setFilterModalVisible(false);
    fetchProjectData(values);
  };

  const removeFilter = (key: keyof FilterValues) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    setActiveFilters(newFilters);
    setPage(1);
    fetchProjectData(newFilters);
  };

  const renderFilterChips = () => {
    const chips = [];

    if (activeFilters.searchTerm) {
      chips.push(
        <Tag key="searchTerm" closable onClose={() => removeFilter('searchTerm')} style={{ marginRight: 8 }}>
          {t('projectPage.name')}: {activeFilters.searchTerm}
        </Tag>
      );
    }

    if (activeFilters.isDone !== undefined) {
      chips.push(
        <Tag key="isDone" closable onClose={() => removeFilter('isDone')} style={{ marginRight: 8 }}>
          {t('projectPage.status')}: {activeFilters.isDone ? t('projectPage.completed') : t('projectPage.inProgress')}
        </Tag>
      );
    }

    if (activeFilters.selectedDate) {
      const format = activeFilters.timeFilterType === 'month' ? 'MM/YYYY' : '[Quý] Q/YYYY';
      chips.push(
        <Tag
          key="timeFilter"
          closable
          onClose={() => {
            removeFilter('selectedDate');
            removeFilter('timeFilterType');
          }}
          style={{ marginRight: 8 }}
        >
          {t('projectPage.time')}: {activeFilters.selectedDate.format(format)}
        </Tag>
      );
    }

    return chips.length > 0 ? (
      <Space style={{ marginBottom: 16 }}>
        {chips}
        {chips.length > 0 && (
          <Button type="link" size="small" onClick={() => {
            setActiveFilters({});
            setPage(1);
            fetchProjectData({});
          }}>
            {t('projectPage.clearAll')}
          </Button>
        )}
      </Space>
    ) : null;
  };

  const handleViewDetail = (record: IProject) => {
    navigate(`/project/${record._id}`);
  };

  const handleViewLog = (record: IProject) => {
    navigate(`/request-response/${record._id}`);
  };

  const columns: ColumnsType<IProject> = [
    {
      title: t('projectPage.no'),
      dataIndex: 'stt',
      key: 'stt',
      render: (_: any, __: IProject, index: number) => (page - 1) * limit + index + 1,
      align: 'center',
      width: 60,
    },
    {
      title: t('projectPage.projectCode'),
      dataIndex: 'alias',
      key: 'alias',
      align: 'center',
      render: (text: string) => <Tag><Tooltip title={text}>{text}</Tooltip></Tag>,
    },
    {
      title: t('projectPage.projectName'),
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (text: string) => <Tag><Tooltip title={text}>{text}</Tooltip></Tag>,
    },
    {
      title: t('projectPage.projectManager'),
      dataIndex: ['pm', 'name'],
      key: 'pm.name',
      align: 'center',
      render: (_: any, record: IProject) => (
        <Tag color="blue"><Tooltip title={record.pm?.name}>{record.pm?.name}</Tooltip></Tag>
      ),
    },
    {
      title: t('projectPage.customer'),
      dataIndex: ['customer', 'name'],
      key: 'customer.name',
      align: 'center',
      render: (_: any, record: IProject) => (
        <Tag color="green"><Tooltip title={record.customer?.name}>{record.customer?.name}</Tooltip></Tag>
      ),
    },
    {
      title: t('projectPage.status'),
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (text: string) => {
        let color = '';
        if (text === t('projectPage.inProgress')) color = 'purple';
        else if (text === t('projectPage.completed')) color = 'green';
        return <Tag color={color}><Tooltip title={text}>{text}</Tooltip></Tag>;
      },
    },
    {
      title: t('projectPage.startDate'),
      dataIndex: 'day',
      key: 'day',
      align: 'center',
      render: (text: string) =>
        text ? dayjs(new Date(text).toLocaleDateString()).format('DD/MM/YYYY') : '',
    },
    {
      title: t('projectPage.action'),
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
                {t('projectPage.projectDetail')}
              </span>
            ),
          },
          {
            key: 'log',
            label: (
              <span>
                <AreaChartOutlined style={{ color: '#ff4d4f', marginRight: 6 }} />
                {t('projectPage.requestResponse')}
              </span>
            ),
          },
        ];
        const handleMenuClick = ({ key }: { key: string }) => {
          if (key === 'detail') handleViewDetail(record);
          else if (key === 'log') handleViewLog(record);
        };
        return (
          <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={['click']} placement="bottomLeft">
            <Button icon={<EllipsisOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Button type="primary" icon={<FilterOutlined />} onClick={() => setFilterModalVisible(true)}>
            {t('projectPage.filter')}
          </Button>
        </div>
        {renderFilterChips()}
      </div>

      <ModalFilter
        visible={filterModalVisible}
        onCancel={() => setFilterModalVisible(false)}
        onFilter={handleFilter}
        initialValues={activeFilters}
        loading={loading}
      />

      <Table
        rowKey="_id"
        columns={columns}
        loading={loading}
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
