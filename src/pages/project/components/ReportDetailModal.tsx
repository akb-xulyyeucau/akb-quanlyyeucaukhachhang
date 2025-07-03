import React from 'react';
import { Modal, Typography, Card, Space, Tag, List } from 'antd';
import type { IReport, IFile } from '../interfaces/project.interface';
import dayjs from 'dayjs';
import FileText from '../../../common/components/FileText';
import { useTranslation } from 'react-i18next';

const { Text, Title } = Typography;

interface ReportDetailModalProps {
  open: boolean;
  onCancel: () => void;
  report: IReport | null;
}

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  open,
  onCancel,
  report
}) => {
  const { t } = useTranslation('projectDetail');

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!report) return null;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={t('ReportDetailModal.title')}
      width={800}
      footer={null}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Basic Information */}
        <Card size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Text strong>{t('ReportDetailModal.projectCode')}:</Text>
              <Tag>{report.projectId.alias}</Tag>
            </Space>
            <Space>
              <Text strong>{t('ReportDetailModal.projectName')}:</Text>
              <Text>{report.projectId.name}</Text>
            </Space>
            <Space>
              <Text strong>{t('ReportDetailModal.mainContent')}:</Text>
              <Text>{report.mainContent}</Text>
            </Space>
            <Space>
              <Text strong>{t('ReportDetailModal.creator')}:</Text>
              <Tag color={report.sender.role === 'guest' ? 'green' : 'blue'}>
                {report.sender.email}
              </Tag>
            </Space>
            <Space>
              <Text strong>{t('ReportDetailModal.createdDate')}:</Text>
              <Text>{dayjs(report.createdAt).format('DD/MM/YYYY')}</Text>
            </Space>
          </Space>
        </Card>

        {/* Subcontent List */}
        <div>
          <Title level={5}>{t('ReportDetailModal.detailContent')}</Title>
          <List
            dataSource={report.subContent}
            renderItem={(item, index) => (
              <Card
                size="small"
                title={`${index + 1}. ${item.contentName}`}
                style={{ marginBottom: 16 }}
              >
                <List
                  dataSource={item.files}
                  renderItem={(file: IFile) => (
                    <List.Item>
                      <Space>
                        <FileText
                          originalName={file.originalName}
                          filePath={file.path}
                        />
                        <Text type="secondary">({formatFileSize(file.size)})</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            )}
          />
        </div>
      </Space>
    </Modal>
  );
};

export default ReportDetailModal;