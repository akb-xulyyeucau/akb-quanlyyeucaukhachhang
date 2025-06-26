import React from 'react';
import { Row, Col, Card, Statistic, Typography, Button, Avatar, Tag, Divider } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, FolderOpenOutlined, ClockCircleOutlined, StarOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const { Title, Text } = Typography;

const Dashboard = () => {
  const stats = {
    totalProjects: 18,
    ongoingProjects: 5,
    completedProjects: 13,
    avgDuration: 45,
    totalDocuments: 120,
    avgRating: 4.3,
    totalCustomers: 9,
  };

  const recentFeedback = [
    {
      project: 'Quản lý đào tạo SteamX',
      customer: 'Nguyễn Văn A',
      rating: 5,
      comment: 'Dự án triển khai rất tốt, đúng tiến độ.',
    },
    {
      project: 'Nền tảng Elearning ABC',
      customer: 'Trần Thị B',
      rating: 4,
      comment: 'Hài lòng với chất lượng và hỗ trợ.',
    },
  ];

  const barChartData = {
    labels: ['ERP Logistics', 'Shopeasy', 'Quản lý đào tạo SteamX', 'Nền tảng Elearning ABC', 'Ứng dụng Mobile XYZ'],
    datasets: [
      {
        label: 'Tiến độ (%)',
        data: [60, 35, 80, 50, 90],
        backgroundColor: ['#1890ff', '#ffc53d'],
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          callback: function (tickValue: string | number) {
            return `${tickValue}%`;
          },
        },
      },
    },
  };

  return (
    <div style={{ padding: 16 }}>
      {/* I. Tiêu đề & hành động */}
      <Title level={3}>Trang chủ quản lý dự án</Title>

      {/* II. Các chỉ số nhanh */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="Tổng dự án" value={stats.totalProjects} prefix={<FolderOpenOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Đang thực hiện" value={stats.ongoingProjects} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Đã hoàn thành" value={stats.completedProjects} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Số ngày TB" value={stats.avgDuration} suffix="ngày" /></Card></Col>
        <Col span={6}><Card><Statistic title="Tài liệu" value={stats.totalDocuments} prefix={<FileTextOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Đánh giá TB" value={stats.avgRating} prefix={<StarOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Khách hàng" value={stats.totalCustomers} prefix={<UserOutlined />} /></Card></Col>
        <Col span={6}><Card><Button type="primary" icon={<PlusOutlined />}>Tạo dự án mới</Button></Card></Col>
      </Row>

      {/* III. Khu vực nội dung chính gồm Bar Chart + Đánh giá */}
      <Row gutter={16}>
        {/* Bar Chart tiến độ */}
        <Col xs={24} md={12}>
          <Card title="⏳ Tiến độ các dự án đang thực hiện" bodyStyle={{ padding: 16 }}>
            <div style={{ height: 220 }}>
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </Card>
        </Col>

        {/* Đánh giá gần đây */}
        <Col xs={24} md={12}>
          <Card title="⭐ Đánh giá gần đây từ khách hàng" bodyStyle={{ padding: 16, maxHeight: 220, overflowY: 'auto' }}>
            {recentFeedback.map((fb, idx) => (
              <div key={idx} style={{ marginBottom: 12 }}>
                <Row gutter={8} align="middle">
                  <Col flex="auto">
                    <Text strong>{fb.customer}</Text> đánh giá dự án <Text strong>{fb.project}</Text>
                    <br />
                    <Tag color="gold">{fb.rating} sao</Tag>
                    <div style={{ fontSize: 12, color: '#555' }}>{fb.comment}</div>
                  </Col>
                  <Col>
                    <Avatar icon={<UserOutlined />} />
                  </Col>
                </Row>
                {idx !== recentFeedback.length - 1 && <Divider style={{ margin: '8px 0' }} />}
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;