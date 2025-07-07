import {
  Card,
  Col,
  Row,
  Typography,
  Select,
  DatePicker,
  Tooltip as AntTooltip,
} from "antd";
import {
  FolderOutlined,
  FileOutlined,
  UserOutlined,
  StarFilled,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
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
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;
const { Option } = Select;

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState("month");
  const [topCustomers, setTopCustomers] = useState(3);
  const navigate = useNavigate();

  const metrics = [
    {
      icon: <FileOutlined style={{ fontSize: 32, color: '#1890ff' }} />, label: "Yêu cầu mới", value: 3, change: null,
      colorStart: '#e6f7ff', colorEnd: '#bae7ff', route: '/customers-projects-request'
    },
    {
      icon: <FolderOutlined style={{ fontSize: 32, color: '#722ed1' }} />, label: "Đang thực hiện", value: 5, change: null,
      colorStart: '#f9f0ff', colorEnd: '#d3adf7', route: '/customers-projects'
    },
    {
      icon: <FolderOutlined style={{ fontSize: 32, color: '#fa8c16' }} />, label: "Đã thực hiện", value: 13, change: 8,
      colorStart: '#fff7e6', colorEnd: '#ffd591', route: '/customers-projects'
    },
    {
      icon: <FolderOutlined style={{ fontSize: 32, color: '#13c2c2' }} />, label: "Tổng dự án", value: 18, change: 2,
      colorStart: '#e6fffb', colorEnd: '#87e8de', route: '/customers-projects'
    },
    {
      icon: <UserOutlined style={{ fontSize: 32, color: '#eb2f96' }} />, label: "Khách hàng", value: 9, change: 110,
      colorStart: '#fff0f6', colorEnd: '#ffadd2', route: '/customers'
    },
  ];

  const progressData = [
    { name: "E-learning", percent: 22, owner: "Nguyễn Văn A", deadline: "2025-07-20" },
    { name: "Quản lý kho", percent: 85, owner: "Trần Thị B", deadline: "2025-07-25" },
    { name: "CRM Client", percent: 90, owner: "Lê Văn C", deadline: "2025-07-15" },
    { name: "Quản lý kho", percent: 54, owner: "Công ty X", deadline: "2025-07-22" },
    { name: "CRM Client", percent: 76, owner: "Nguyễn Văn A", deadline: "2025-07-28" },
    { name: "E-learning", percent: 80, owner: "Trần Thị B", deadline: "2025-07-30" },
  ];

  const ratingStats = [
    { name: "1 sao", value: 2 },
    { name: "2 sao", value: 3 },
    { name: "3 sao", value: 6 },
    { name: "4 sao", value: 10 },
    { name: "5 sao", value: 15 },
  ];

  const allFeedbackStats = [
    { name: "Nguyễn Văn A", value: 34 },
    { name: "Trần Thị B", value: 18 },
    { name: "Công ty X", value: 15 },
    { name: "Lê Văn C", value: 14 },
    { name: "Phạm Thị D", value: 3 },
    { name: "Hoàng Văn E", value: 2 },
    { name: "Đỗ Thị F", value: 1 },
  ];

  const feedbackStats = allFeedbackStats.slice(0, topCustomers);

  const totalRatings = ratingStats.reduce((sum, item) => sum + item.value, 0);
  const averageRating = ratingStats.reduce((sum, item, index) => sum + (index + 1) * item.value, 0) / totalRatings;

  const renderDatePicker = () => {
    switch (timeRange) {
      case "month": return <DatePicker picker="month" style={{ marginLeft: 8 }} placeholder="Chọn tháng/năm" />;
      case "quarter": return <DatePicker picker="quarter" style={{ marginLeft: 8 }} placeholder="Chọn quý/năm" />;
      case "year": return <DatePicker picker="year" style={{ marginLeft: 8 }} placeholder="Chọn năm" />;
      default: return null;
    }
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: any[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ background: '#fff', padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>
          <p><strong>{label}</strong></p>
          <p>Tiến độ: {data.percent}%</p>
          <p>Phụ trách: {data.owner}</p>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data: { activeLabel: any; }) => {
    if (data && data.activeLabel) {
      const projectName = data.activeLabel;
      navigate(`/projects/${encodeURIComponent(projectName)}`);
    }
  };

  return (
    <div style={{ padding: '35px 25px', background: '#f4f6f8', minHeight: '100vh' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Tổng quan dự án & khách hàng</Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Select defaultValue="month" style={{ width: 140 }} onChange={(value) => setTimeRange(value)}>
            <Option value="month">Theo tháng</Option>
            <Option value="quarter">Theo quý</Option>
            <Option value="year">Theo năm</Option>
          </Select>
          {renderDatePicker()}
          <AntTooltip title="Làm mới">
            <ReloadOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
          </AntTooltip>
        </div>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {metrics.map((item, index) => {
          const isPositive = item.change !== null && item.change >= 0;
          const changeColor = isPositive ? '#52c41a' : '#ff4d4f';
          const ChangeIcon = isPositive ? ArrowUpOutlined : ArrowDownOutlined;

          return (
            <Col
              key={index}
              xs={24}
              sm={12}
              md={8}
              lg={6}
              xl={Math.floor(24 / metrics.length)}
              style={{ minWidth: 265 }}
            >
              <div
                onClick={() => navigate(item.route)}
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${item.colorStart} 0%, ${item.colorEnd} 100%)`,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s ease',
                  minHeight: 100,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                }}
              >
                <Card
                  bodyStyle={{ padding: 20, background: 'transparent' }}
                  bordered={false}
                  style={{ width: '100%' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                      <div style={{ marginRight: 12, flexShrink: 0 }}>{item.icon}</div>
                      <div style={{ minWidth: 0 }}>
                        <Text strong style={{ fontSize: 21, display: 'block' }}>{item.value}</Text>
                        <Text
                          type="secondary"
                          style={{
                            fontSize: 14,
                            wordBreak: 'break-word',
                            lineHeight: '1.2'
                          }}
                        >
                          {item.label}
                        </Text>
                      </div>
                    </div>
                    {item.change !== null && (
                      <div style={{ flexShrink: 0 }}>
                        <Text style={{ color: changeColor, fontWeight: 600, fontSize: 16 }}>
                          {Math.abs(item.change)}% <ChangeIcon />
                        </Text>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </Col>
          );
        })}
      </Row>
      <Card title={<Text strong style={{ fontSize: 16 }}>Biểu đồ tiến độ dự án</Text>} style={{ marginBottom: 32, borderRadius: 16 }} bodyStyle={{ padding: 14, background: '#fff' }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={progressData} onClick={handleBarClick}>
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              content={<CustomTooltip />}
              isAnimationActive={false}
              position={undefined}
            />
            <Bar dataKey="percent" fill="#69c0ff" barSize={90}>
              <LabelList dataKey="percent" position="top" formatter={(v) => `${v}%`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Row gutter={16} style={{ alignItems: 'stretch' }}>
        <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Card
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 0,
                height: '100%',
                border: '1px solid #f0f0f0',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
              bodyStyle={{ padding: 27, height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <Row gutter={16} style={{ height: '100%' }}>
                <Col span={10} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'left' }}>
                    {<Text strong style={{ fontSize: 18, marginBottom: 25 }}>Tỉ lệ đánh giá từ khách hàng</Text>}
                    <div style={{
                      textAlign: 'center',
                      marginTop: 5,
                      marginBottom: 15,
                      border: '2px solid #fadb14',
                      borderRadius: 12,
                      padding: '12px 16px',
                      backgroundColor: '#fffbe6',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Text strong style={{ fontSize: 25 }}>{averageRating.toFixed(1)}</Text>
                        <StarFilled style={{ fontSize: 23, color: '#fadb14', marginLeft: 8 }} />
                      </div>
                      <Text type="secondary" style={{ fontSize: 14, marginBottom: 5, display: 'inline-block' }}>Đánh giá trung bình</Text>
                      <br />
                      <Text strong>{totalRatings}</Text>{" "} lượt đánh giá đã ghi nhận
                    </div>
                    <div style={{ marginTop: 10, marginLeft: 35 }}>
                      <Row gutter={8}>
                        <Col span={12}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{ width: 16, height: 16, backgroundColor: '#1890FF', borderRadius: 2, marginRight: 8 }}></div>
                              <Text style={{ fontSize: 14 }}>5 sao</Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{ width: 16, height: 16, backgroundColor: '#FADB14', borderRadius: 2, marginRight: 8 }}></div>
                              <Text style={{ fontSize: 14 }}>3 sao</Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{ width: 16, height: 16, backgroundColor: '#FF4D4F', borderRadius: 2, marginRight: 8 }}></div>
                              <Text style={{ fontSize: 14 }}>1 sao</Text>
                            </div>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{ width: 16, height: 16, backgroundColor: '#52C41A', borderRadius: 2, marginRight: 8 }}></div>
                              <Text style={{ fontSize: 14 }}>4 sao</Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{ width: 16, height: 16, backgroundColor: '#FAAD14', borderRadius: 2, marginRight: 8 }}></div>
                              <Text style={{ fontSize: 14 }}>2 sao</Text>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </Col>
                <Col span={14} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <ResponsiveContainer width="100%" height={290}>
                    <PieChart>
                      <Pie data={ratingStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>
                        {ratingStats.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={["#FF4D4F", "#FAAD14", "#FADB14", "#52C41A", "#1890FF"][index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Col>
              </Row>
            </Card>
          </div>
        </Col>

        <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: 16 }}>Số lượng báo cáo từ khách hàng</Text>
                <Select
                  defaultValue={3}
                  style={{ width: 150 }}
                  onChange={(value) => setTopCustomers(value)}
                >
                  <Option value={3}>Top 3 nhiều nhất</Option>
                  <Option value={5}>Top 5 nhiều nhất</Option>
                  <Option value={7}>Top 7 nhiều nhất</Option>
                </Select>
              </div>
            }
            bodyStyle={{ padding: 24, background: '#fff', height: '100%', display: 'flex', flexDirection: 'column' }}
            style={{ borderRadius: 16, height: '100%', display: 'flex', flex: 1, flexDirection: 'column' }}
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={feedbackStats} layout="vertical" margin={{ right: 50, left: 0, top: 0, bottom: 0 }}>
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={110} />
                <Tooltip />
                <Bar dataKey="value" fill="#9254de">
                  <LabelList dataKey="value" position="right" offset={16} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;