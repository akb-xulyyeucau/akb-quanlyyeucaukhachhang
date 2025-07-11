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
import { useEffect, useState } from "react";
import { Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;
const { Option } = Select;
import {  selectAuthUser } from '../../common/stores/auth/authSelector';
import { useSelector } from "react-redux";
import { getHomeData } from "./services/home.service";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const [t] = useTranslation('home');
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [topCustomers, setTopCustomers] = useState(3);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const navigate = useNavigate();
  const user = useSelector(selectAuthUser);
  // Mảng các card thông số tổng quan
  const metrics = [
    {
      icon: <FileOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
      label: t("statisticCard.newRequestLabel"),
      value: dashboardData?.newRequests || 0,
      change: null,
      colorStart: '#e6f7ff',
      colorEnd: '#bae7ff',
      route: '/customers-projects-request'
    },
    {
      icon: <FolderOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      label: t("statisticCard.inProgressLabel"),
      value: dashboardData?.inProgressProjects || 0,
      change: null,
      colorStart: '#f9f0ff',
      colorEnd: '#d3adf7',
      route: '/customers-projects'
    },
    {
      icon: <FolderOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
      label: t("statisticCard.completedLabel"),
      value: dashboardData?.completedProjects || 0,
      change: dashboardData?.completedProjectsChange?.percentageChange || 0,
      colorStart: '#fff7e6',
      colorEnd: '#ffd591',
      route: '/customers-projects'
    },
    {
      icon: <FolderOutlined style={{ fontSize: 32, color: '#13c2c2' }} />,
      label: t("statisticCard.totalLabel"),
      value: dashboardData?.totalProjects || 0,
      change: dashboardData?.totalProjectsChange?.percentageChange || 0,
      colorStart: '#e6fffb',
      colorEnd: '#87e8de',
      route: '/customers-projects'
    }
  ];

  const progressData = dashboardData?.projects?.map((project: any) => ({
    name: project.name,
    percent: Math.round((project.currentPhase / (project.totalPhases || 1)) * 100),
    owner: project.pm.name,
    deadline: new Date(project.day).toISOString().split('T')[0]
  })) || [];

  const ratingStats = dashboardData?.ratingStats ? [
    { name: t("customerRatingStatistic.stars.1"), value: dashboardData.ratingStats.oneStar },
    { name: t("customerRatingStatistic.stars.2"), value: dashboardData.ratingStats.twoStar },
    { name: t("customerRatingStatistic.stars.3"), value: dashboardData.ratingStats.threeStar },
    { name: t("customerRatingStatistic.stars.4"), value: dashboardData.ratingStats.fourStar },
    { name: t("customerRatingStatistic.stars.5"), value: dashboardData.ratingStats.fiveStar },
  ] : [];

  // Tính tổng số lượt đánh giá và điểm trung bình
  const totalRatings = dashboardData?.ratingStats?.total || 0;
  const averageRating = ratingStats.reduce((sum, item, index) => sum + (index + 1) * item.value, 0) / (totalRatings || 1);

  // Dữ liệu số lượng phản hồi từ khách hàng
  const allFeedbackStats = dashboardData?.reportStats?.topReporters?.map((reporter: any) => ({
    name: reporter.customerName,
    value: reporter.totalReports
  })) || [];

  // Lấy top khách hàng theo lựa chọn
  const feedbackStats = allFeedbackStats.slice(0, topCustomers);

  // Kiểm tra role để hiển thị phần rating và report
  const canViewStatistics = user?.role === 'admin' || user?.role === 'pm';

  // Hàm render bộ lọc thời gian
  const renderRangePicker = () => {
    const commonProps = {
      style: { width: 140 },
      allowClear: false,
    };
    switch (timeRange) {
      case 'month':
        return (
          <>
            <DatePicker picker="month" placeholder={t("timeFilter.startMonth")} {...commonProps} onChange={setStartDate} />
            <span style={{ margin: '0 6px' }}>→</span>
            <DatePicker picker="month" placeholder={t("timeFilter.endMonth")} {...commonProps} onChange={setEndDate} />
          </>
        );
      case 'quarter':
        return (
          <>
            <DatePicker picker="quarter" placeholder={t("timeFilter.startQuarter")} {...commonProps} onChange={setStartDate} />
            <span style={{ margin: '0 6px' }}>→</span>
            <DatePicker picker="quarter" placeholder={t("timeFilter.endQuarter")} {...commonProps} onChange={setEndDate} />
          </>
        );
      case 'year':
        return (
          <>
            <DatePicker picker="year" placeholder={t("timeFilter.startYear")} {...commonProps} onChange={setStartDate} />
            <span style={{ margin: '0 6px' }}>→</span>
            <DatePicker picker="year" placeholder={t("timeFilter.endYear")} {...commonProps} onChange={setEndDate} />
          </>
        );
      default:
        return null;
    }
  };

  // Tooltip tuỳ chỉnh cho biểu đồ tiến độ dự án
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string; }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ background: '#fff', padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>
          <p><strong>{label}</strong></p>
          <p>{t("tooltip.progress")}: {data.percent}%</p>
          <p>{t("tooltip.owner")}: {data.owner}</p>
        </div>
      );
    }
    return null;
  };
  // Xử lý chuyển hướng khi click vào cột dự án
  const fetchHomeData = async () => {
    try {
      const response = await getHomeData(user?.role || '', timeRange, startDate?.format('YYYY-MM-DD') || '', endDate?.format('YYYY-MM-DD') || '');
      setDashboardData(response.data);
    } catch (error) {
      console.error(t("error.fetchData"), error);
    }
  }

  useEffect(() => {
    fetchHomeData();
  }, [timeRange, startDate, endDate]);

  return (
    <Card style={{ padding: '15px 15px', minHeight: '100vh', marginTop: 20 }}>

      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        {/* <Title level={3} style={{ margin: 0 }}>{t("pageTitle")}</Title> */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Select
            value={timeRange}
            style={{ width: 140 }}
            onChange={(value) => {
              setTimeRange(value);
              setStartDate(null);
              setEndDate(null);
            }}
          >
            <Option value="month">{t("timeFilter.byMonth")}</Option>
            <Option value="quarter">{t("timeFilter.byQuarter")}</Option>
            <Option value="year">{t("timeFilter.byYear")}</Option>
          </Select>
          {renderRangePicker()}
          <AntTooltip title={t("timeFilter.refresh")}>
            {/* <ReloadOutlined
              style={{ fontSize: 20, cursor: 'pointer' }}
              onClick={fetchHomeData}
            /> */}
          </AntTooltip>
        </div>
      </Row>

      {/* Các card thông số tổng quan */}
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
              md={12}
              lg={Math.floor(24 / metrics.length)}
              xl={Math.floor(24 / metrics.length)}
              style={{ minWidth: "20%" }} // nhỏ nhất vẫn giữ được bố cục
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
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
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

      {/* Biểu đồ tiến độ dự án */}
      <Card title={<Text strong style={{ fontSize: 16 }}>{t("progressBar.title")}</Text>} style={{ marginBottom: 32, borderRadius: 16 }} bodyStyle={{ padding: 14, background: '#fff' }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={progressData} >
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
        {canViewStatistics && (
          <>
            {/* Card tỉ lệ đánh giá từ khách hàng */}
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
                        <Text strong style={{ fontSize: 18, marginBottom: 25 }}>{t("customerRatingStatistic.title")}</Text>
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
                          <Text type="secondary" style={{ fontSize: 14, marginBottom: 5, display: 'inline-block' }}>
                            {t("customerRatingStatistic.averageRating")}
                          </Text>
                          <br />
                          <Text strong>{totalRatings}</Text>{" "} {t("customerRatingStatistic.ratingsRecorded")}
                        </div>

                        {/* Chú thích màu cho các mức sao */}
                        <div style={{ marginTop: 10, marginLeft: 35 }}>
                          <Row gutter={8}>
                            <Col span={12}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <div style={{ width: 16, height: 16, backgroundColor: '#1890FF', borderRadius: 2, marginRight: 8 }}></div>
                                  <Text style={{ fontSize: 14 }}>{t("customerRatingStatistic.legend.5stars")}</Text>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <div style={{ width: 16, height: 16, backgroundColor: '#FADB14', borderRadius: 2, marginRight: 8 }}></div>
                                  <Text style={{ fontSize: 14 }}>{t("customerRatingStatistic.legend.3stars")}</Text>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <div style={{ width: 16, height: 16, backgroundColor: '#FF4D4F', borderRadius: 2, marginRight: 8 }}></div>
                                  <Text style={{ fontSize: 14 }}>{t("customerRatingStatistic.legend.1stars")}</Text>
                                </div>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <div style={{ width: 16, height: 16, backgroundColor: '#52C41A', borderRadius: 2, marginRight: 8 }}></div>
                                  <Text style={{ fontSize: 14 }}>{t("customerRatingStatistic.legend.4stars")}</Text>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <div style={{ width: 16, height: 16, backgroundColor: '#FAAD14', borderRadius: 2, marginRight: 8 }}></div>
                                  <Text style={{ fontSize: 14 }}>{t("customerRatingStatistic.legend.2stars")}</Text>
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      </div>
                    </Col>
                    {/* Biểu đồ tròn tỉ lệ đánh giá */}
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

            {/* Card số lượng báo cáo từ khách hàng */}
            <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
              <Card
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: 16 }}>{t("customerReportStatistic.title")}</Text>
                    <Select
                      value={topCustomers}
                      style={{ width: 150 }}
                      onChange={(value) => setTopCustomers(value)}
                    >
                      <Option value={3}>{t("customerReportStatistic.top3")}</Option>
                      <Option value={5}>{t("customerReportStatistic.top5")}</Option>
                      <Option value={7}>{t("customerReportStatistic.top7")}</Option>
                    </Select>
                  </div>
                }
                bodyStyle={{ padding: 24, background: '#fff', height: '100%', display: 'flex', flexDirection: 'column' }}
                style={{ borderRadius: 16, height: '100%', display: 'flex', flex: 1, flexDirection: 'column' }}
              >
                {/* Biểu đồ cột ngang số lượng báo cáo */}
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={feedbackStats} layout="vertical" margin={{ right: 50, left: 0, top: 0, bottom: 0 }}>
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={110} />
                    <Tooltip
                      isAnimationActive={false}
                      position={undefined} />
                    <Bar dataKey="value" fill="#9254de">
                      <LabelList dataKey="value" position="right" offset={16} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </>
        )}
      </Row>

    </Card >
  );
};

export default Dashboard;