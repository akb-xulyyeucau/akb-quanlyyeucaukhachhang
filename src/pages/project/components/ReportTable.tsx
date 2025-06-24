import { useEffect, useState, useMemo } from 'react';
import { Button, Modal, Space, Table, Tag, message, Input, Select } from 'antd';
import type { TableProps } from 'antd';
import { getReportByProjectId, createReport, deleteReport } from '../services/report.service';
import dayjs from 'dayjs';
import { DeleteOutlined, EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import ReportFormModal from './ReportFormModal';
import ReportDetailModal from './ReportDetailModal';
import type { IReport } from '../interfaces/project.interface';
import { useDebounce } from '../../../common/hooks/useDebounce';

interface ReportTableProps {
  projectId: string;
}

const ReportTable: React.FC<ReportTableProps> = ({ projectId }) => {
  const [report, setReport] = useState<IReport[]>([]);
  const [page] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<IReport | null>(null);
  const [loading, setLoading] = useState(false);
  
  // UI states
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  
  // Sử dụng useMemo để tránh tạo object mới mỗi lần render
  const searchParams = useMemo(() => ({
    search,
    role
  }), [search, role]);

  const debouncedParams = useDebounce(searchParams, 500);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await getReportByProjectId(projectId, {
        search: debouncedParams.search,
        isCustomer: debouncedParams.role
      });
      if (response?.data) {
        setReport(response.data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      message.error('Không thể tải danh sách báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [projectId, debouncedParams.search, debouncedParams.role]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenDetailModal = (record: IReport) => {
    setSelectedReport(record);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedReport(null);
    setIsDetailModalOpen(false);
  };

  const handleSubmit = async (values: any) => {
    try {
      console.log('Starting submit with values:', values);
      const formData = new FormData();
      
      // Add basic report data
      formData.append('projectId', projectId);
      formData.append('mainContent', values.mainContent);
      formData.append('day', new Date().toISOString());

      // First, collect all files and create a continuous index
      let allFiles: Array<{ file: any; subContentIndex: number }> = [];
      values.subContent.forEach((content: any, subContentIndex: number) => {
        const contentFiles = content.files || [];
        contentFiles.forEach((file: any) => {
          const fileObj = file.originFileObj || file;
          if (fileObj && typeof fileObj === 'object' && 'type' in fileObj) {
            allFiles.push({ file: fileObj, subContentIndex });
          }
        });
      });

      // Now create subContentData with correct fileIndices
      const subContentData = values.subContent.map((content: any, subContentIndex: number) => {
        const contentFiles = content.files || [];
        const fileIndices: number[] = [];
        
        contentFiles.forEach((file: any) => {
          const fileObj = file.originFileObj || file;
          if (fileObj && typeof fileObj === 'object' && 'type' in fileObj) {
            // Find the index of this file in the allFiles array
            const globalIndex = allFiles.findIndex(
              f => f.file === fileObj && f.subContentIndex === subContentIndex
            );
            if (globalIndex !== -1) {
              fileIndices.push(globalIndex);
            }
          }
        });

        return {
          contentName: content.contentName,
          fileIndices
        };
      });

      formData.append('subContent', JSON.stringify(subContentData));

      // Add all files to formData in order
      allFiles.forEach(({ file }, index) => {
        console.log(`Adding file ${index} to formData:`, {
          type: file.type,
          size: file.size,
          name: file.name
        });
        formData.append('files', file);
      });

      console.log('Total files added to formData:', allFiles.length);

      // Log all entries in formData
      for (let [key, value] of formData.entries()) {
        if (value instanceof Blob) {
          console.log(`FormData ${key}:`, {
            type: value.type,
            size: value.size
          });
        } else {
          console.log(`FormData ${key}:`, value);
        }
      }

      await createReport(formData);
      message.success('Tạo báo cáo thành công');
      
      handleCloseModal();
      fetchReport(); // Refresh the table data
    } catch (error) {
      console.error('Error submitting report:', error);
      message.error('Có lỗi xảy ra khi lưu báo cáo');
    }
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: 'Xác nhận xóa báo cáo',
      content: `Bạn có muốn xóa báo cáo "${record.mainContent}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteReport(record._id);
          message.success('Xóa báo cáo thành công');
          fetchReport();
        } catch (error) {
          console.error('Error deleting report:', error);
          message.error('Có lỗi xảy ra khi xóa báo cáo');
        }
      }
    });
  };

  const columns: TableProps<IReport>['columns'] = [
    {
      title: 'STT',
      dataIndex: "stt",
      key: "stt",
      render: (_: any, __: any, index: number) => (page - 1) * 10 + index + 1,
      width: 70,
      align: "center",
    },
    {
      title: 'Báo cáo',
      dataIndex: 'mainContent',
      key: 'mainContent',
      width: 200,
      render: (_:any , record:IReport) => {
        let color = record.sender.role === 'guest' ? 'green' : 'blue';
        return (
          <Tag color={color}>
            {record.mainContent}
          </Tag>
        );
      }
    },
    {
      title: 'Số nội dung',
      dataIndex: 'subContentCount',
      key: 'subContentCount',
      width: 120,
      render: (count) => (
        <Tag color="warning">
          {count}
        </Tag>
      ),
      align: "center",
    },
    {
      title: 'Người tạo',
      dataIndex: 'sender',
      key: 'sender',
      width: 180,
      render: (sender) => {
        let color = 'default';
        if(sender.role === 'guest' ){
          color = 'green';
        }
        else{
          color = 'blue';
        }
        return(
          <Tag color={color}>
            {sender.email}
          </Tag>
        );
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (text) => <Tag color='purple'>{ dayjs(new Date(text).toLocaleDateString()).format('DD/MM/YYYY')}</Tag>,
      align: "center",
    },
    {
      title: 'Hành động',
      key: 'action',
      align: "center",
      width: 150, 
      render: (_, record: IReport) => (
        <Space size="middle">
          <Button type="primary" size='small' icon={<EyeOutlined />} onClick={() => handleOpenDetailModal(record)}>Chi tiết</Button>
          <Button type="default" size='small' icon={<DeleteOutlined />} danger onClick={() => handleDelete(record)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ 
        marginBottom: 16, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Input
            placeholder="Tìm kiếm báo cáo..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            style={{ width: 140 }}
            value={role}
            onChange={setRole}
            placeholder="Chọn loại"
            // allowClear
            options={[
              { value: '', label: 'Tất cả báo cáo' },
              { value: 'true', label: 'Khách hàng' },
              { value: 'false', label: 'Quản lý dự án' }
            ]}
          />
        </div>
        <Button type='primary' icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Thêm báo cáo
        </Button>
      </div>

      <Table<IReport>
        columns={columns}
        dataSource={report}
        pagination={false}
        rowKey="_id"
        style={{ marginTop: 16 }}
        scroll={{ x: 'max-content' }}
        loading={loading}
      />
      <ReportFormModal
        open={isModalOpen}
        onCancel={handleCloseModal}
        onSubmit={handleSubmit}
        title='Thêm báo cáo'
      />
      <ReportDetailModal
        open={isDetailModalOpen}
        onCancel={handleCloseDetailModal}
        report={selectedReport}
      />
    </div>
  );
}

export default ReportTable;