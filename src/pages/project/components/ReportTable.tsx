import React , {useEffect , useState}from 'react';
import { Button, Space, Table, Tag, message } from 'antd';
import type { TableProps } from 'antd';
import {getReportByProjectId, createReport, updateReport} from '../services/report.service';
import dayjs from 'dayjs';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import ReportFormModal from './ReportFormModal';
import type { IReport, IPayloadReport } from '../interfaces/project.interface';

interface ReportTableProps{
  projectId: string;
}

const ReportTable: React.FC<ReportTableProps> = ({ projectId }) => {
  const [report , setReport] = useState<IReport[]>([]);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<IReport | undefined>();
  const limit = 10; // page size for pagination

  const fetchReport  = async () => {
    try {
      const response = await getReportByProjectId(projectId);
      if (response?.data) {
        setReport(response.data);
        console.log('report', response.data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  }

  useEffect(() => {
    fetchReport();
  }, [projectId]);

  const handleOpenModal = (record?: IReport) => {
    setSelectedReport(record);
    setIsModalOpen(true);
    console.log("thông tin báo cáo", record);
  };

  const handleCloseModal = () => {
    setSelectedReport(undefined);
    setIsModalOpen(false);
  };

  const handleSubmit = async (values: any) => {
    try {
      const formData = new FormData();
      
      // Add basic report data
      formData.append('projectId', projectId);
      formData.append('mainContent', values.mainContent);
      formData.append('sender', "user_id"); // This should be replaced with actual user ID
      formData.append('day', new Date().toISOString());

      // Add subContent data
      const subContentData = values.subContent.map((content: any) => ({
        contentName: content.contentName,
        fileIndices: content.files.map((_: any, index: number) => index)
      }));
      formData.append('subContent', JSON.stringify(subContentData));

      // Add files
      values.subContent.forEach((content: any) => {
        content.files.forEach((file: any) => {
          if (file.originFileObj) {
            formData.append('files', file.originFileObj);
          }
        });
      });

      if (selectedReport) {
        await updateReport(selectedReport._id, formData);
        message.success('Cập nhật báo cáo thành công');
      } else {
        await createReport(formData);
        message.success('Tạo báo cáo thành công');
      }
      
      handleCloseModal();
      fetchReport(); // Refresh the table data
    } catch (error) {
      console.error('Error submitting report:', error);
      message.error('Có lỗi xảy ra khi lưu báo cáo');
    }
  };

  const columns: TableProps<IReport>['columns'] = [
     {
      title: 'STT',
      dataIndex: "stt",
      key: "stt",
      render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
      width: 70,
      align: "center",
    },
    {
      title: 'Báo cáo',
      dataIndex: 'mainContent',
      key: 'mainContent',
      render: (_:any , record:IReport) => {
        let color = 'default';
        if(record.sender.role === 'guest' ){
          color = 'green';
        }else {
          color = 'blue';
        }
        return (
          <Tag color={color}>
            {record.mainContent}
          </Tag>
        );
      }
    },
    {
      title: 'Người tạo',
      dataIndex: 'sender',
      key: 'sender',
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
      render: (text) => dayjs(new Date(text).toLocaleDateString()).format('DD/MM/YYYY'),
      align: "center",
    },
    {
      title: 'Hành động',
      key: 'action',
      align: "center",
      width: 200, 
      render: (_, record: IReport) => (
        <Space size="middle">
          <Button type="primary" size='small' icon={<EyeOutlined />} onClick={() => console.log('Chi tiết', record)}>Chi tiết</Button>
          <Button type="default" size='small' icon={<EditOutlined />} onClick={() => handleOpenModal(record)}>Chỉnh sửa</Button>
          <Button type="default" size='small' icon={<DeleteOutlined />} danger onClick={() => console.log('Xóa báo cáo', record)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button type='primary' icon={<PlusOutlined />} onClick={() => handleOpenModal()}>Thêm báo cáo</Button>
      <Table<IReport>
        columns={columns}
        dataSource={report}
        pagination={{ pageSize: 10 }}
        rowKey="_id"
        style={{ marginTop: 16 }}
      />
      <ReportFormModal
        open={isModalOpen}
        onCancel={handleCloseModal}
        onSubmit={handleSubmit}
        initialValues={selectedReport}
        title={selectedReport ? 'Chỉnh sửa báo cáo' : 'Thêm báo cáo'}
      />
    </div>
  )
}

export default ReportTable;