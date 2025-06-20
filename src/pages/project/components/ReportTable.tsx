import React , {useEffect , useState}from 'react';
import { Button, Space, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import {getReportByProjectId} from '../services/report.service';
import dayjs from 'dayjs';
import { PlusOutlined } from '@ant-design/icons';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

interface ReportTableProps{
  projectId: string;

}
const ReportTable: React.FC<ReportTableProps> = ({ projectId }) => {
  const [report , setReport] = useState([]);
  const [page, setPage] = useState(1);
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
  const columns: TableProps<DataType>['columns'] = [
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
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Người tạo',
      dataIndex: 'sender',
      key: 'sender',
      render: (text) => <a>{text.email}</a>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => dayjs( new Date(text).toLocaleDateString()).format('DD/MM/YYYY'),
      align: "center",
    },
    {
      title: 'Hành động',
      key: 'action',
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => console.log('Xem chi tiết', record)}>Xem chi tiết</Button>
          <Button type="default" onClick={() => console.log('Chỉnh sửa báo cáo', record)}>Chỉnh sửa</Button>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <Button type='primary' icon={<PlusOutlined />} onClick={() => console.log('Thêm báo cáo')}>Thêm báo cáo</Button>
      <Table<DataType>
        columns={columns}
        dataSource={report}
        pagination={{ pageSize: 10 }}
        rowKey="key"
        style={{ marginTop: 16 }}
      />
    </div>
  )
}
export default ReportTable;