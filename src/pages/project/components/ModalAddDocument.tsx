import { Modal, Form, Input, DatePicker, Button, Upload, message, Progress } from 'antd';
import { PlusOutlined, UploadOutlined, CloseOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import React, { useState } from 'react';
import type { IDocument } from '../interfaces/project.interface';
import { useSelector } from 'react-redux';
import { selectAuthUser } from '../../../common/stores/auth/authSelector';
import { uploadDocument } from '../services/document.service';

interface ModalAddDocumentProps {
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

const removeTempDocumentId = (id: string) => {
  const ids = getTempDocumentIds();
  const filteredIds = ids.filter((tempId: string) => tempId !== id);
  localStorage.setItem(TEMP_DOCUMENT_IDS_KEY, JSON.stringify(filteredIds));
};

// const cleanupTempDocuments = () => {
//   localStorage.removeItem(TEMP_DOCUMENT_IDS_KEY);
// };

const getSafeFileName = (file: File | UploadFile): string => {
  // Lấy tên file gốc
  const originalName = file instanceof File ? file.name : file.originFileObj?.name || file.name;
  
  // Chuyển đổi tên file thành chuỗi UTF-8 an toàn
  const encoder = new TextEncoder();
  const decoder = new TextDecoder('utf-8');
  const bytes = encoder.encode(originalName);
  return decoder.decode(bytes);
};

const ModalAddDocument: React.FC<ModalAddDocumentProps> = ({ open, onClose, onUpload }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const user = useSelector(selectAuthUser);
//   const isAuthenticated = useSelector(selectIsAuthenticated);
  
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
    let documentId = '';
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
        sender: {
          _id: user?._id || '',
          email: user?.email || '',
          role: user?.role || '',
          alias: user?.alias || ''
        },
        files
      };

      const response = await uploadDocument(documentData);
      
      if (response.success && response.data._id) {
        documentId = response.data._id;
        addTempDocumentId(documentId);

        const document: IDocument = {
          ...documentData,
          _id: documentId,
          isTrash: true,
          files: files.map(file => ({
            originalName: getSafeFileName(file),
            path: file.name,
            size: file.size,
            type: file.type,
          }))
        };

        await onUpload(document);
        removeTempDocumentId(documentId);
        handleCleanup();
      } else {
        message.error(response.message || 'Có lỗi xảy ra khi tải lên tài liệu');
      }
    } catch (error: any) {
      console.error('Error in document upload process:', error);
      message.error(error.message || 'Có lỗi xảy ra trong quá trình xử lý');
      if (documentId) {
        removeTempDocumentId(documentId);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = () => {
    form.resetFields();
    setFileList([]);
    setUploadProgress({});
    onClose();
  };

  const handleCancel = () => {
    handleCleanup();
  };

  return (
    <Modal
      title="Thêm tài liệu"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Tải lên"
      cancelText="Đóng"
      confirmLoading={loading}
      okButtonProps={{ 
        icon: <UploadOutlined />,
        disabled: fileList.length === 0 
      }}
      cancelButtonProps={{ 
        icon: <CloseOutlined /> 
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên tài liệu"
          rules={[{ required: true, message: 'Vui lòng nhập tên tài liệu!' }]}
        >
          <Input placeholder="Nhập tên tài liệu" />
        </Form.Item>
        <Form.Item
          name="day"
          label="Ngày"
          rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="Tệp đính kèm" required>
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
            <Button icon={<PlusOutlined />}>Chọn tệp</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalAddDocument;