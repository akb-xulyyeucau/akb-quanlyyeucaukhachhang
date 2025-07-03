import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Upload, Space, Card, Typography, message, Progress } from 'antd';
import { PlusOutlined, MinusCircleOutlined, UploadOutlined, FilePdfOutlined, FileOutlined } from '@ant-design/icons';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';
import type { ItemRender } from 'antd/es/upload/interface';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

interface ReportFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  title: string;
}

interface FileWithGlobalIndex extends Omit<UploadFile, 'originFileObj'> {
  globalIndex?: number;
  originFileObj?: RcFile;
}

interface FileListType {
  [key: string]: FileWithGlobalIndex[];
}

interface FileProgress {
  [key: string]: number;
}

const ReportFormModal: React.FC<ReportFormModalProps> = ({
  open,
  onCancel,
  onSubmit,
  title
}) => {
  const { t } = useTranslation('projectDetail');

  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<FileListType>({});
  const [uploadProgress, setUploadProgress] = useState<FileProgress>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setFileList({});
      setUploadProgress({});
      setIsSubmitting(false);
      setIsUploading(false);
    }
  }, [open, form]);

  // Check if any file is still uploading
  useEffect(() => {
    const hasUploadingFiles = Object.values(uploadProgress).some(progress => progress < 100);
    setIsUploading(hasUploadingFiles);
  }, [uploadProgress]);

  // Convert size to readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get icon based on file type
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FilePdfOutlined />;
    return <FileOutlined />;
  };

  const handleFileChange = (index: number, info: any) => {
    console.log('File change event:', info);

    // Simulate upload progress for new files
    info.fileList.forEach((file: UploadFile) => {
      if (file.originFileObj && !uploadProgress[file.uid]) {
        simulateProgress(file.uid);
      }
    });

    // Map the files to maintain both new and existing files
    const updatedFiles = info.fileList.map((file: UploadFile): FileWithGlobalIndex => ({
      ...file,
      status: uploadProgress[file.uid] >= 100 ? 'done' : 'uploading',
      originFileObj: file.originFileObj
    }));

    console.log('Updated files for index', index, ':', updatedFiles);

    // Update fileList and recalculate global indices
    setFileList(prev => {
      const newFileList: FileListType = {
        ...prev,
        [index]: updatedFiles
      };

      // Calculate global index for display purposes
      let globalIndex = 0;
      Object.keys(newFileList).sort((a, b) => Number(a) - Number(b)).forEach(subContentIndex => {
        newFileList[subContentIndex] = newFileList[subContentIndex].map(file => ({
          ...file,
          globalIndex: globalIndex++
        }));
      });

      return newFileList;
    });
  };

  const simulateProgress = (fileId: string) => {
    let percent = 0;
    const interval = setInterval(() => {
      if (percent >= 100) {
        clearInterval(interval);
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: 100
        }));
      } else {
        percent += Math.floor(Math.random() * 20) + 10;
        percent = Math.min(percent, 100);
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: percent
        }));
      }
    }, 200);
  };

  // Update the Upload component props
  const uploadProps = {
    beforeUpload: (file: File) => {
      const isLt50M = file.size / 1024 / 1024 < 50;
      if (!isLt50M) {
        message.error(t('ReportFormModal.fileSizeError'));
        return Upload.LIST_IGNORE;
      }
      console.log('File passed validation:', file);
      return false; // Prevent auto upload
    },
    multiple: true,
    maxCount: 5,
    accept: '.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar',
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      // Transform fileList into the form values
      const formValues = {
        ...values,
        subContent: values.subContent.map((content: any, index: number) => ({
          ...content,
          files: fileList[index] || []
        }))
      };
      console.log('Submitting form with values:', formValues);
      await onSubmit(formValues);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderUploadItem: ItemRender = (_originNode, file: FileWithGlobalIndex, _fileList, actions) => (
    <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
      {getFileIcon(file.type || '')}
      <Space direction="vertical" size={0} style={{ marginLeft: 8, flex: 1 }}>
        <Text strong>
          {file.name}
          {typeof file.globalIndex === 'number' && (
            <Text type="secondary"> ({t('ReportFormModal.fileNumber', { number: file.globalIndex })})</Text>
          )}
        </Text>
        <div style={{ width: '100%' }}>
          {uploadProgress[file.uid] < 100 ? (
            <Progress percent={uploadProgress[file.uid] || 0} size="small" />
          ) : (
            <Text type="secondary">
              {formatFileSize(file.size || 0)} | {file.type || t('ReportFormModal.unknownType')}
            </Text>
          )}
        </div>
      </Space>
      <Space>
        {actions.remove && <Button type="link" danger size="small" onClick={actions.remove}>{t('ReportFormModal.delete')}</Button>}
      </Space>
    </div>
  );

  return (
    <Modal
      open={open}
      title={title}
      onCancel={onCancel}
      width={800}
      footer={null}
      closable={!isUploading && !isSubmitting}
      maskClosable={!isUploading && !isSubmitting}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="mainContent"
          label={t('ReportFormModal.mainContent')}
          rules={[{ required: true, message: t('ReportFormModal.mainContentRequired') }]}
        >
          <Input.TextArea
            rows={4}
            placeholder={t('ReportFormModal.mainContentPlaceholder')}
            disabled={isUploading || isSubmitting}
          />
        </Form.Item>

        <Form.List
          name="subContent"
          initialValue={[{}]}
        >
          {(fields, { add, remove }) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {fields.map((field, index) => (
                <Card
                  key={field.key}
                  size="small"
                  title={t('ReportFormModal.subContentTitle', { number: index + 1 })}
                  extra={
                    fields.length > 1 && (
                      <MinusCircleOutlined
                        onClick={() => {
                          if (!isUploading && !isSubmitting) {
                            remove(field.name);
                            const newFileList = { ...fileList };
                            delete newFileList[index];
                            setFileList(newFileList);
                          }
                        }}
                        style={{ cursor: isUploading || isSubmitting ? 'not-allowed' : 'pointer' }}
                      />
                    )
                  }
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item
                      {...field}
                      name={[field.name, 'contentName']}
                      rules={[{ required: true, message: t('ReportFormModal.contentNameRequired') }]}
                    >
                      <Input
                        placeholder={t('ReportFormModal.contentNamePlaceholder')}
                        disabled={isUploading || isSubmitting}
                      />
                    </Form.Item>

                    <Form.Item
                      {...field}
                      name={[field.name, 'files']}
                      valuePropName="fileList"
                      getValueFromEvent={(e) => e.fileList}
                    >
                      <Upload
                        {...uploadProps}
                        onChange={(info) => handleFileChange(index, info)}
                        fileList={fileList[index] || []}
                        listType="text"
                        itemRender={renderUploadItem}
                        disabled={isUploading || isSubmitting}
                      >
                        <Button
                          icon={<UploadOutlined />}
                          disabled={isUploading || isSubmitting}
                        >
                          {t('ReportFormModal.uploadAttachment')}
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Space>
                </Card>
              ))}

              <Button
                type="dashed"
                onClick={() => !isUploading && !isSubmitting && add()}
                block
                icon={<PlusOutlined />}
                disabled={isUploading || isSubmitting}
              >
                {t('ReportFormModal.addSubContent')}
              </Button>
            </div>
          )}
        </Form.List>

        <Form.Item style={{ marginTop: 16, textAlign: 'right' }}>
          <Space>
            <Button
              onClick={onCancel}
              disabled={isUploading || isSubmitting}
            >
              {t('ReportFormModal.cancel')}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              disabled={isUploading}
            >
              {isUploading ? t('ReportFormModal.uploadingFiles') : t('ReportFormModal.addNew')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReportFormModal;