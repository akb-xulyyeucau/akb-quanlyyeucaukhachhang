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
  Avatar,
  message

} from 'antd';
import { Line } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import { ArrowLeftOutlined, FileTextOutlined, UserOutlined, ClockCircleOutlined, FileSearchOutlined, StarOutlined } from '@ant-design/icons';
import { Chart, registerables } from 'chart.js';
import { useEffect, useState } from 'react';
import ProjectRatingModal from './components/ProjectRatingModal';
// import { color } from 'chart.js/helpers';
import { addFeedback, getFeedbackInProject } from './services/feedback.service';
import { projectStatistic } from './services/project.service';
import type { IFeedback, IProjectStatistic } from './interfaces/project.interface';
import dayjs from 'dayjs';
import RatingProject from '../../common/components/RatingProject';
import { selectUserProfile } from '../../common/stores/auth/authSelector';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next'; // Đã có sẵn

Chart.register(...registerables);
const { Title, Text } = Typography;

const RequestResponse = () => {
  const { t } = useTranslation('projectResponse'); // Sử dụng namespace 'projectResponse'
  const { pId } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<IFeedback[]>([]);
  const [statisticData, setStatisticData] = useState<IProjectStatistic>();
  const profile = useSelector(selectUserProfile);
  const cId = profile?._id || '';

  const fetchFeedback = async () => {
    try {
      const res = await getFeedbackInProject(pId || '');
      console.log(res.data)
      console.log("id ---", pId);
      setFeedback(res.data);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  const fetchProjectStatistic = async () => {
    try {
      const res = await projectStatistic(pId || '');
      setStatisticData(res.data);
      console.log("data---", res.data);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  useEffect(() => {
    fetchFeedback();
    fetchProjectStatistic();
  }, [])

  const totalPhases = statisticData?.pieChart?.phaseNum || 0;
  const currentPhase = statisticData?.pieChart?.currentPhase || 0;

  // Tạo label cho từng giai đoạn
  const progressLabels = Array.from({ length: totalPhases }, (_, i) => `${t('projectProgress.labelPrefix')} ${i + 1}`);

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
        label: t('projectStatistics.chartCompanyReportLabel'),
        data: statisticData?.chart.pmReportByWeek,
        fill: true,
        borderColor: '#1890ff',
        tension: 0.3,
      },
      {
        label: t('projectStatistics.chartCustomerReportLabel'),
        data: statisticData?.chart.customerReportByWeek,
        fill: true,
        borderColor: '#52c41a',
        tension: 0.3,
      },
    ],
  };

  const handleAddFeedBack = async (value: any) => {
    console.log("Dữ liệu gửi đi:", value);
    try {
      const dataToSend = {
        projectId: pId || '',
        customerId: cId,
        rating: Number(value.rating),
        comment: value.comment,
        suggest: value.suggest,

      };
      await addFeedback(dataToSend);
      message.success(t('messages.feedbackSuccess'));
      await fetchFeedback(); // reload lại danh sách feedback
    } catch (err) {
      message.error(t('messages.feedbackFailed'));
      console.error(err);
    }
    console.log("valuee------", value);
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
              {t('common.backToList')}
            </Button>
            <Button
              icon={<FileSearchOutlined />}
              onClick={() => navigate(`/project/${pId}`)}
            >
              {t('common.viewProjectDetail')}
            </Button>
          </Space>
        </Col>
      </Row>

      {/* TIÊU ĐỀ + NÚT ĐÁNH GIÁ */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            {t('projectOverview.title')}
          </Title>
        </Col>
        <Col>

          <Button type="primary"
            icon={<StarOutlined />}
            onClick={() => setIsModalOpen(true)}>
            {t('projectOverview.rateButton')}
          </Button>
        </Col>
      </Row>

      {/* THÔNG TIN DỰ ÁN */}
      <Card style={{ marginBottom: 15 }}>
        {/* Tiêu đề dự án */}
        <Title level={5} style={{ marginBottom: 12, fontSize: 20 }}>
          {t('common.projectPrefix')}: <span style={{ color: '#1890ff' }}>{statisticData?.projectName}</span>
        </Title>

        {/* Grid thông tin khách hàng và thời gian */}
        <Row gutter={24}>
          <Col span={12} style={{ marginBottom: 7 }}>
            <Text strong>{t('common.customerLabel')}:</Text> {statisticData?.customer?.name || '---'}
          </Col>

          <Col span={12} style={{ marginBottom: 7 }}>
            <Text strong>{t('common.startDateLabel')}:</Text> {dayjs(statisticData?.startDate).format('DD/MM/YYYY')}
          </Col>
          <Col span={12} style={{ marginBottom: 7 }}>
            <Text strong>{t('common.projectManagerLabel')}:</Text> {statisticData?.pm?.name || '---'}
          </Col>
          <Col span={12}>
            <Text strong>{t('common.estimatedEndDateLabel')}:</Text>  {dayjs(statisticData?.estimateDate).format('DD/MM/YYYY')}
          </Col>
        </Row>
      </Card>



      {/* BIỂU ĐỒ & THỐNG KÊ */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card title={t('projectProgress.title')} size="small">
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <Tag color="#1890ff">{t('common.completedTag')}</Tag>
              <Tag color="#d9d9d9">{t('common.notCompletedTag')}</Tag>
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
              {t('projectProgress.completedPhases')}: {`${statisticData?.pieChart.currentPhase}/${statisticData?.pieChart.phaseNum}`}
            </div>
          </Card>
        </Col>

        <Col span={16}>
          <Card size="small">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title={t('projectStatistics.companyReportTitle')}
                  value={statisticData?.pmReportCount}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={t('projectStatistics.customerReportTitle')}
                  value={statisticData?.customerReportCount}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={t('projectStatistics.daysInProgressTitle')}
                  value={statisticData?.daysInProgress}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
            </Row>

            <div style={{ marginTop: 20 }}>
              <Title level={5}>
                <LineChartOutlined style={{ marginRight: 8 }} />
                {t('projectStatistics.reportByTimeTitle')}
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
        title={t('customerFeedback.sectionTitle')}
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
                      <Text strong>{t('customerFeedback.customerLabel')}:</Text>
                      <div>{fb.customerId?.name}</div>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <Text strong>{t('customerFeedback.ratingLabel')}:</Text>
                  <div>
                    <RatingProject value={Number(fb.rating)} disabled={true} />
                  </div>
                </Col>
              </Row>
              {/* Hàng 2: Nhận xét */}
              <Row style={{ marginBottom: 12 }}>
                <Col span={24}>
                  <Text strong>{t('customerFeedback.commentLabel')}:</Text>
                  <div style={{ marginTop: 4 }}>
                    {fb.comment || <span style={{ color: '#aaa' }}>{t('common.noCommentText')}</span>}
                  </div>
                </Col>
              </Row>
              {/* Hàng 3: Góp ý thêm */}
              <Row>
                <Col span={24}>
                  <Text strong>{t('customerFeedback.suggestLabel')}:</Text>
                  <div style={{ marginTop: 4 }}>
                    {fb.suggest ? fb.suggest : <span style={{ color: '#aaa' }}>{t('common.noSuggestText')}</span>}
                  </div>
                </Col>
              </Row>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', color: '#aaa', fontStyle: 'italic', padding: 32 }}>
            {t('customerFeedback.noFeedbackYet')}
          </div>
        )}
      </Card>

      {/* MODAL ĐÁNH GIÁ */}
      <ProjectRatingModal
        open={isModalOpen}
        customerName={statisticData?.customer.name}
        projectName={statisticData?.projectName}

        onOk={(values) => {
          handleAddFeedBack(values)
          setIsModalOpen(false)
        }}
        onCancel={() => setIsModalOpen(false)}
        time={`${dayjs(statisticData?.startDate).format('DD/MM/YYYY')} - ${dayjs(Date.now()).format('DD/MM/YYYY')}`}
      />
    </div >

  );
};

export default RequestResponse;