import { useParams, useNavigate } from 'react-router-dom';
import { LineChartOutlined } from '@ant-design/icons';
import {
  Card,
  Col,
  Row,
  Typography,
  Statistic,
  Button,
  Space,
  Tag,
  Avatar

} from 'antd';
import { Line } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import { ArrowLeftOutlined, FileTextOutlined, UserOutlined, ClockCircleOutlined, FileSearchOutlined, StarOutlined } from '@ant-design/icons';
import { Chart, registerables } from 'chart.js';
import { useEffect, useState } from 'react';
import ProjectRatingModal from './components/ProjectRatingModal';
// import { color } from 'chart.js/helpers';
import {getFeedbackInProject} from './services/feedback.service';
import {projectStatistic} from './services/project.service';
import type {IFeedback , IProjectStatistic} from './interfaces/project.interface';
import dayjs from 'dayjs';
import RatingProject from '../../common/components/RatingProject';



Chart.register(...registerables);
const { Title, Text } = Typography;

const RequestResponse = () => {
  const { pId } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback , setFeedback] = useState<IFeedback[]>([]);
  const [statisticData , setStatisticData] = useState<IProjectStatistic>();
  const fetchFeedback = async () => {
    try {
      const res = await getFeedbackInProject(pId || '');
      console.log(res.data)
      console.log("id ---" , pId);
      setFeedback(res.data);
    } catch (error : any) {
      throw new Error(error.message);
    }
  }

  const fetchProjectStatistic = async () => {
    try {
      const res = await  projectStatistic(pId || '');
      setStatisticData(res.data);
      console.log("data---" , res.data);
    } catch (error : any) {
      throw new Error(error.message);
    }
  }
  useEffect(() => {
    fetchFeedback();
    fetchProjectStatistic();
  } , [])

const totalPhases = statisticData?.pieChart?.phaseNum || 0;
const currentPhase = statisticData?.pieChart?.currentPhase || 0;

// Tạo label cho từng giai đoạn
const progressLabels = Array.from({ length: totalPhases }, (_, i) => `Giai đoạn ${i + 1}`);

// Tạo màu: giai đoạn đã hoàn thành là xanh, chưa hoàn thành là xám
const progressColors = Array.from({ length: totalPhases }, (_, i) =>
  i < currentPhase ? '#1890ff' : '#d9d9d9'
);

// Dữ liệu: giai đoạn đã hoàn thành là 1, chưa hoàn thành là 1 (để Pie chart chia đều)
const progressData = {
  labels: progressLabels,
  datasets: [
    {
      data: Array(totalPhases).fill(1),
      backgroundColor: progressColors,
      borderWidth: 1,
    },
  ],
};

  const lineData = {
    labels: statisticData?.chart.weekLabels,
    datasets: [
      {
        label: 'Báo cáo phía công ty',
        data: statisticData?.chart.pmReportByWeek,
        fill: true,
        borderColor: '#1890ff',
        tension: 0.3,
      },
      {
        label: 'Báo cáo phía khách hàng',
        data: statisticData?.chart.customerReportByWeek,
        fill: true,
        borderColor: '#52c41a',
        tension: 0.3,
      },
    ],
  };
  const handleAddFeedBack = (value : any) => {
    console.log("valuee------" , value);
  }
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
          Dự án: <span style={{ color: '#1890ff' }}>{statisticData?.projectName}</span>
        </Title>

        {/* Grid thông tin khách hàng và thời gian */}
        <Row gutter={24}>
          <Col span={12} style={{ marginBottom: 7 }}>
            <Text strong>Khách hàng:</Text> {statisticData?.customer?.name || '---'}
          </Col>

          <Col span={12} style={{ marginBottom: 7 }}>
            <Text strong>Thời gian bắt đầu:</Text> {dayjs(statisticData?.startDate).format('DD/MM/YYYY')}
          </Col>
          <Col span={12} style={{ marginBottom: 7 }}>
            <Text strong>Quản lý dự án:</Text> {statisticData?.pm?.name || '---'}
          </Col>
          <Col span={12}>
            <Text strong>Thời gian kết thúc (dự kiến):</Text>  {dayjs(statisticData?.estimateDate).format('DD/MM/YYYY')}
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
              Đã hoàn thành: {`${statisticData?.pieChart.currentPhase}/${statisticData?.pieChart.phaseNum}`}
            </div>
          </Card>
        </Col>

        <Col span={16}>
          <Card size="small">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Báo cáo phía công ty"
                  value={statisticData?.pmReportCount}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Báo cáo phía khách hàng"
                  value={statisticData?.customerReportCount}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Số ngày thực hiện"
                  value={statisticData?.daysInProgress}
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
    backgroundColor: '#f6ffed',
    border: '1px solid #b7eb8f',
    borderRadius: 8,
  }}
>
  {feedback && feedback.length > 0 ? (
    feedback.map((fb, idx) => (
      <div
        key={fb._id}
        style={{
          marginBottom: 24,
          borderBottom: idx !== feedback.length - 1 ? '1px solid #e0e0e0' : 'none',
          paddingBottom: 16,
        }}
      >
        {/* Hàng 1: Avatar + Tên khách hàng / Đánh giá sao */}
        <Row gutter={24} style={{ marginBottom: 12 }} align="middle">
          <Col span={12}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size={32} icon={<UserOutlined />} />
              <div>
                <Text strong>Khách hàng:</Text>
                <div>{fb.customerId?.name}</div>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <Text strong>Đánh giá:</Text>
            <div>
              <RatingProject value={Number(fb.rating)} />            
            </div>
          </Col>
        </Row>
        {/* Hàng 2: Nhận xét */}
        <Row style={{ marginBottom: 12 }}>
          <Col span={24}>
            <Text strong>Nhận xét:</Text>
            <div style={{ marginTop: 4 }}>
              {fb.comment || <span style={{ color: '#aaa' }}>Chưa có nhận xét</span>}
            </div>
          </Col>
        </Row>
        {/* Hàng 3: Góp ý thêm */}
        <Row>
          <Col span={24}>
            <Text strong>Góp ý thêm:</Text>
            <div style={{ marginTop: 4 }}>
              {fb.suggest ? fb.suggest : <span style={{ color: '#aaa' }}>Không có</span>}
            </div>
          </Col>
        </Row>
      </div>
    ))
  ) : (
    <div style={{ textAlign: 'center', color: '#aaa', fontStyle: 'italic', padding: 32 }}>
      Khách hàng chưa đánh giá
    </div>
  )}
</Card>

      {/* MODAL ĐÁNH GIÁ */}
      <ProjectRatingModal
        open={isModalOpen}
        onOk={(values) => {
          handleAddFeedBack(values)
           setIsModalOpen(false)
        }}
        onCancel={() => setIsModalOpen(false)}
      />
    </div >

  );
};

export default RequestResponse;
