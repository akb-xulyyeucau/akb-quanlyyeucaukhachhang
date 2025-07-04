import {
  Card,
  Col,
  Row,
  Typography,
  Select,
  DatePicker,
} from "antd";
import {
  FolderOutlined,
  FileOutlined,
  UserOutlined,
  StarFilled,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useState } from "react";

const { Text } = Typography;
const { Option } = Select;

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState("month");

  const metrics = [
    { icon: <FileOutlined style={{ fontSize: 32, color: '#1890ff' }} />, label: "Yêu cầu mới", value: 3, change: 0 },
    { icon: <FolderOutlined style={{ fontSize: 32, color: '#722ed1' }} />, label: "Đang thực hiện", value: 5, change: -5 },
    { icon: <FolderOutlined style={{ fontSize: 32, color: '#fa8c16' }} />, label: "Đã thực hiện", value: 13, change: 8 },
    { icon: <FolderOutlined style={{ fontSize: 32, color: '#13c2c2' }} />, label: "Tổng dự án", value: 18, change: 2 },
    { icon: <UserOutlined style={{ fontSize: 32, color: '#eb2f96' }} />, label: "Khách hàng ", value: 9, change: 110 },
    { icon: <StarFilled style={{ fontSize: 32, color: '#fadb14' }} />, label: "Đánh giá TB", value: 4.3, change: 1.2 },
  ];

  const progressData = [
    { name: "E-learning", percent: 22 },
    { name: "Quản lý kho", percent: 85 },
    { name: "CRM Client", percent: 90 },
    { name: "Quản lý kho", percent: 54 },
    { name: "CRM Client", percent: 76 },
    { name: "E-learning", percent: 80 },


  ];

  const ratingStats = [
    { name: "1 sao", value: 2 },
    { name: "2 sao", value: 3 },
    { name: "3 sao", value: 6 },
    { name: "4 sao", value: 10 },
    { name: "5 sao", value: 15 },
  ];

  const feedbackStats = [
    { name: "Nguyễn Văn A", value: 12 },
    { name: "Trần Thị B", value: 8 },
    { name: "Công ty X", value: 5 },
  ];

  const renderDatePicker = () => {
    switch (timeRange) {
      case "month":
        return (
          <DatePicker picker="month" placeholder="Chọn tháng/năm" style={{ marginLeft: 8 }} />
        );
      case "quarter":
        return (
          <DatePicker picker="quarter" placeholder="Chọn quý/năm" style={{ marginLeft: 8 }} />
        );
      case "year":
        return (
          <DatePicker picker="year" placeholder="Chọn năm" style={{ marginLeft: 8 }} />
        );
      default:
        return null;
    }
  };


  return (
    <div style={{ padding: '35px 25px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        {/* <Title level={4} style={{ margin: 0 }}>Tổng quan dự án & khách hàng</Title> */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Select
            defaultValue="month"
            style={{ width: 140 }}
            onChange={(value) => setTimeRange(value)}
          >
            <Option value="month">Theo tháng</Option>
            <Option value="quarter">Theo quý</Option>
            <Option value="year">Theo năm</Option>
          </Select>
          {renderDatePicker()}
        </div>
      </Row>

      {/* Hàng 1: KPI cards - 6 card trên 1 hàng */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {metrics.map((item, index) => {
          const isPositive = item.change >= 0;
          const changeColor = isPositive ? '#52c41a' : '#ff4d4f';
          const ChangeIcon = isPositive ? ArrowUpOutlined : ArrowDownOutlined;

          return (
            <Col key={index} xs={24} sm={12} md={8} lg={4} xl={4}>
              <Card
                size="default"
                bodyStyle={{ padding: 20 }}
                style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                <Row align="middle" justify="space-between">
                  <Col>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ marginRight: 12 }}>{item.icon}</div>
                      <div>
                        <Text strong style={{ fontSize: 21 }}>{item.value}</Text><br />
                        <Text type="secondary" style={{ fontSize: 14 }}>{item.label}</Text>
                      </div>
                    </div>
                  </Col>
                  <Col>
                    <Text style={{ color: changeColor, fontWeight: 600, fontSize: 18 }}>

                      {Math.abs(item.change)}%
                      <ChangeIcon style={{ marginRight: 4 }} />
                    </Text>
                  </Col>
                </Row>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Hàng 2: Biểu đồ cột tiến độ */}
      <Card
        size="default"
        title={<Text strong style={{ fontSize: 16 }}>Biểu đồ tiến độ dự án</Text>}
        style={{ marginBottom: 32, borderRadius: 12, }}
        bodyStyle={{ padding: 14 }}
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={progressData}>
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Bar dataKey="percent" fill="#1890ff" barSize={110}>
              <LabelList dataKey="percent" position="top" formatter={(value) => `${value}%`} />
            </Bar>

          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Hàng 3: PieChart + BarChart ngang */}
      <Row gutter={16}>
        <Col span={12}>
          <Card
            size="default"
            title={<Text strong style={{ fontSize: 16 }}>Tỷ lệ đánh giá theo sao (1-5)</Text>}
            bodyStyle={{ padding: 24 }}
            style={{ borderRadius: 12 }}
          >
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={ratingStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {ratingStats.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={["#FF4D4F", "#FAAD14", "#FADB14", "#52C41A", "#1890FF"][index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col span={12}>
          <Card
            size="default"
            title={<Text strong style={{ fontSize: 16 }}>Top 3 khách hàng phản hồi nhiều nhất</Text>}
            bodyStyle={{ padding: 24 }}
            style={{ borderRadius: 12 }}
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={feedbackStats} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="value" fill="#722ed1" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;