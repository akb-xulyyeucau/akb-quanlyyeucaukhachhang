import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { IDocument } from '../interfaces/project.interface';
import dayjs from 'dayjs';
import { updateDocument } from '../services/document.service';

interface ModalEditDocumentProps {
  open: boolean;
  onClose: () => void;
  document: IDocument | null;
  onSuccess: () => void;
}

interface ExtendedUploadFile extends UploadFile {
  path?: string;
}

const ModalEditDocument: React.FC<ModalEditDocumentProps> = ({
  open,
  onClose,
  document,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<ExtendedUploadFile[]>([]);
  const [loading, setLoading] = useState(false);

  // Reset form khi document thay đổi
  useEffect(() => {
    if (document) {
      form.setFieldsValue({
        name: document.name,
        day: document.day ? dayjs(document.day) : undefined,
      });

      // Khởi tạo fileList từ document.files
      if (document.files) {
        const initialFiles: ExtendedUploadFile[] = document.files.map(file => ({
          uid: file._id || '-1',
          name: file.originalName,
          status: 'done' as const,
          url: `/document/download/${file.path}`,
          path: file.path,
          type: file.type,
          size: file.size
        }));
        setFileList(initialFiles);
      }
    }
  }, [document, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('day', values.day.toISOString());
      
      // Xử lý files
      // 1. Lọc ra các file cũ còn được giữ lại (chưa bị xóa)
      const remainingOldFiles = fileList
        .filter(file => !file.originFileObj && file.path) // Lọc ra các file cũ
        .map(file => ({
          originalName: file.name,
          path: file.path,
          size: file.size,
          type: file.type
        }));

      // 2. Thêm thông tin file cũ vào formData
      formData.append('existingFiles', JSON.stringify(remainingOldFiles));
      
      // 3. Thêm các file mới
      const newFiles = fileList.filter(file => file.originFileObj);
      newFiles.forEach(file => {
        if (file.originFileObj) {
          formData.append('files', file.originFileObj);
        }
      });

      // 4. Thêm sender ID
      if (document?.sender?._id) {
        formData.append('sender', document.sender._id);
      }

      // Gọi API update
      if (document?._id) {
        await updateDocument(document._id, formData);
        message.success('Cập nhật tài liệu thành công');
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi cập nhật tài liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleBeforeUpload = (file: File) => {
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('File phải nhỏ hơn 10MB!');
      return Upload.LIST_IGNORE;
    }
    return false; // Prevent auto upload
  };

  return (
    <Modal
      title="Chỉnh sửa tài liệu"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Đóng
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Chỉnh sửa
        </Button>
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
      >
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
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item label="Tệp đính kèm">
          <Upload
            beforeUpload={handleBeforeUpload}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList as ExtendedUploadFile[])}
            multiple
            onRemove={(file) => {
              // Xác nhận trước khi xóa file
              if (!file.originFileObj) { // Nếu là file cũ
                Modal.confirm({
                  title: 'Xác nhận xóa file',
                  content: `Bạn có chắc chắn muốn xóa file "${file.name}"?`,
                  onOk() {
                    setFileList(prev => prev.filter(f => f.uid !== file.uid));
                  }
                });
                return false; // Ngăn xóa ngay lập tức
              }
              return true; // Cho phép xóa file mới ngay lập tức
            }}
          >
            <Button icon={<UploadOutlined />}>Chọn file</Button>
          </Upload>
        </Form.Item>

        <Form.Item label="Thông tin người gửi">
          <Input 
            value={document?.sender?.email} 
            disabled 
            addonBefore="Email"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalEditDocument;
