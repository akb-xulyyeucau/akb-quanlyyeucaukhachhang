import { Modal, Form, Input, DatePicker, Button, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import React, { useState } from 'react';
import type { IDocument, IFile } from '../interfaces/project.interface';
import { useSelector } from 'react-redux';
import { selectAuthUser, selectIsAuthenticated } from '../../../common/stores/auth/authSelector';
import { uploadDocument } from '../services/document.service';

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

const ModalUploadDocument: React.FC<ModalUploadDocumentProps> = ({ open, onClose, onUpload }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const user = useSelector(selectAuthUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const files = fileList.map(file => file.originFileObj).filter(Boolean) as File[];
      
      const documentData = {
        name: values.name,
        day: values.day.toDate(),
        sender: isAuthenticated && user?._id ? user._id : 'anonymous',
        files
      };

      const response = await uploadDocument(documentData);
      
      if (response.success) {
        const documentId = response.data._id;
        // Lưu document ID vào localStorage
        addTempDocumentId(documentId);

        const document: IDocument = {
          ...documentData,
          _id: documentId,
          files: files.map(file => ({
            originalName: file.name,
            path: file.name,
            size: file.size,
            type: file.type,
          }))
        };

        onUpload(document);
        message.success('Tài liệu đã được tải lên thành công');
        form.resetFields();
        setFileList([]);
        onClose();
      } else {
        message.error(response.message || 'Có lỗi xảy ra khi tải lên tài liệu');
      }
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi tải lên tài liệu');
    } finally {
      setLoading(false);
    }
  };
  
  const handleClick = () => {
    console.log("Authentication status:", isAuthenticated);
    console.log("User data:", user?._id);
  }
  return (
    <Modal
      title="Thêm tài liệu"
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        setFileList([]);
        onClose();
      }}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={loading}
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
        {/* <Form.Item label="Người gửi" initialValue={user?.id || 'anonymous'}>
          <Input disabled value={user?.id || 'anonymous'} />
        </Form.Item> */}
        <Form.Item label="Tệp đính kèm">
          <Upload
            multiple
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
          >
            <Button icon={<PlusOutlined />}>Chọn tệp</Button>
          </Upload>
        </Form.Item>
      </Form>
      <Button onClick={handleClick}>test</Button>
    </Modal>
  );
};

export default ModalUploadDocument;