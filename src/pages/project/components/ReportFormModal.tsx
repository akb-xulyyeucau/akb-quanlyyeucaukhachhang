import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Upload, Space, Card, Typography } from 'antd';
import { PlusOutlined, MinusCircleOutlined, UploadOutlined, FilePdfOutlined, FileOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { ItemRender } from 'antd/es/upload/interface';
import type { IReport, ISubContent, IFile } from '../interfaces/project.interface';

const { Text } = Typography;

interface ReportFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialValues?: IReport;
  title?: string;
}

const ReportFormModal: React.FC<ReportFormModalProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  title = 'Thêm báo cáo'
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<{ [key: string]: UploadFile[] }>({});
  const [originalFiles, setOriginalFiles] = useState<{ [key: string]: IFile[] }>({});

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setFileList({});
      setOriginalFiles({});
    }
  }, [open, form]);

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

  // Set initial values when editing
  useEffect(() => {
    if (initialValues && open) {
      console.log('Initial values:', initialValues); // Debug log
      const initialFileList: { [key: string]: UploadFile[] } = {};
      const initialOriginalFiles: { [key: string]: IFile[] } = {};
      
      if (initialValues.subContent && Array.isArray(initialValues.subContent)) {
        initialValues.subContent.forEach((subContent, index) => {
          if (subContent.files && Array.isArray(subContent.files)) {
            initialFileList[index] = subContent.files.map(file => ({
              uid: file._id || `-${index}`,
              name: file.originalName,
              status: 'done',
              url: file.path,
              size: file.size,
              type: file.type
            }));
            initialOriginalFiles[index] = subContent.files;
          }
        });
      }
      
      setFileList(initialFileList);
      setOriginalFiles(initialOriginalFiles);

      // Set form values
      const formValues = {
        mainContent: initialValues.mainContent,
        subContent: initialValues.subContent?.map((content, index) => ({
          _id: content._id,
          contentName: content.contentName,
          files: initialFileList[index] || []
        }))
      };
      
      console.log('Setting form values:', formValues); // Debug log
      form.setFieldsValue(formValues);
    }
  }, [initialValues, open, form]);

  const handleSubmit = (values: any) => {
    console.log('Submitting values:', values); // Debug log
    const formattedValues = {
      ...values,
      subContent: values.subContent?.map((content: any, index: number) => {
        const currentFiles = fileList[index] || [];
        
        return {
          _id: content._id,
          contentName: content.contentName,
          files: currentFiles.map((file, fileIndex) => ({
            originalName: file.name,
            path: file.url || '',
            size: file.size || 0,
            type: file.type || '',
            index: fileIndex
          }))
        };
      }) || []
    };
    console.log('Formatted values:', formattedValues); // Debug log
    onSubmit(formattedValues);
  };

  const handleFileChange = (index: number, info: any) => {
    console.log('File change at index', index, ':', info.fileList); // Debug log
    setFileList(prev => ({
      ...prev,
      [index]: info.fileList.map((file: UploadFile) => ({
        ...file,
        status: 'done'
      }))
    }));
  };

  const renderUploadItem: ItemRender = (originNode, file, fileList, actions) => (
    <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
      {getFileIcon(file.type || '')}
      <Space direction="vertical" size={0} style={{ marginLeft: 8, flex: 1 }}>
        <Text strong>{file.name}</Text>
        <Text type="secondary">
          {formatFileSize(file.size || 0)} | {file.type || 'Unknown type'}
        </Text>
      </Space>
      <Space>
        {actions.download && <Button type="link" size="small" onClick={actions.download}>Tải xuống</Button>}
        {actions.remove && <Button type="link" danger size="small" onClick={actions.remove}>Xóa</Button>}
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
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="mainContent"
          label="Nội dung chính"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung chính' }]}
        >
          <Input.TextArea rows={4} placeholder="Nhập nội dung chính của báo cáo" />
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
                  title={`Nội dung phụ ${index + 1}`}
                  extra={
                    fields.length > 1 && (
                      <MinusCircleOutlined onClick={() => {
                        remove(field.name);
                        const newFileList = { ...fileList };
                        const newOriginalFiles = { ...originalFiles };
                        delete newFileList[index];
                        delete newOriginalFiles[index];
                        setFileList(newFileList);
                        setOriginalFiles(newOriginalFiles);
                      }} />
                    )
                  }
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item
                      {...field}
                      name={[field.name, '_id']}
                      hidden
                    >
                      <Input />
                    </Form.Item>
                    
                    <Form.Item
                      {...field}
                      name={[field.name, 'contentName']}
                      rules={[{ required: true, message: 'Vui lòng nhập tên nội dung' }]}
                    >
                      <Input placeholder="Tên nội dung" />
                    </Form.Item>

                    <Form.Item
                      {...field}
                      name={[field.name, 'files']}
                      valuePropName="fileList"
                      getValueFromEvent={(e) => e.fileList}
                    >
                      <Upload
                        multiple
                        beforeUpload={() => false}
                        onChange={(info) => handleFileChange(index, info)}
                        fileList={fileList[index] || []}
                        listType="text"
                        itemRender={renderUploadItem}
                      >
                        <Button icon={<UploadOutlined />}>Tải lên tệp đính kèm</Button>
                      </Upload>
                    </Form.Item>
                  </Space>
                </Card>
              ))}

              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                Thêm nội dung phụ
              </Button>
            </div>
          )}
        </Form.List>

        <Form.Item style={{ marginTop: 16, textAlign: 'right' }}>
          <Space>
            <Button onClick={onCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              {initialValues ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReportFormModal;
