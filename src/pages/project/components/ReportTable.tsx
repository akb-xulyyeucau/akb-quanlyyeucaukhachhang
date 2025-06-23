import React , {useEffect , useState}from 'react';
import { Button, Space, Table, Tag, message } from 'antd';
import type { TableProps } from 'antd';
import {getReportByProjectId, createReport} from '../services/report.service';
import dayjs from 'dayjs';
import { DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import ReportFormModal from './ReportFormModal';
import type { IReport } from '../interfaces/project.interface';

interface ReportTableProps{
  projectId: string;
}

const ReportTable: React.FC<ReportTableProps> = ({ projectId }) => {
  const [report , setReport] = useState<IReport[]>([]);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
      width: 150, 
      render: (_, record: IReport) => (
        <Space size="middle">
          <Button type="primary" size='small' icon={<EyeOutlined />} onClick={() => console.log('Chi tiết', record)}>Chi tiết</Button>
          <Button type="default" size='small' icon={<DeleteOutlined />} danger onClick={() => console.log('Xóa báo cáo', record)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button type='primary' icon={<PlusOutlined />} onClick={handleOpenModal}>Thêm báo cáo</Button>
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
        title='Thêm báo cáo'
      />
    </div>
  )
}

export default ReportTable;