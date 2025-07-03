import {
  Card,
  Col,
  Row,
  Button,
  Avatar,
  Rate,
  Typography,
  Progress,
  Carousel,
  Space,
} from "antd";
import {
  PlusOutlined,
  FolderOutlined,
  FileOutlined,
  UserOutlined,
  StarFilled,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const { Title, Text } = Typography;

const Dashboard = () => {
  const progressData = [
    { name: "E-learning", percent: 80, phase: "Kiểm thử" },
    { name: "Quản lý kho", percent: 60, phase: "Phát triển" },
    { name: "CRM Client", percent: 90, phase: "Triển khai" },
  ];

  const growthData = [
    { month: "T1", projects: 2 },
    { month: "T2", projects: 4 },
    { month: "T3", projects: 5 },
    { month: "T4", projects: 6 },
    { month: "T5", projects: 8 },
  ];

  const metrics = [
    { icon: <FolderOutlined />, label: "Tổng dự án", value: 18 },
    { icon: <FolderOutlined />, label: "Đang thực hiện", value: 5 },
    { icon: <FileOutlined />, label: "Tài liệu", value: 120 },
    { icon: <UserOutlined />, label: "Khách hàng", value: 9 },
    { icon: <StarFilled style={{ color: '#fadb14' }} />, label: "Đánh giá TB", value: 4.3 },
  ];

  const recentReviews = [
    {
      name: "Nguyễn Văn A",
      project: "Hệ thống E-learning",
      rating: 5,
      comment: "Dự án rất hiệu quả và đúng tiến độ.",
    },
    {
      name: "Trần Thị B",
      project: "Quản lý kho ABC",
      rating: 4,
      comment: "Hài lòng với hỗ trợ, cần cải thiện thêm UI.",
    },
  ];

  const today = new Date();
  const monthYear = today.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>Trang chủ</Title>
        <Space>
          <Button size="small" type="default" style={{ padding: 15 }}>📩 3 yêu cầu mới</Button>
          <Button size="small" type="primary" style={{ padding: 15 }} icon={<PlusOutlined />}>Tạo yêu cầu</Button>
        </Space>
      </Row>

      {/* Thống kê */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {metrics.map((item, index) => (
          <Col key={index} flex="1">
            <Card
              size="small"
              bodyStyle={{
                display: 'flex',
                alignItems: 'center',
                padding: 8,
                height: '100%',
              }}
              style={{ minWidth: 140 }}
            >
              <div style={{ fontSize: 16, marginRight: 8 }}>{item.icon}</div>
              <div>
                <Text strong>{item.value}</Text><br />
                <Text type="secondary" style={{ fontSize: 12 }}>{item.label}</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>


      {/* Tiến độ + Lịch */}
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Card size="small" title={<Text strong>Tiến độ các dự án</Text>}>
            {progressData.map((item, index) => (
              <div key={index} style={{ marginBottom: 12 }}>
                <Text strong>{item.name}</Text>
                <Row justify="space-between" align="middle" style={{ marginTop: 4 }}>
                  <Col style={{ flex: 1, maxWidth: '75%' }}>
                    <Progress percent={item.percent} size="small" strokeWidth={10} status="active" />
                  </Col>
                  <Col style={{ minWidth: 100, textAlign: 'right', paddingLeft: 8 }}>
                    <div style={{ fontSize: 13 }}>{item.phase}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>Ngày: 30/06/2025</div>
                  </Col>
                </Row>
              </div>
            ))}
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" title={<Text strong>{monthYear}</Text>} bodyStyle={{ padding: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Calendar
                view="month"
                showNavigation={false}
                calendarType="iso8601"
                tileContent={() => null}
                locale="vi"
                className="no-border-calendar"
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Đánh giá + Biểu đồ */}
      <Row gutter={12}>
        <Col span={12}>
          <Card size="small" title={<Text strong>Đánh giá gần đây</Text>} style={{ height: 240 }} bodyStyle={{ height: 200, overflow: "hidden", padding: 20 }}>
            <Carousel autoplay dots={false} vertical slidesToShow={2}>
              {recentReviews.map((review, index) => (
                <div key={index}>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <Avatar size="small" icon={<UserOutlined />} />
                    <div>
                      <Text strong>{review.name}</Text> - <Text type="secondary">{review.project}</Text>
                    </div>
                  </div>
                  <Rate disabled defaultValue={review.rating} style={{ fontSize: 21, marginTop: 7 }} />
                  <div><Text>{review.comment}</Text></div>
                </div>
              ))}
            </Carousel>
          </Card>
        </Col>

        <Col span={12}>
          <Card size="small" title={<Text strong>Tăng trưởng dự án</Text>} style={{ height: 240 }} bodyStyle={{ padding: 8 }}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="projects" stroke="#1890ff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Inline CSS to remove calendar border */}
      <style>{`
        .no-border-calendar.react-calendar {
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;