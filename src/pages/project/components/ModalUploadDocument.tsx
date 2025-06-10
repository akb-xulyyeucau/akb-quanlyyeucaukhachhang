import { Modal, Form, Input, DatePicker, Button, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import React, { useState } from 'react';
import type { IDocument, IFile } from '../interfaces/project.interface';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../common/stores/store'; // Điều chỉnh path theo cấu trúc store của bạn
 // Điều chỉnh path theo cấu trúc store của bạn

interface ModalUploadDocumentProps {
  open: boolean;
  onClose: () => void;
  onUpload: (document: IDocument) => void;
}

const ModalUploadDocument: React.FC<ModalUploadDocumentProps> = ({ open, onClose, onUpload }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const user = useSelector((state: RootState) => state.auth.user); // Lấy user từ Redux store

  const handleOk = () => {
    form.validateFields().then((values) => {
      const files: IFile[] = fileList.map((file) => ({
        originalName: file.name,
        path: file.uid, // Giả lập path, thay bằng API thực tế
        size: file.size || 0,
        type: file.type || '',
      }));

      const document: IDocument = {
        name: values.name,
        day: values.day.toDate(),
        files,
        sender: user?.id || 'anonymous', // Sử dụng user.id từ userSelector
      };

      onUpload(document);
      form.resetFields();
      setFileList([]);
      onClose();
    });
  };

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
        <Form.Item label="Người gửi" initialValue={user?.id || 'anonymous'}>
          <Input disabled value={user?.id || 'anonymous'} />
        </Form.Item>
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
    </Modal>
  );
};

export default ModalUploadDocument;