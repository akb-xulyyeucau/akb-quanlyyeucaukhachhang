import { Modal, Form, Input, DatePicker, Button, Upload, message, Progress } from 'antd';
import { PlusOutlined, UploadOutlined, CloseOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import React, { useState } from 'react';
import type { IDocument } from '../interfaces/project.interface';
import { useSelector } from 'react-redux';
import { selectAuthUser, selectIsAuthenticated } from '../../../common/stores/auth/authSelector';
import { uploadDocument } from '../services/document.service';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

interface ModalUploadDocumentProps {
  open: boolean;
  onClose: () => void;
  onUpload: (document: IDocument) => void;
}

const TEMP_DOCUMENT_IDS_KEY = 'temp_document_ids';

const getTempDocumentIds = (): string[] => {
  const ids = localStorage.getItem(TEMP_DOCUMENT_IDS_KEY);
  return ids ? JSON.parse(ids) : [];
};

const addTempDocumentId = (id: string) => {
  const ids = getTempDocumentIds();
  localStorage.setItem(TEMP_DOCUMENT_IDS_KEY, JSON.stringify([...ids, id]));
};

const getSafeFileName = (file: File | UploadFile): string => {
  // Lấy tên file gốc
  const originalName = file instanceof File ? file.name : file.originFileObj?.name || file.name;
  
  // Chuyển đổi tên file thành chuỗi UTF-8 an toàn
  const encoder = new TextEncoder();
  const decoder = new TextDecoder('utf-8');
  const bytes = encoder.encode(originalName);
  return decoder.decode(bytes);
};

const ModalUploadDocument: React.FC<ModalUploadDocumentProps> = ({ open, onClose, onUpload }) => {
  const { t } = useTranslation('projectRequest');
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const user = useSelector(selectAuthUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const simulateProgress = (fileName: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 99) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: Math.floor(progress)
      }));
    }, 200);

    return () => clearInterval(interval);
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const files = fileList.map(file => {
        if (file.originFileObj) {
          const safeName = getSafeFileName(file);
          return new File(
            [file.originFileObj],
            safeName,
            { type: file.originFileObj.type }
          );
        }
        return null;
      }).filter(Boolean) as File[];
      
      files.forEach(file => {
        simulateProgress(file.name);
      });

      const documentData = {
        name: values.name,
        day: values.day.toDate(),
        sender: isAuthenticated && user && user._id
          ? {
              _id: user._id,
              email: user.email,
              role: user.role,
              alias: user.alias,
            }
          : {
              _id: 'anonymous',
              email: '',
              role: '',
              alias: '',
            },
        files
      };

      const response = await uploadDocument(documentData);
      
      if (response.success) {
        const documentId = response.data._id;
        addTempDocumentId(documentId);

        const document: IDocument = {
          ...documentData,
          _id: documentId,
          files: files.map(file => ({
            originalName: getSafeFileName(file),
            path: file.name,
            size: file.size,
            type: file.type,
          })),
          isTrash: false
        };

        onUpload(document);
        message.success(t('ModalUploadDocument.uploadDocumentSuccess'));
        form.resetFields();
        setFileList([]);
        setUploadProgress({});
        onClose();
      } else {
        message.error(response.message || t('ModalUploadDocument.uploadDocumentError'));
      }
    } catch (error: any) {
      message.error(error.message ||t('ModalUploadDocument.uploadDocumentError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setUploadProgress({});
    onClose();
  };

  return (
    <Modal
      title= {t('ModalUploadDocument.title')}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText= {t('ModalUploadDocument.oktext')}
      cancelText= {t('ModalUploadDocument.canceltext')}
      confirmLoading={loading}
      okButtonProps={{ 
        icon: <UploadOutlined />,
        disabled: fileList.length === 0 
      }}
      cancelButtonProps={{ 
        icon: <CloseOutlined /> 
      }}
    >
      <Form form={form} layout="vertical" initialValues={{
        day: dayjs(),
      }}>
        <Form.Item
          name="name"
          label= {t('ModalUploadDocument.docName')}
          rules={[{ required: true, message: t('ModalUploadDocument.name_required') }]}
        >
          <Input placeholder= {t('ModalUploadDocument.name_placeholder')} />
        </Form.Item>
        <Form.Item
          name="day"
          label= {t('ModalUploadDocument.docUpDay')}
          rules={[{ required: true, message: t('ModalUploadDocument.docUpDay_required') }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label= {t('ModalUploadDocument.attrachment')} required>
          <Upload
            multiple
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
            itemRender={(originNode, file) => (
              <div style={{ marginBottom: 8 }}>
                {originNode}
                {uploadProgress[file.name] !== undefined && (
                  <Progress 
                    percent={uploadProgress[file.name]} 
                    size="small" 
                    status={uploadProgress[file.name] === 100 ? "success" : "active"}
                  />
                )}
              </div>
            )}
          >
            <Button icon={<PlusOutlined />}> {t('ModalUploadDocument.Upload')} </Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalUploadDocument;