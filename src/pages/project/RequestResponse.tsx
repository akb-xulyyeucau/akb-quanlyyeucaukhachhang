import { useParams, useNavigate } from 'react-router-dom';
import { LineChartOutlined } from '@ant-design/icons';
import {
  Card,
  Col,
  Row,
  Typography,
  Statistic,
  Rate,
  Button,
  Space,
  Tag,
  Avatar

} from 'antd';
import { Line } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import { ArrowLeftOutlined, FileTextOutlined, UserOutlined, ClockCircleOutlined, FileSearchOutlined, StarOutlined } from '@ant-design/icons';
import { Chart, registerables } from 'chart.js';
import { useState } from 'react';
import ProjectRatingModal from './components/ProjectRatingModal';
// import { color } from 'chart.js/helpers';




Chart.register(...registerables);
const { Title, Text } = Typography;

const RequestResponse = () => {
  const { pId } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const projectName = 'Nền Tảng Quản Lý Nhân Sự UWU';

  const progressLabels = [
    'Giai đoạn 1',
    'Giai đoạn 2',
    'Giai đoạn 3',
    'Giai đoạn 4',
    'Giai đoạn 5',
  ];
  const progressColors = ['#1890ff', '#d9d9d9', '#1890ff', '#1890ff', '#d9d9d9'];

  const progressData = {
    labels: progressLabels,
    datasets: [
      {
        data: [1, 1, 1, 1, 1],
        backgroundColor: progressColors,
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5', 'Tuần 6', 'Tuần 7', 'Tuần 8', 'Tuần 9', 'Tuần 10'],
    datasets: [
      {
        label: 'Báo cáo phía công ty',
        data: [2, 3, 2, 4, 3, 5, 4, 6, 5, 7],
        fill: false,
        borderColor: '#1890ff',
        tension: 0.3,
      },
      {
        label: 'Báo cáo phía khách hàng',
        data: [1, 2, 1, 2, 2, 3, 16, 3, 3, 4],
        fill: false,
        borderColor: '#52c41a',
        tension: 0.3,
      },
    ],
  };

  return (

    <div style={{ padding: '14px', maxWidth: 950, margin: '0 auto' }}>
      {/* HÀNG NÚT ĐIỀU HƯỚNG */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/customers-projects`)}
            >
              Quay lại danh sách
            </Button>
            <Button
              icon={<FileSearchOutlined />}
              onClick={() => navigate(`/project/${pId}`)}
            >
              Xem chi tiết dự án
            </Button>
          </Space>
        </Col>
      </Row>

      {/* TIÊU ĐỀ + NÚT ĐÁNH GIÁ */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            Đánh giá tổng quan dự án
          </Title>
        </Col>
        <Col>

          <Button type="primary"
            icon={<StarOutlined />}
            onClick={() => setIsModalOpen(true)}>
            Đánh giá dự án
          </Button>
        </Col>
      </Row>

      {/* THÔNG TIN DỰ ÁN */}
      <Card style={{ marginBottom: 15 }}>
        {/* Tiêu đề dự án */}
        <Title level={5} style={{ marginBottom: 12, fontSize: 20 }}>
          Dự án: <span style={{ color: '#1890ff' }}>{projectName}</span>
        </Title>

        {/* Grid thông tin khách hàng và thời gian */}
        <Row gutter={24}>
          <Col span={12} style={{ marginBottom: 7 }}>
            <Text strong>Khách hàng:</Text> Hệ thống giáo dục SteamX
          </Col>

          <Col span={12} style={{ marginBottom: 7 }}>
            <Text strong>Thời gian bắt đầu:</Text> 01/06/2025
          </Col>
          <Col span={12} style={{ marginBottom: 7 }}>
            <Text strong>Quản lý dự án:</Text> Duy minh
          </Col>
          <Col span={12}>
            <Text strong>Thời gian kết thúc (dự kiến):</Text> 30/07/2025
          </Col>
        </Row>
      </Card>



      {/* BIỂU ĐỒ & THỐNG KÊ */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card title="Tiến độ dự án" size="small">
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <Tag color="#1890ff">Đã hoàn thành</Tag>
              <Tag color="#d9d9d9">Chưa hoàn thành</Tag>
            </div>
            <div style={{ height: '200px' }}>
              <Pie
                data={progressData}
                options={{
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false,
                }}
              />
            </div>
            <div style={{ textAlign: 'center', fontWeight: 'bold', marginTop: 8 }}>
              Đã hoàn thành: 4/5 giai đoạn
            </div>
          </Card>
        </Col>

        <Col span={16}>
          <Card size="small">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Báo cáo phía công ty"
                  value={28}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Báo cáo phía khách hàng"
                  value={37}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Số giờ thực hiện"
                  value={1.572}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
            </Row>

            <div style={{ marginTop: 20 }}>
              <Title level={5}>
                <LineChartOutlined style={{ marginRight: 8 }} />
                Báo cáo theo thời gian
              </Title>
              <div style={{ height: '200px' }}>
                <Line
                  data={lineData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                  }}
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ĐÁNH GIÁ TỪ KHÁCH HÀNG */}
      <Card
        title="🗣️ Đánh giá từ khách hàng"
        style={{
          backgroundColor: '#f6ffed', // nền xanh lá nhạt
          border: '1px solid #b7eb8f',
          borderRadius: 8,
        }}
      >
        {/* Hàng 1: Avatar + Tên khách hàng / Đánh giá sao */}
        <Row gutter={24} style={{ marginBottom: 12 }} align="middle">
          <Col span={12}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size={32} icon={<UserOutlined />} />
              <div>
                <Text strong>Khách hàng:</Text>
                <div>Hệ thống giáo dục SteamX</div>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <Text strong>Đánh giá:</Text>
            <div>
              <Rate disabled defaultValue={5} />
            </div>
          </Col>
        </Row>

        {/* Hàng 2: Nhận xét */}
        <Row style={{ marginBottom: 12 }}>
          <Col span={24}>
            <Text strong>Nhận xét:</Text>
            <div style={{ marginTop: 4 }}>
              Nhóm phát triển hỗ trợ tốt, phản hồi nhanh.
              Giao diện rõ ràng nhưng cần cải thiện phần báo cáo xuất file.
            </div>
          </Col>
        </Row>

        {/* Hàng 3: Góp ý thêm */}
        <Row>
          <Col span={24}>
            <Text strong>Góp ý thêm:</Text>
            <div style={{ marginTop: 4 }}>
              Nhóm cần bổ sung chức năng xuất báo cáo định dạng PDF, cải thiện tốc độ phản hồi khi gửi yêu cầu.
            </div>
          </Col>
        </Row>
      </Card>

      {/* MODAL ĐÁNH GIÁ */}
      <ProjectRatingModal
        open={isModalOpen}
        onOk={(values) => {
          console.log('Đánh giá gửi:', values);
          setIsModalOpen(false);
        }}
        onCancel={() => setIsModalOpen(false)}
      />
    </div >

  );
};

export default RequestResponse;
